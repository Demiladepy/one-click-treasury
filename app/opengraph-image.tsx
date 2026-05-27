import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "One-Click Treasury — Built on LI.FI Intents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontData = await fetch(
    "https://fonts.gstatic.com/s/intertight/v7/NGSwv5HMAFg6IuLAdA6N7MY.woff2"
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#0A0A0F",
          padding: 72,
          position: "relative",
          overflow: "hidden",
          fontFamily: "Inter Tight",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(153,69,255,0.55) 0%, rgba(153,69,255,0.1) 45%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,107,157,0.45) 0%, rgba(240,185,11,0.15) 45%, transparent 70%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#FAFAFA",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          >
            Buy tokenized
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              background:
                "linear-gradient(180deg, #14F195 0%, #9945FF 30%, #9945FF 70%, #14F195 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 32,
            }}
          >
            Real-World Assets
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#A1A1AA",
              letterSpacing: "-0.01em",
            }}
          >
            with anything, on any chain
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 72,
            right: 72,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 20, color: "#9945FF", fontWeight: 700 }}>
            Built on LI.FI Intents
          </span>
          <span style={{ fontSize: 20, color: "#14F195", fontWeight: 700 }}>
            → Live demo
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter Tight", data: fontData, style: "normal", weight: 700 },
      ],
    }
  );
}
