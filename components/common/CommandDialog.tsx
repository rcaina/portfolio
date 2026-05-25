"use client";

import { Command } from "cmdk";
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  FolderIcon,
  HomeIcon,
  MoonIcon,
  PaperAirplaneIcon,
  SquaresPlusIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";
import { socialLinks } from "@/lib/constants";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;
type Mode = "menu" | "chat";
type ChatMessage = { role: "user" | "ai"; content: string };

interface Props {
  onClose: () => void;
  modKey: string;
  mounted: boolean;
}

const SECTIONS: { id: string; label: string; icon: IconType }[] = [
  { id: "hero", label: "Home", icon: HomeIcon },
  { id: "experience", label: "Experience", icon: BriefcaseIcon },
  { id: "projects", label: "Projects", icon: FolderIcon },
  { id: "other-projects", label: "Other Projects", icon: SquaresPlusIcon },
  { id: "education", label: "Education", icon: AcademicCapIcon },
];

const GROUP_HEADING_CLASS =
  "text-xs font-normal text-muted-foreground [&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:gap-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:lowercase [&_[cmdk-group-heading]]:tracking-tight [&_[cmdk-group-heading]]:before:text-brand/70 [&_[cmdk-group-heading]]:before:content-['#']";

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function CommandDialog({ onClose, modKey, mounted }: Props) {
  const [mode, setMode] = useState<Mode>("menu");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mode === "chat") {
          e.preventDefault();
          setMode("menu");
          setQuery("");
        } else {
          e.preventDefault();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onClose]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const container = dialogRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !container) return;
      const items = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !container.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (
        !e.shiftKey &&
        (active === last || !container.contains(active))
      ) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  useEffect(() => {
    if (mode === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, mode]);

  const runAction = useCallback(
    (fn: () => void) => {
      fn();
      onClose();
    },
    [onClose]
  );

  const sendChat = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setQuery("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = (await res.json()) as { reply?: string };
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.reply ?? "No response." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Network error. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const copyEmail = () =>
    runAction(() => {
      void navigator.clipboard.writeText("renzo.caina@outlook.com");
    });

  const isDark = theme === "dark";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cmd-palette-title"
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh] sm:pt-[15vh]"
    >
      <div
        role="presentation"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
      />

      <Command
        label="Command palette"
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-foreground/20 bg-popover shadow-2xl"
        loop
      >
        <h2 id="cmd-palette-title" className="sr-only">
          Command palette
        </h2>

        <div className="flex items-center gap-2 border-b border-foreground/10 px-3">
          {mode === "chat" && (
            <button
              type="button"
              onClick={() => {
                setMode("menu");
                setQuery("");
              }}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              aria-label="Back to menu"
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            </button>
          )}
          <span
            aria-hidden
            className="select-none font-mono text-xs text-muted-foreground"
          >
            {mode === "chat" ? (
              <>
                <span className="text-brand">ai</span>{" "}
                <span className="text-brand">$</span>
              </>
            ) : (
              <span className="text-brand">$</span>
            )}
          </span>
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (mode === "chat" && e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendChat(query);
              }
            }}
            placeholder={
              mode === "chat"
                ? "Ask about my work, stack, projects..."
                : "Type a command or search..."
            }
            className="flex-1 bg-transparent py-3.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {mode === "menu" ? (
          <Command.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="px-3 py-6 text-center font-mono text-sm text-muted-foreground">
              No matches found.
            </Command.Empty>

            <Command.Group heading="navigate" className={GROUP_HEADING_CLASS}>
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <PaletteItem
                  key={id}
                  value={`nav-${id}-${label}`}
                  onSelect={() => runAction(() => scrollToSection(id))}
                  icon={Icon}
                  label={label}
                />
              ))}
            </Command.Group>

            <Command.Group heading="actions" className={GROUP_HEADING_CLASS}>
              <PaletteItem
                value="action-resume-view-pdf"
                onSelect={() =>
                  runAction(() =>
                    window.open(
                      "/files/renzo_caina.pdf",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  )
                }
                icon={DocumentTextIcon}
                label="View Resume"
                hint="opens PDF"
              />
              <PaletteItem
                value="action-email-copy"
                onSelect={copyEmail}
                icon={EnvelopeIcon}
                label="Copy Email"
                hint="renzo.caina@outlook.com"
              />
              <PaletteItem
                value="action-theme-toggle"
                onSelect={() => setTheme(isDark ? "light" : "dark")}
                icon={mounted && isDark ? SunIcon : MoonIcon}
                label={
                  mounted
                    ? isDark
                      ? "Switch to Light Mode"
                      : "Switch to Dark Mode"
                    : "Toggle Theme"
                }
              />
            </Command.Group>

            <Command.Group heading="ask" className={GROUP_HEADING_CLASS}>
              <PaletteItem
                value="ask-ai-chat-open"
                onSelect={() => {
                  setMode("chat");
                  setQuery("");
                }}
                icon={ChatBubbleLeftRightIcon}
                label="Ask AI about my work"
                hint="powered by GPT-4o-mini"
              />
            </Command.Group>

            <Command.Group heading="links" className={GROUP_HEADING_CLASS}>
              {socialLinks.map((s) => (
                <PaletteItem
                  key={s.name}
                  value={`link-${s.name}`}
                  onSelect={() =>
                    runAction(() =>
                      window.open(s.link, "_blank", "noopener,noreferrer")
                    )
                  }
                  icon={ArrowUpRightIcon}
                  label={s.name}
                  hint={s.link.replace(/^https?:\/\//, "")}
                />
              ))}
            </Command.Group>
          </Command.List>
        ) : (
          <div className="flex max-h-[60vh] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="space-y-2 font-mono text-xs text-muted-foreground">
                  <p className="text-foreground">
                    <span aria-hidden className="text-brand">
                      $
                    </span>{" "}
                    Ask anything about Renzo&apos;s work, stack, or projects.
                  </p>
                  <p>Try:</p>
                  <ul className="space-y-1 pl-3">
                    <li>
                      <span aria-hidden className="text-brand">
                        ›
                      </span>{" "}
                      What did you build at Renew Biotechnologies?
                    </li>
                    <li>
                      <span aria-hidden className="text-brand">
                        ›
                      </span>{" "}
                      What&apos;s your strongest stack?
                    </li>
                    <li>
                      <span aria-hidden className="text-brand">
                        ›
                      </span>{" "}
                      Tell me about Ronin.
                    </li>
                  </ul>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className="font-mono text-sm leading-relaxed">
                  <div className="mb-0.5 text-xs text-muted-foreground">
                    {m.role === "user" ? (
                      <span className="text-brand">you</span>
                    ) : (
                      <span className="text-foreground">ai</span>
                    )}
                  </div>
                  <div
                    className={
                      m.role === "user"
                        ? "whitespace-pre-wrap break-words text-foreground"
                        : "whitespace-pre-wrap break-words text-foreground/90"
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="font-mono text-sm text-muted-foreground">
                  <span className="inline-block animate-pulse">thinking…</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-foreground/10 px-3 py-2">
              <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                <span>↵ send · esc back · {modKey} K close</span>
                <button
                  type="button"
                  onClick={() => void sendChat(query)}
                  disabled={!query.trim() || loading}
                  className="flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-foreground transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:opacity-40"
                  aria-label="Send"
                >
                  <PaperAirplaneIcon className="h-3.5 w-3.5" aria-hidden />
                  send
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="hidden items-center justify-between border-t border-foreground/10 px-3 py-2 font-mono text-[10px] text-muted-foreground sm:flex">
          <span>↑↓ navigate · ↵ select · esc close</span>
          <span className="text-foreground/60">renzo.caina/portfolio</span>
        </div>
      </Command>
    </div>
  );
}

function PaletteItem({
  value,
  onSelect,
  icon: Icon,
  label,
  hint,
}: {
  value: string;
  onSelect: () => void;
  icon: IconType;
  label: string;
  hint?: string;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="group flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 font-mono text-sm text-foreground aria-selected:bg-foreground/5 aria-selected:text-foreground data-[selected=true]:bg-foreground/5"
    >
      <Icon
        className="h-4 w-4 flex-shrink-0 text-muted-foreground group-aria-selected:text-foreground"
        aria-hidden
      />
      <span className="flex-1 truncate">{label}</span>
      {hint && (
        <span className="ml-auto truncate text-xs text-muted-foreground">
          {hint}
        </span>
      )}
    </Command.Item>
  );
}
