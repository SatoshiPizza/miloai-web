import { ImageResponse } from "next/og";

/**
 * Auto-generated OpenGraph card — what Telegram/Slack/iMessage/Facebook
 * embed when uniads.eu is pasted as a link. Next.js compiles this to a
 * static 1200×630 PNG at build time and serves it at /opengraph-image.
 *
 * To override per-route (e.g. /pricing), drop an `opengraph-image.tsx`
 * inside that route folder.
 */

export const runtime = "edge";
export const alt =
  "UniAds — voice-first AI media buyer. Launch Meta and Google ads from one voice message.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0B0B0D",
          color: "#F5EFE6",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          position: "relative",
          padding: "70px 80px",
        }}
      >
        {/* peach glow top-left */}
        <div
          style={{
            position: "absolute",
            left: -180,
            top: -200,
            width: 700,
            height: 700,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(232,149,108,0.32) 0%, rgba(232,149,108,0) 65%)",
          }}
        />
        {/* peach glow bottom-right */}
        <div
          style={{
            position: "absolute",
            right: -160,
            bottom: -220,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(232,149,108,0.18) 0%, rgba(232,149,108,0) 65%)",
          }}
        />

        {/* top: brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: "#E8956C",
            }}
          />
          UniAds
        </div>

        {/* badge */}
        <div
          style={{
            marginTop: 80,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            background: "rgba(232,149,108,0.12)",
            border: "1px solid rgba(232,149,108,0.35)",
            borderRadius: 9999,
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: "#E8956C",
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#E8956C",
              textTransform: "uppercase",
            }}
          >
            SMB · Estonia · EU
          </span>
        </div>

        {/* headline */}
        <div
          style={{
            marginTop: 26,
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>AI медиабайер,</span>
          <span>
            с которым{" "}
            <span style={{ color: "#E8956C", fontStyle: "italic" }}>
              можно говорить
            </span>
          </span>
        </div>

        {/* tagline */}
        <div
          style={{
            marginTop: 30,
            fontSize: 26,
            lineHeight: 1.4,
            color: "rgba(245,239,230,0.65)",
            maxWidth: 920,
          }}
        >
          Meta и Google голосом — из Telegram. Заменяет агентство за €500–1500 — за €99.
        </div>

        {/* footer row — stats + url */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 56,
              fontSize: 18,
              color: "rgba(245,239,230,0.55)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 38, color: "#F5EFE6", fontFamily: "system-ui" }}>47</span>
              <span>клиник</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 38, color: "#E8956C", fontFamily: "system-ui" }}>3.3×</span>
              <span>ниже CPA</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 38, color: "#F5EFE6", fontFamily: "system-ui" }}>1.8s</span>
              <span>отклик</span>
            </div>
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(245,239,230,0.55)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              letterSpacing: "0.04em",
            }}
          >
            uniads.eu
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
