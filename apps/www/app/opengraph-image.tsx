import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Handset UI — messaging and calling components for your product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand: handset.dev navy/blurple. Rendered server-side; no external fonts
// (system stack keeps the edge bundle tiny and the render deterministic).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d1230",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 70% -10%, rgba(99,91,255,0.35), transparent), radial-gradient(ellipse 60% 50% at 10% 110%, rgba(84,105,212,0.25), transparent)",
          padding: "72px 80px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          color: "#f6f7ff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#635bff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            h
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
            handset<span style={{ color: "#8f88ff" }}>/ui</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Texting and calling UI your product can own
          </div>
          <div style={{ fontSize: 28, color: "#b9bede", maxWidth: 820, lineHeight: 1.4 }}>
            Open-source React components on the Handset API — inbox, softphone,
            voicemail, compliance. Copied into your repo the shadcn way.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            color: "#e6e4ff",
            background: "rgba(99,91,255,0.16)",
            border: "1px solid rgba(143,136,255,0.4)",
            borderRadius: 12,
            padding: "18px 28px",
            alignSelf: "flex-start",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          <span style={{ color: "#8f88ff" }}>$</span>
          npx shadcn add @handset/messaging
        </div>
      </div>
    ),
    size,
  );
}
