import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "Remarkable Skills — Puzzles, templates, and activities for your e-ink tablet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f5f5f5",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          fontFamily: "system-ui, sans-serif",
          padding: "36px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            border: "1px solid #e7e7e7",
            borderRadius: "28px",
            background: "#f7f7f7",
            padding: "46px 48px 36px",
            justifyContent: "space-between",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "76%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                color: "#08080a",
                letterSpacing: "-0.03em",
                lineHeight: 1.02,
                fontWeight: 800,
                fontSize: "74px",
              }}
            >
              <div style={{ display: "flex" }}>Puzzles, templates</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "14px" }}>
                <span>&amp; activities for your</span>
                <span
                  style={{
                    background: "#b8d3f3",
                    padding: "2px 16px 8px",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  e-ink
                </span>
              </div>
              <div style={{ display: "flex" }}>
                <span
                  style={{
                    background: "#b8d3f3",
                    padding: "2px 16px 8px",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  tablet
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginTop: "22px" }}>
              <div
                style={{
                  color: "#7d7d83",
                  fontSize: "35px",
                  lineHeight: 1.35,
                  letterSpacing: "-0.01em",
                }}
              >
                Generate unique PDFs optimized for e-ink - sudoku, crosswords,
                mazes, planners, and more.
              </div>

              <div style={{ display: "flex", gap: "14px", marginTop: "24px" }}>
                <div
                  style={{
                    borderRadius: "14px",
                    background: "#07090d",
                    color: "#ffffff",
                    fontSize: "28px",
                    fontWeight: 600,
                    padding: "16px 28px",
                  }}
                >
                  Browse Puzzles
                </div>
                <div
                  style={{
                    borderRadius: "14px",
                    border: "2px solid #d2d2d6",
                    color: "#171717",
                    fontSize: "28px",
                    fontWeight: 500,
                    padding: "14px 28px",
                  }}
                >
                  View Templates
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "22px",
                borderTop: "1px solid #e1e1e1",
                marginTop: "24px",
                paddingTop: "14px",
                color: "#8a8a91",
                fontSize: "22px",
              }}
            >
              <span style={{ color: "#171717", fontWeight: 700 }}>12 puzzle types</span>
              <span style={{ color: "#171717", fontWeight: 700 }}>49+ page templates</span>
              <span style={{ color: "#171717", fontWeight: 700 }}>8 template packs</span>
            </div>
          </div>

          <div
            style={{
              width: "20%",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: "8px",
            }}
          >
            <div
              style={{
                width: "172px",
                height: "344px",
                borderRadius: "24px",
                border: "5px solid #d6d6d6",
                background: "#f9f9f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "132px",
                  height: "302px",
                  borderRadius: "16px",
                  border: "2px solid #e7e7e7",
                  padding: "20px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ width: "100%", height: "5px", background: "#e0e0e0", borderRadius: "3px" }} />
                <div style={{ width: "86%", height: "5px", background: "#e5e5e5", borderRadius: "3px" }} />
                <div style={{ width: "92%", height: "5px", background: "#ececec", borderRadius: "3px" }} />
                <div style={{ width: "72%", height: "5px", background: "#ececec", borderRadius: "3px" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
