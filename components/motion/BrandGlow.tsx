export default function BrandGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[min(60vh,32rem)] overflow-hidden"
    >
      <div
        className="absolute left-1/2 top-0 h-full w-[min(110vw,68rem)] -translate-x-1/2 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 30% 18%, oklch(var(--brand) / 0.22) 0%, oklch(var(--brand) / 0.08) 32%, oklch(var(--brand) / 0.02) 56%, transparent 72%)",
        }}
      />
    </div>
  );
}
