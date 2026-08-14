import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

type PinKey =
  | "remarkable-mockup"
  | "three-pages"
  | "meeting-notes"
  | "six-sudokus"
  | "before-after";

const PIN_KEYS = new Set<PinKey>([
  "remarkable-mockup",
  "three-pages",
  "meeting-notes",
  "six-sudokus",
  "before-after",
]);

const INK = "#17201d";
const MUTED = "#65706b";
const PAPER = "#fbfaf5";
const MINT = "#d9f3e7";
const GREEN = "#1f6b52";
const BORDER = "#cad4ce";

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          width: 42,
          height: 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          background: GREEN,
          color: "white",
          fontSize: 24,
          fontWeight: 800,
        }}
      >
        R
      </div>
      <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
        Remarkable Skills
      </span>
    </div>
  );
}

function PinFrame({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        padding: "64px 68px 54px",
        color: INK,
        background:
          "radial-gradient(circle at 85% 8%, #ffffff 0, #f2faf6 23%, transparent 43%), linear-gradient(155deg, #f7f4ea 0%, #e7f3ed 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          height: 44,
          minHeight: 44,
        }}
      >
        <Brand />
        <span
          style={{
            display: "flex",
            padding: "10px 17px",
            borderRadius: 999,
            background: "rgba(255,255,255,.72)",
            border: `1px solid ${BORDER}`,
            color: GREEN,
            fontSize: 19,
            fontWeight: 700,
          }}
        >
          FREE PDF
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          marginTop: 68,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: GREEN,
            letterSpacing: ".12em",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </span>
        <div
          style={{
            display: "flex",
            maxWidth: 850,
            marginTop: 18,
            fontSize: 66,
            lineHeight: 1.02,
            fontWeight: 800,
            letterSpacing: "-0.045em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 820,
            marginTop: 22,
            color: MUTED,
            fontSize: 27,
            lineHeight: 1.35,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          height: 58,
          minHeight: 58,
          boxSizing: "border-box",
          paddingTop: 24,
          borderTop: `1px solid ${BORDER}`,
          color: MUTED,
          fontSize: 21,
        }}
      >
        <span>remarkable.vishwajeet.co</span>
        <span style={{ fontWeight: 700, color: GREEN }}>No signup · No watermark</span>
      </div>
    </div>
  );
}

