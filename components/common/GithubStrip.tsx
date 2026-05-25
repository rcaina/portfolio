import Link from "next/link";
import SectionHeading from "./SectionHeading";

const GITHUB_USER = "rcaina";

type GhEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    commits?: { sha: string; message: string }[];
    action?: string;
    ref?: string;
    ref_type?: string;
    pull_request?: { number: number; title: string; html_url: string };
    issue?: { number: number; title: string; html_url: string };
  };
};

async function fetchEvents(): Promise<GhEvent[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`,
      {
        next: { revalidate: 600 },
        headers: { Accept: "application/vnd.github+json" },
      }
    );
    if (!res.ok) return null;
    return (await res.json()) as GhEvent[];
  } catch {
    return null;
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.floor(d / 30);
  return `${mo}mo`;
}

function summarize(ev: GhEvent): { verb: string; target: string } | null {
  const repo = ev.repo.name;
  switch (ev.type) {
    case "PushEvent": {
      const n = ev.payload.commits?.length ?? 0;
      if (n === 0) return null;
      return {
        verb: `pushed ${n} commit${n === 1 ? "" : "s"} to`,
        target: repo,
      };
    }
    case "PullRequestEvent": {
      const action = ev.payload.action ?? "updated";
      return {
        verb: `${action} PR in`,
        target: repo,
      };
    }
    case "IssuesEvent": {
      return {
        verb: `${ev.payload.action ?? "updated"} issue in`,
        target: repo,
      };
    }
    case "CreateEvent": {
      const what = ev.payload.ref_type ?? "ref";
      return { verb: `created ${what} in`, target: repo };
    }
    case "PullRequestReviewEvent":
      return { verb: "reviewed PR in", target: repo };
    case "ReleaseEvent":
      return { verb: "released in", target: repo };
    default:
      return null;
  }
}

export default async function GithubStrip() {
  const events = await fetchEvents();

  return (
    <section
      id="activity"
      aria-labelledby="activity-title"
      className="flex w-full max-w-3xl scroll-mt-12 flex-col gap-6 px-4 md:scroll-mt-14"
    >
      <SectionHeading
        id="activity-title"
        label="activity"
        number="00"
        command="git log"
      />
      <div className="rounded-md border border-foreground/10 bg-foreground/[0.015]">
        {!events || events.length === 0 ? (
          <div className="px-4 py-4 font-mono text-xs text-muted-foreground sm:px-5">
            <span aria-hidden className="text-brand">
              ›
            </span>{" "}
            No recent activity available.
          </div>
        ) : (
          <ul className="divide-y divide-foreground/5">
            {events
              .map((ev) => ({ ev, s: summarize(ev) }))
              .filter(
                (
                  x
                ): x is { ev: GhEvent; s: { verb: string; target: string } } =>
                  x.s !== null
              )
              .slice(0, 6)
              .map(({ ev, s }) => (
                <li
                  key={ev.id}
                  className="flex items-baseline gap-3 px-4 py-2.5 font-mono text-xs sm:px-5 sm:text-sm"
                >
                  <time
                    dateTime={ev.created_at}
                    className="w-10 flex-shrink-0 text-muted-foreground"
                  >
                    {relativeTime(ev.created_at)}
                  </time>
                  <span className="text-foreground/85">{s.verb}</span>
                  <Link
                    href={`https://github.com/${s.target}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-brand hover:text-brand-muted hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    {s.target}
                  </Link>
                </li>
              ))}
          </ul>
        )}
        <div className="flex items-center justify-between border-t border-foreground/10 px-4 py-2 font-mono text-[10px] text-muted-foreground sm:px-5">
          <span>updates every 10 min, via GitHub API</span>
          <Link
            href={`https://github.com/${GITHUB_USER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground focus:outline-none focus-visible:underline"
          >
            @{GITHUB_USER} ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
