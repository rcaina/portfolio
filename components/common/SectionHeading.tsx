interface Props {
  label: string;
  count?: number;
  command?: string;
  id?: string;
  number?: string;
}

const SectionHeading: React.FC<Props> = ({
  label,
  count,
  command = "ls -la",
  id,
  number,
}) => {
  return (
    <header className="flex w-full flex-col border-b border-foreground/15 pb-3">
      <div
        className="grid items-end gap-x-4 sm:gap-x-6"
        style={{
          gridTemplateColumns: number ? "auto 1fr" : "1fr",
        }}
      >
        {number && (
          <span
            aria-hidden
            className="font-mono text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-[0.82] tracking-[-0.04em] text-brand"
          >
            {number}
          </span>
        )}
        <h2
          id={id}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono"
        >
          <span className="text-[clamp(1.25rem,3vw,2rem)] font-semibold leading-tight tracking-[-0.025em] text-foreground">
            {label}
          </span>
          {typeof count === "number" && (
            <span className="font-mono text-xs font-normal text-muted-foreground">
              {count} {count === 1 ? "entry" : "entries"}
            </span>
          )}
        </h2>
      </div>
      <div className="mt-2 flex items-baseline gap-2 font-mono text-xs text-muted-foreground">
        <span aria-hidden className="text-brand">
          $
        </span>
        <span>
          {command} {label}/
        </span>
      </div>
    </header>
  );
};

export default SectionHeading;