function MeetingPage({ scale = 1 }: { scale?: number }) {
  const width = 380 * scale;
  const height = 510 * scale;
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        padding: 25 * scale,
        overflow: "hidden",
        borderRadius: 7 * scale,
        background: PAPER,
        border: `${Math.max(1, 2 * scale)}px solid #b9c2bd`,
        boxShadow: "0 22px 45px rgba(37,57,48,.16)",
      }}
    >
      <span style={{ fontSize: 23 * scale, fontWeight: 800, lineHeight: 1 }}>
        MEETING NOTES
      </span>
      <div style={{ display: "flex", gap: 12 * scale, marginTop: 24 * scale }}>
        {["DATE", "TIME"].map((label) => (
          <div key={label} style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <span style={{ fontSize: 8 * scale, lineHeight: 1, color: MUTED }}>{label}</span>
            <div style={{ display: "flex", height: 14 * scale, borderBottom: `1px solid ${MUTED}` }} />
          </div>
        ))}
      </div>
      {[
        ["ATTENDEES", 34],
        ["AGENDA", 44],
        ["DISCUSSION NOTES", 102],
        ["ACTION ITEMS", 50],
      ].map(([label, boxHeight]) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", marginTop: 11 * scale }}>
          <span style={{ fontSize: 9 * scale, fontWeight: 800, letterSpacing: ".08em" }}>
            {label}
          </span>
          <div
            style={{
              display: "flex",
              height: Number(boxHeight) * scale,
              marginTop: 5 * scale,
              border: `1px solid ${BORDER}`,
              background:
                label === "DISCUSSION NOTES"
                  ? "repeating-linear-gradient(to bottom, transparent 0, transparent 19px, #d9dfdc 20px)"
                  : "transparent",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function PlannerPage({ label }: { label: string }) {
  return (
    <div
      style={{
        width: 250,
        height: 340,
        display: "flex",
        flexDirection: "column",
        padding: 20,
        border: `2px solid ${BORDER}`,
        borderRadius: 8,
        background: PAPER,
        boxShadow: "0 18px 34px rgba(37,57,48,.14)",
      }}
    >
      <span style={{ fontSize: 20, fontWeight: 800 }}>{label}</span>
      <div style={{ display: "flex", height: 2, background: INK, margin: "14px 0 12px" }} />
      {[0, 1, 2, 3, 4, 5].map((line) => (
        <div
          key={line}
          style={{
            display: "flex",
            height: line === 1 ? 55 : 28,
            marginTop: 8,
            border: `1px solid ${BORDER}`,
            background: line === 1 ? MINT : "transparent",
          }}
        />
      ))}
    </div>
  );
}

const SUDOKU_ROWS = [
  "5 3 · · 7 · · · ·",
  "6 · · 1 9 5 · · ·",
  "· 9 8 · · · · 6 ·",
  "8 · · · 6 · · · 3",
  "4 · · 8 · 3 · · 1",
  "7 · · · 2 · · · 6",
  "· 6 · · · · 2 8 ·",
  "· · · 4 1 9 · · 5",
  "· · · · 8 · · 7 9",
];

function SudokuPage({ solved = false, small = false }: { solved?: boolean; small?: boolean }) {
  const size = small ? 214 : 430;
  return (
    <div
      style={{
        width: size,
        height: size + (small ? 48 : 76),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: small ? 14 : 28,
        border: `2px solid ${BORDER}`,
        borderRadius: small ? 7 : 12,
        background: PAPER,
        boxShadow: "0 22px 45px rgba(37,57,48,.16)",
      }}
    >
      <span style={{ fontSize: small ? 14 : 25, fontWeight: 800 }}>
        {solved ? "ANSWER KEY" : "SUDOKU · MEDIUM"}
      </span>
      <div
        style={{
          width: small ? 184 : 370,
          height: small ? 184 : 370,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          marginTop: small ? 11 : 20,
          padding: small ? 8 : 14,
          border: `${small ? 2 : 4}px solid ${INK}`,
          background:
            "linear-gradient(to right, transparent 32.8%, #17201d 33%, #17201d 34%, transparent 34.2%, transparent 65.8%, #17201d 66%, #17201d 67%, transparent 67.2%), linear-gradient(to bottom, transparent 32.8%, #17201d 33%, #17201d 34%, transparent 34.2%, transparent 65.8%, #17201d 66%, #17201d 67%, transparent 67.2%), repeating-linear-gradient(to right, transparent 0, transparent 10.7%, #cad4ce 10.9%, #cad4ce 11.1%), repeating-linear-gradient(to bottom, transparent 0, transparent 10.7%, #cad4ce 10.9%, #cad4ce 11.1%)",
        }}
      >
        {SUDOKU_ROWS.map((row, index) => (
          <span
            key={index}
            style={{
              display: "flex",
              justifyContent: "center",
              whiteSpace: "pre",
              fontFamily: "monospace",
              fontSize: small ? 10 : 20,
              letterSpacing: small ? 3.2 : 7.2,
              color: solved ? GREEN : INK,
            }}
          >
            {solved ? row.replaceAll("·", "4") : row}
          </span>
        ))}
      </div>
    </div>
  );
}

function TabletMockup() {
  return (
    <div
      style={{
        width: 610,
        height: 720,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        transform: "rotate(-5deg)",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 540,
          height: 690,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 30,
          background: "#252a28",
          boxShadow: "0 38px 70px rgba(26,42,35,.3)",
        }}
      >
        <MeetingPage scale={1.16} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 4,
          bottom: 50,
          width: 25,
          height: 510,
          borderRadius: 99,
          background: "#f5f4ee",
          boxShadow: "0 10px 22px rgba(26,42,35,.22)",
          transform: "rotate(8deg)",
        }}
      />
    </div>
  );
}

function PinCreative({ pin }: { pin: PinKey }) {
  if (pin === "remarkable-mockup") {
    return (
      <PinFrame
        eyebrow="Made for e-ink"
        title="A cleaner meeting page for your reMarkable"
        subtitle="Choose your device, generate the PDF, and send it to your tablet."
      >
        <TabletMockup />
      </PinFrame>
    );
  }

  if (pin === "three-pages") {
    return (
      <PinFrame
        eyebrow="Pick your layout"
        title="Three useful pages. One free generator."
        subtitle="Build crisp, device-sized planning and note templates in seconds."
      >
        <div style={{ display: "flex", gap: 24, transform: "rotate(-2deg)" }}>
          <PlannerPage label="MONTHLY PLAN" />
          <PlannerPage label="WEEKLY PLAN" />
          <PlannerPage label="DAILY PLAN" />
        </div>
      </PinFrame>
    );
  }

  if (pin === "meeting-notes") {
    return (
      <PinFrame
        eyebrow="Free reMarkable template"
        title="Free reMarkable meeting-notes template"
        subtitle="Agenda, attendees, discussion notes, and action items—ready to download."
      >
        <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
          <MeetingPage scale={1.25} />
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {["Pick your device", "Choose page count", "Download your PDF"].map(
              (step, index) => (
                <div
                  key={step}
                  style={{
                    width: 290,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "17px 20px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,.76)",
                    border: `1px solid ${BORDER}`,
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: GREEN }}>{index + 1}</span>
                  <span>{step}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </PinFrame>
    );
  }

  if (pin === "six-sudokus") {
    return (
      <PinFrame
        eyebrow="Printable puzzle generator"
        title="Generate six Sudoku puzzles with answers"
        subtitle="Easy to evil difficulty. Every PDF includes answer keys."
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 18 }}>
            <SudokuPage small />
            <SudokuPage small />
            <SudokuPage small />
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 18 }}>
            <SudokuPage small />
            <SudokuPage small />
            <SudokuPage solved small />
          </div>
        </div>
      </PinFrame>
    );
  }

  return (
    <PinFrame
      eyebrow="Before → after"
      title="From scattered notes to clear next steps"
      subtitle="Turn every meeting into an organized, repeatable workflow."
    >
      <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
        <div
          style={{
            width: 355,
            height: 475,
            display: "flex",
            flexDirection: "column",
            padding: 28,
            transform: "rotate(-4deg)",
            background: "#fffdf7",
            border: `2px solid ${BORDER}`,
            boxShadow: "0 20px 40px rgba(37,57,48,.14)",
          }}
        >
          <span style={{ color: MUTED, fontSize: 18, fontWeight: 800 }}>BEFORE</span>
          {["call Sam??", "budget", "launch Tues", "follow up!!!", "who owns slides?"].map(
            (note, index) => (
              <span
                key={note}
                style={{
                  marginTop: 28 + (index % 2) * 13,
                  marginLeft: (index % 3) * 22,
                  fontSize: 25,
                  color: index % 2 ? "#7a6255" : "#53645c",
                  transform: `rotate(${index % 2 ? 3 : -2}deg)`,
                }}
              >
                {note}
              </span>
            ),
          )}
        </div>
        <span style={{ color: GREEN, fontSize: 54, fontWeight: 800 }}>→</span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ alignSelf: "flex-start", marginBottom: 12, color: GREEN, fontSize: 18, fontWeight: 800 }}>
            AFTER
          </span>
          <MeetingPage scale={0.92} />
        </div>
      </div>
    </PinFrame>
  );
}

export async function GET(request: NextRequest) {
  const requestedPin = request.nextUrl.searchParams.get("pin") as PinKey | null;
  const pin = requestedPin && PIN_KEYS.has(requestedPin) ? requestedPin : "meeting-notes";

  return new ImageResponse(<PinCreative pin={pin} />, {
    width: 1000,
    height: 1500,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=604800, no-transform",
      "Content-Disposition": `inline; filename="${pin}.png"`,
    },
  });
}
