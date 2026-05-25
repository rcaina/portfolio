import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Renzo Caiña, Full Stack Software Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0d0d0d",
          color: "#ece7d8",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          backgroundImage:
            "linear-gradient(to bottom right, rgba(244, 125, 55, 0.08), transparent 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "#8a8678",
            marginBottom: 24,
          }}
        >
          <span>~ renzo.caina/</span>
          <span style={{ color: "#f47d37" }}>$</span>
          <span style={{ color: "#ece7d8" }}>whoami</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.05,
            marginBottom: 12,
          }}
        >
          Renzo Caiña
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#bdb8a8",
            marginBottom: 36,
          }}
        >
          Full-Stack Software Developer @ Belle.
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#8a8678",
            marginBottom: 8,
          }}
        >
          Currently shipping software for weight loss and longevity care.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#8a8678",
            marginBottom: 56,
          }}
        >
          Previously Renew Biotechnologies, Fiddle, BYU.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 20,
            color: "#ece7d8",
          }}
        >
          <Pill>github.com/rcaina</Pill>
          <Pill>linkedin/renzocaina</Pill>
          <Pill>renzocaina.com</Pill>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 60,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 18,
            color: "#5a574c",
          }}
        >
          <span>press</span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 10px",
              border: "1px solid #3a3730",
              borderRadius: 6,
              backgroundColor: "#1a1815",
              color: "#bdb8a8",
            }}
          >
            ⌘ K
          </span>
        </div>
      </div>
    ),
    size
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        border: "1px solid #3a3730",
        borderRadius: 8,
        backgroundColor: "rgba(255, 255, 255, 0.025)",
      }}
    >
      {children}
    </div>
  );
}
