import type React from "react";

/* ---------- Per-template SVG thumbnail content ---------- */

export const thumbs: Record<string, React.ReactNode> = {
  /* ===== All-in-One Planner ===== */

  "/templates/all-in-one-planner": (
    <>
      {/* Dark header bar */}
      <rect x="8" y="8" width="104" height="12" rx="1.5" fill="currentColor" fillOpacity="0.7" />
      {/* Section tabs in header */}
      {["YR","QG","MC","WK","HB"].map((abbr, i) => (
        <g key={abbr}>
          <rect x={60 + i * 12} y="10" width="10" height="8" rx="1" fill={i === 2 ? "white" : "currentColor"} fillOpacity={i === 2 ? 0.9 : 0.3} />
          <text x={65 + i * 12} y="16.5" fontSize="4" fill={i === 2 ? "currentColor" : "white"} textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">{abbr}</text>
        </g>
      ))}
      {/* TOC entries with dot leaders */}
      {["Year Overview","Quarterly Goals","Monthly Calendar","Weekly Planner","Notes"].map((label, i) => (
        <g key={label}>
          <text x="12" y={32 + i * 12} fontSize="5.5" fill="currentColor" fillOpacity="0.7" fontFamily="sans-serif">{label}</text>
          <line x1={12 + label.length * 3.1} y1={30 + i * 12} x2="98" y2={30 + i * 12} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.2" strokeDasharray="2 2" />
          <text x="100" y={32 + i * 12} fontSize="5" fill="currentColor" fillOpacity="0.4" textAnchor="end" fontFamily="sans-serif">p.{[2,3,7,19,31][i]}</text>
        </g>
      ))}
      {/* Footer nav */}
      <text x="14" y="155" fontSize="4.5" fill="currentColor" fillOpacity="0.4" fontFamily="sans-serif">← Back</text>
      <text x="60" y="155" fontSize="4.5" fill="currentColor" fillOpacity="0.4" textAnchor="middle" fontFamily="sans-serif">↑ Index</text>
      <text x="106" y="155" fontSize="4.5" fill="currentColor" fillOpacity="0.4" textAnchor="end" fontFamily="sans-serif">Next →</text>
    </>
  ),

  /* ===== Pack 1: Core Planner ===== */

  "/templates/yearly-roadmap": (
    <>
      {[0, 1, 2, 3].map((i) => {
        const x = 8 + (i % 2) * 54;
        const y = 14 + Math.floor(i / 2) * 74;
        return (
          <g key={i}>
            <rect x={x} y={y} width="48" height="66" rx="2" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
            <rect x={x + 4} y={y + 4} width="18" height="3" rx="1" fill="currentColor" fillOpacity="0.12" />
            {Array.from({ length: 4 }, (_, j) => (
              <line key={j} x1={x + 4} y1={y + 14 + j * 12} x2={x + 42} y2={y + 14 + j * 12} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.07" />
            ))}
          </g>
        );
      })}
    </>
  ),

  "/templates/quarterly-goals": (
    <>
      <rect x="8" y="14" width="40" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {[0, 1, 2].map((c) => {
        const x = 8 + c * 36;
        return (
          <g key={c}>
            <rect x={x} y="26" width="30" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
            {Array.from({ length: 6 }, (_, r) => (
              <g key={r}>
                <circle cx={x + 3} cy={36 + r * 18} r="1.5" fill="currentColor" fillOpacity="0.1" />
                <line x1={x + 8} y1={36 + r * 18} x2={x + 28} y2={36 + r * 18} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.07" />
              </g>
            ))}
          </g>
        );
      })}
    </>
  ),

  "/templates/monthly-calendar": (
    <>
      <line x1="8" y1="16" x2="52" y2="16" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" />
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 7 }, (_, col) => {
          const x = 8 + col * 15;
          const y = 28 + row * 24;
          const d = row * 7 + col + 1;
          if (d > 31) return null;
          return (
            <g key={`${row}-${col}`}>
              <rect x={x} y={y} width="13" height="20" rx="1.5" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.1" />
              <text x={x + 6.5} y={y + 12} fontSize="5.5" fill="currentColor" fillOpacity="0.2" textAnchor="middle" fontFamily="sans-serif">{d}</text>
            </g>
          );
        }),
      )}
    </>
  ),

  "/templates/planner": (
    <>
      <rect x="8" y="14" width="104" height="8" rx="1" fill="currentColor" fillOpacity="0.06" />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={8 + ((i + 1) * 104) / 7} y1="14" x2={8 + ((i + 1) * 104) / 7} y2="156" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.12" />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`h${i}`} x1="8" y1={30 + i * 11.5} x2="112" y2={30 + i * 11.5} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.08" />
      ))}
      <rect x="10" y="30" width="12" height="18" rx="1.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="40" y="53" width="12" height="24" rx="1.5" fill="currentColor" fillOpacity="0.06" />
      <rect x="70" y="41" width="12" height="14" rx="1.5" fill="currentColor" fillOpacity="0.07" />
      <rect x="25" y="76" width="12" height="20" rx="1.5" fill="currentColor" fillOpacity="0.05" />
    </>
  ),

  "/templates/daily-focus": (
    <>
      <rect x="8" y="14" width="50" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 3 }, (_, i) => (
        <g key={i}>
          <rect x="8" y={28 + i * 16} width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.12" fill="none" />
          <line x1="22" y1={32 + i * 16} x2={70 + i * 10} y2={32 + i * 16} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
        </g>
      ))}
      <line x1="8" y1="80" x2="112" y2="80" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={`s${i}`}>
          <rect x="8" y={88 + i * 14} width="12" height="3" rx="1" fill="currentColor" fillOpacity="0.06" />
          <line x1="24" y1={90 + i * 14} x2="112" y2={90 + i * 14} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}
    </>
  ),

  "/templates/inbox-capture": (
    <>
      <rect x="8" y="14" width="36" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <rect x="8" y={28 + i * 13} width="6" height="6" rx="1" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.12" fill={i < 3 ? "currentColor" : "none"} fillOpacity={i < 3 ? "0.08" : "0"} />
          <line x1="20" y1={31 + i * 13} x2={60 + (i * 17) % 40} y2={31 + i * 13} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.07" />
        </g>
      ))}
    </>
  ),

  "/templates/lined": (
    <>
      <line x1="18" y1="8" x2="18" y2="162" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
      {Array.from({ length: 18 }, (_, i) => (
        <line key={i} x1="8" y1={16 + i * 8.5} x2="112" y2={16 + i * 8.5} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.08" />
      ))}
    </>
  ),

  "/templates/dot-grid": (
    <>
      {Array.from({ length: 16 }, (_, row) =>
        Array.from({ length: 12 }, (_, col) => (
          <circle key={`${row}-${col}`} cx={12 + col * 9} cy={14 + row * 9.5} r="0.8" fill="currentColor" fillOpacity="0.12" />
        )),
      )}
    </>
  ),

  "/templates/grid": (
    <>
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`v${i}`} x1={12 + i * 9.6} y1="8" x2={12 + i * 9.6} y2="160" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.08" />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <line key={`h${i}`} x1="8" y1={12 + i * 9.6} x2="112" y2={12 + i * 9.6} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.08" />
      ))}
    </>
  ),

  /* ===== Pack 2: Meetings + Projects ===== */

  "/templates/meeting-notes": (
    <>
      <rect x="8" y="14" width="104" height="16" rx="2" fill="currentColor" fillOpacity="0.04" />
      <rect x="12" y="18" width="40" height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
      <rect x="12" y="24" width="24" height="3" rx="1" fill="currentColor" fillOpacity="0.06" />
      <rect x="8" y="36" width="28" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1="8" y1={48 + i * 10} x2={80 + (i * 13) % 30} y2={48 + i * 10} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.07" />
      ))}
      <line x1="8" y1="104" x2="112" y2="104" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
      <rect x="8" y="110" width="30" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 3 }, (_, i) => (
        <g key={`a${i}`}>
          <rect x="8" y={120 + i * 12} width="5" height="5" rx="1" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.1" fill="none" />
          <line x1="18" y1={123 + i * 12} x2={60 + i * 15} y2={123 + i * 12} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.07" />
        </g>
      ))}
    </>
  ),

  "/templates/one-on-one": (
    <>
      <rect x="8" y="14" width="50" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <line x1="60" y1="26" x2="60" y2="158" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
      <rect x="8" y="26" width="20" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
      <rect x="64" y="26" width="20" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`l${i}`} x1="8" y1={38 + i * 15} x2="54" y2={38 + i * 15} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.07" />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`r${i}`} x1="64" y1={38 + i * 15} x2="112" y2={38 + i * 15} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.07" />
      ))}
    </>
  ),

  "/templates/client-call": (
    <>
      <rect x="8" y="14" width="55" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="8" y="26" width="14" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 3 }, (_, i) => (
        <line key={i} x1="8" y1={36 + i * 10} x2={70 + i * 12} y2={36 + i * 10} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.07" />
      ))}
      <line x1="8" y1="72" x2="112" y2="72" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
      <rect x="8" y="78" width="26" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 3 }, (_, i) => (
        <g key={`t${i}`}>
          <circle cx="12" cy={90 + i * 12} r="1.5" fill="currentColor" fillOpacity="0.1" />
          <line x1="18" y1={90 + i * 12} x2={65 + i * 10} y2={90 + i * 12} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.07" />
        </g>
      ))}
      <line x1="8" y1="128" x2="112" y2="128" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
      <rect x="8" y="134" width="22" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 2 }, (_, i) => (
        <line key={`f${i}`} x1="8" y1={144 + i * 10} x2={55 + i * 20} y2={144 + i * 10} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.07" />
      ))}
    </>
  ),

  "/templates/project-brief": (
    <>
      <rect x="8" y="14" width="60" height="5" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <rect x="8" y={30 + i * 24} width="24" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
          <line x1="8" y1={40 + i * 24} x2="112" y2={40 + i * 24} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          <line x1="8" y1={48 + i * 24} x2={80 + (i * 11) % 30} y2={48 + i * 24} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}
    </>
  ),

  "/templates/decision-log": (
    <>
      <rect x="8" y="14" width="104" height="10" rx="1.5" fill="currentColor" fillOpacity="0.05" />
      <rect x="10" y="16" width="12" height="3" rx="0.5" fill="currentColor" fillOpacity="0.1" />
      <rect x="30" y="16" width="30" height="3" rx="0.5" fill="currentColor" fillOpacity="0.1" />
      <rect x="68" y="16" width="18" height="3" rx="0.5" fill="currentColor" fillOpacity="0.1" />
      <rect x="92" y="16" width="16" height="3" rx="0.5" fill="currentColor" fillOpacity="0.1" />
      {[26, 64, 88].map((x) => (
        <line key={x} x1={x} y1="14" x2={x} y2="158" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <line x1="8" y1={30 + i * 16} x2="112" y2={30 + i * 16} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          <rect x="10" y={33 + i * 16} width="10" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.06" />
          <line x1="30" y1={34 + i * 16} x2={52 + (i * 7) % 10} y2={34 + i * 16} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          <rect x="68" y={33 + i * 16} width={12 + (i * 3) % 6} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <rect x="92" y={33 + i * 16} width={10 + (i * 5) % 8} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
        </g>
      ))}
    </>
  ),

  "/templates/action-tracker": (
    <>
      <rect x="8" y="14" width="104" height="10" rx="1.5" fill="currentColor" fillOpacity="0.05" />
      <rect x="10" y="16" width="5" height="3" rx="0.5" fill="currentColor" fillOpacity="0.1" />
      <rect x="22" y="16" width="30" height="3" rx="0.5" fill="currentColor" fillOpacity="0.1" />
      <rect x="60" y="16" width="18" height="3" rx="0.5" fill="currentColor" fillOpacity="0.1" />
      <rect x="86" y="16" width="16" height="3" rx="0.5" fill="currentColor" fillOpacity="0.1" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <line x1="8" y1={30 + i * 16} x2="112" y2={30 + i * 16} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          <rect x="10" y={33 + i * 16} width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.1" fill={i < 2 ? "currentColor" : "none"} fillOpacity="0.08" />
          <line x1="22" y1={35 + i * 16} x2={44 + (i * 9) % 12} y2={35 + i * 16} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          <rect x="60" y={34 + i * 16} width={10 + (i * 5) % 8} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <rect x="86" y={34 + i * 16} width={8 + (i * 3) % 10} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
        </g>
      ))}
    </>
  ),

  "/templates/project-timeline": (
    <>
      <rect x="8" y="14" width="50" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <line x1="14" y1="84" x2="106" y2="84" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      {[18, 40, 62, 84, 106].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy="84" r="3" fill="currentColor" fillOpacity={i < 3 ? "0.15" : "0.08"} />
          <rect x={x - 8} y="92" width="16" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.06" />
          <line x1={x} y1={i % 2 === 0 ? 60 : 66} x2={x} y2="81" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
          <rect x={x - 10} y={i % 2 === 0 ? 50 : 56} width="20" height="8" rx="1.5" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.08" />
        </g>
      ))}
    </>
  ),

  /* ===== Pack 3: Focus / ADHD ===== */

  "/templates/daily-plan-adhd": (
    <>
      <rect x="8" y="14" width="30" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
      <rect x="8" y="22" width="60" height="6" rx="3" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
      <rect x="9" y="23" width="35" height="4" rx="2" fill="currentColor" fillOpacity="0.08" />
      <rect x="8" y="40" width="104" height="40" rx="3" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.1" fill="currentColor" fillOpacity="0.02" />
      <rect x="14" y="46" width="28" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
      <line x1="14" y1="58" x2="100" y2="58" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="14" y1="66" x2="80" y2="66" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i}>
          <rect x="8" y={92 + i * 16} width="5" height="5" rx="1" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.1" fill="none" />
          <line x1="18" y1={95 + i * 16} x2={55 + (i * 15) % 40} y2={95 + i * 16} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}
    </>
  ),

  "/templates/time-block": (
    <>
      <rect x="8" y="14" width="40" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          <rect x="8" y={26 + i * 11} width="14" height="3" rx="0.5" fill="currentColor" fillOpacity="0.06" />
          <rect x="26" y={24 + i * 11} width="86" height="9" rx="1" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.08" fill="none" />
        </g>
      ))}
      <rect x="27" y="35" width="85" height="20" rx="1" fill="currentColor" fillOpacity="0.04" />
      <rect x="27" y="79" width="85" height="9" rx="1" fill="currentColor" fillOpacity="0.04" />
    </>
  ),

  "/templates/brain-dump": (
    <>
      <rect x="8" y="14" width="36" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {[
        { x: 15, y: 34, w: 35, h: 24 },
        { x: 60, y: 28, w: 44, h: 20 },
        { x: 10, y: 68, w: 40, h: 18 },
        { x: 58, y: 56, w: 48, h: 22 },
        { x: 20, y: 96, w: 32, h: 20 },
        { x: 60, y: 86, w: 42, h: 24 },
        { x: 14, y: 126, w: 50, h: 18 },
        { x: 70, y: 118, w: 36, h: 22 },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="4" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" fill="currentColor" fillOpacity="0.02" />
      ))}
    </>
  ),

  "/templates/three-priorities": (
    <>
      <rect x="8" y="14" width="50" height="5" rx="1" fill="currentColor" fillOpacity="0.12" />
      {[1, 2, 3].map((n, i) => (
        <g key={i}>
          <text x="16" y={50 + i * 42} fontSize="14" fill="currentColor" fillOpacity="0.08" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">{n}</text>
          <line x1="28" y1={46 + i * 42} x2="108" y2={46 + i * 42} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
          <line x1="28" y1={56 + i * 42} x2="90" y2={56 + i * 42} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}
    </>
  ),

  "/templates/shutdown-checklist": (
    <>
      <rect x="8" y="14" width="55" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <text x="14" y={34 + i * 17} fontSize="5" fill="currentColor" fillOpacity="0.1" textAnchor="middle" fontFamily="sans-serif">{i + 1}</text>
          <rect x="22" y={28 + i * 17} width="6" height="6" rx="1" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" fill={i < 5 ? "currentColor" : "none"} fillOpacity={i < 5 ? "0.06" : "0"} />
          <line x1="34" y1={31 + i * 17} x2={70 + (i * 13) % 36} y2={31 + i * 17} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.07" />
        </g>
      ))}
    </>
  ),

  "/templates/routine-tracker": (
    <>
      <rect x="8" y="14" width="44" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 7 }, (_, c) => (
        <rect key={c} x={36 + c * 11} y="24" width="8" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      ))}
      {Array.from({ length: 6 }, (_, r) => (
        <g key={r}>
          <line x1="8" y1={36 + r * 20} x2="30" y2={36 + r * 20} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
          {Array.from({ length: 7 }, (_, c) => (
            <rect key={c} x={37 + c * 11} y={32 + r * 20} width="6" height="6" rx="1" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.1" fill={(r * 7 + c) % 3 !== 0 ? "currentColor" : "none"} fillOpacity={(r * 7 + c) % 3 !== 0 ? "0.06" : "0"} />
          ))}
        </g>
      ))}
    </>
  ),

  /* ===== Pack 4: Study + Reading ===== */

  "/templates/cornell": (
    <>
      <line x1="8" y1="14" x2="112" y2="14" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.15" />
      <line x1="38" y1="14" x2="38" y2="124" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.15" />
      <line x1="8" y1="124" x2="112" y2="124" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.15" />
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1="12" y1={32 + i * 24} x2="32" y2={32 + i * 24} stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.08" />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`n${i}`} x1="44" y1={28 + i * 12} x2={90 + (i % 3) * 8 - 12} y2={28 + i * 12} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <line key={`s${i}`} x1="12" y1={134 + i * 10} x2={80 + i * 10} y2={134 + i * 10} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
      ))}
    </>
  ),

  "/templates/lecture-notes": (
    <>
      <rect x="8" y="14" width="60" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="80" y="14" width="30" height="4" rx="1" fill="currentColor" fillOpacity="0.06" />
      {[0, 1, 2].map((s) => (
        <g key={s}>
          <rect x="8" y={30 + s * 46} width={30 + s * 5} height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
          {Array.from({ length: 3 }, (_, i) => (
            <line key={i} x1="8" y1={42 + s * 46 + i * 10} x2={90 + (i * 7) % 20} y2={42 + s * 46 + i * 10} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          ))}
        </g>
      ))}
    </>
  ),

  "/templates/paper-summary": (
    <>
      <rect x="8" y="14" width="80" height="5" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="8" y="24" width="50" height="3" rx="1" fill="currentColor" fillOpacity="0.06" />
      <rect x="8" y="34" width="104" height="30" rx="2" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" fill="currentColor" fillOpacity="0.02" />
      <rect x="12" y="38" width="20" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 2 }, (_, i) => (
        <line key={i} x1="12" y1={48 + i * 8} x2={90 + i * 5} y2={48 + i * 8} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
      ))}
      <rect x="8" y="74" width="30" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 3 }, (_, i) => (
        <g key={i}>
          <circle cx="12" cy={88 + i * 14} r="1.5" fill="currentColor" fillOpacity="0.08" />
          <line x1="18" y1={88 + i * 14} x2={75 + i * 10} y2={88 + i * 14} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}
      <rect x="8" y="132" width="18" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 2 }, (_, i) => (
        <line key={`n${i}`} x1="8" y1={144 + i * 10} x2={80 + i * 10} y2={144 + i * 10} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
      ))}
    </>
  ),

  "/templates/reading-log": (
    <>
      <rect x="8" y="14" width="40" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="8" y="26" width="104" height="10" rx="1.5" fill="currentColor" fillOpacity="0.04" />
      <rect x="10" y="28" width="8" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="28" y="28" width="30" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="68" y="28" width="16" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="92" y="28" width="14" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <line x1="8" y1={42 + i * 14} x2="112" y2={42 + i * 14} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          <rect x="10" y={45 + i * 14} width="6" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <line x1="28" y1={46 + i * 14} x2={50 + (i * 7) % 10} y2={46 + i * 14} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          <line x1="68" y1={46 + i * 14} x2={78 + (i * 3) % 6} y2={46 + i * 14} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          {Array.from({ length: 5 }, (_, s) => (
            <circle key={s} cx={94 + s * 4} cy={46 + i * 14} r="1" fill="currentColor" fillOpacity={s < 3 + (i % 3) ? "0.12" : "0.04"} />
          ))}
        </g>
      ))}
    </>
  ),

  "/templates/book-notes": (
    <>
      <rect x="8" y="14" width="60" height="5" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="8" y="24" width="30" height="3" rx="1" fill="currentColor" fillOpacity="0.06" />
      {[0, 1, 2].map((s) => (
        <g key={s}>
          <rect x="8" y={38 + s * 40} width={24 + s * 4} height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
          <line x1="8" y1={44 + s * 40} x2="112" y2={44 + s * 40} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          {Array.from({ length: 2 }, (_, i) => (
            <g key={i}>
              <circle cx="12" cy={54 + s * 40 + i * 12} r="1.5" fill="currentColor" fillOpacity="0.08" />
              <line x1="18" y1={54 + s * 40 + i * 12} x2={70 + (i * 20) % 30} y2={54 + s * 40 + i * 12} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
            </g>
          ))}
        </g>
      ))}
    </>
  ),

  "/templates/revision-planner": (
    <>
      <rect x="8" y="14" width="48" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 6 }, (_, c) => (
        <rect key={c} x={30 + c * 14} y="24" width="10" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      ))}
      {Array.from({ length: 7 }, (_, r) => (
        <g key={r}>
          <rect x="8" y={34 + r * 18} width="18" height="3" rx="0.5" fill="currentColor" fillOpacity="0.06" />
          {Array.from({ length: 6 }, (_, c) => (
            <rect key={c} x={31 + c * 14} y={32 + r * 18} width="8" height="8" rx="1" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.1" fill={(r * 6 + c) % 4 < 2 ? "currentColor" : "none"} fillOpacity={(r * 6 + c) % 4 < 2 ? "0.06" : "0"} />
          ))}
        </g>
      ))}
    </>
  ),

  /* ===== Pack 5: Life Admin ===== */

  "/templates/monthly-budget": (
    <>
      <rect x="8" y="14" width="50" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="50" y="26" width="24" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="82" y="26" width="24" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <line x1="8" y1={38 + i * 14} x2="112" y2={38 + i * 14} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          <rect x="8" y={41 + i * 14} width={20 + (i * 5) % 10} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.06" />
          <rect x="52" y={41 + i * 14} width={16 + (i * 3) % 6} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <rect x="84" y={41 + i * 14} width={14 + (i * 4) % 8} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
        </g>
      ))}
      <line x1="8" y1="152" x2="112" y2="152" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.1" />
      <rect x="8" y="155" width="16" height="3" rx="0.5" fill="currentColor" fillOpacity="0.1" />
    </>
  ),

  "/templates/expense-tracker": (
    <>
      <rect x="8" y="14" width="48" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="8" y="26" width="104" height="10" rx="1.5" fill="currentColor" fillOpacity="0.04" />
      <rect x="10" y="28" width="14" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="30" y="28" width="30" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="68" y="28" width="18" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="92" y="28" width="16" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <line x1="8" y1={42 + i * 13} x2="112" y2={42 + i * 13} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          <rect x="10" y={44 + i * 13} width="12" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <line x1="30" y1={45 + i * 13} x2={48 + (i * 9) % 14} y2={45 + i * 13} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          <rect x="68" y={44 + i * 13} width={10 + (i * 4) % 8} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.04" />
          <rect x="92" y={44 + i * 13} width={8 + (i * 3) % 10} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
        </g>
      ))}
    </>
  ),

  "/templates/bill-tracker": (
    <>
      <rect x="8" y="14" width="40" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="8" y="26" width="104" height="10" rx="1.5" fill="currentColor" fillOpacity="0.04" />
      <rect x="10" y="28" width="26" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="42" y="28" width="14" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="62" y="28" width="16" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="84" y="28" width="10" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="100" y="28" width="8" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <line x1="8" y1={42 + i * 14} x2="112" y2={42 + i * 14} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          <line x1="10" y1={46 + i * 14} x2={28 + (i * 5) % 8} y2={46 + i * 14} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          <rect x="42" y={44 + i * 14} width={10 + (i * 3) % 5} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <rect x="62" y={44 + i * 14} width="12" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <rect x="84" y={44 + i * 14} width="8" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <rect x="101" y={43 + i * 14} width="5" height="5" rx="1" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.1" fill={i < 4 ? "currentColor" : "none"} fillOpacity={i < 4 ? "0.06" : "0"} />
        </g>
      ))}
    </>
  ),

  "/templates/habit-tracker": (
    <>
      <line x1="8" y1="16" x2="46" y2="16" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" />
      {Array.from({ length: 5 }, (_, row) => (
        <line key={row} x1="8" y1={34 + row * 26} x2="28" y2={34 + row * 26} stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
      ))}
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 7 }, (_, col) => {
          const filled = [0, 4, 9, 11, 15, 18, 22, 26, 28, 31, 34].includes(row * 7 + col);
          return (
            <circle key={`${row}-${col}`} cx={38 + col * 11} cy={34 + row * 26} r="3.5" stroke="currentColor" strokeWidth="0.5" strokeOpacity={filled ? "0.25" : "0.12"} fill={filled ? "currentColor" : "none"} fillOpacity={filled ? "0.12" : "0"} />
          );
        }),
      )}
    </>
  ),

  "/templates/meal-planner": (
    <>
      <rect x="8" y="14" width="44" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 7 }, (_, c) => (
        <rect key={c} x={8 + c * 15} y="24" width="13" height="4" rx="1" fill="currentColor" fillOpacity="0.08" />
      ))}
      {Array.from({ length: 4 }, (_, r) => (
        <g key={r}>
          <rect x="8" y={34 + r * 32} width="104" height="28" rx="1.5" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" fill="none" />
          {Array.from({ length: 6 }, (_, c) => (
            <line key={c} x1={8 + (c + 1) * 15} y1={34 + r * 32} x2={8 + (c + 1) * 15} y2={62 + r * 32} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          ))}
        </g>
      ))}
    </>
  ),

  "/templates/grocery-list": (
    <>
      <rect x="8" y="14" width="44" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {[0, 1].map((col) => (
        <g key={col}>
          {[0, 1, 2].map((sec) => (
            <g key={sec}>
              <rect x={8 + col * 56} y={28 + sec * 46} width="24" height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
              {Array.from({ length: 4 }, (_, i) => (
                <g key={i}>
                  <rect x={8 + col * 56} y={38 + sec * 46 + i * 9} width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.1" fill="none" />
                  <line x1={16 + col * 56} y1={40 + sec * 46 + i * 9} x2={38 + col * 56 + (i * 7) % 14} y2={40 + sec * 46 + i * 9} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
                </g>
              ))}
            </g>
          ))}
        </g>
      ))}
    </>
  ),

  "/templates/recipe-page": (
    <>
      <rect x="8" y="14" width="60" height="5" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="8" y="28" width="30" height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <circle cx="12" cy={40 + i * 10} r="1.5" fill="currentColor" fillOpacity="0.08" />
          <line x1="18" y1={40 + i * 10} x2={50 + (i * 9) % 20} y2={40 + i * 10} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}
      <line x1="8" y1="104" x2="112" y2="104" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
      <rect x="8" y="110" width="30" height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
      {Array.from({ length: 3 }, (_, i) => (
        <g key={i}>
          <text x="14" y={126 + i * 14} fontSize="5" fill="currentColor" fillOpacity="0.1" textAnchor="middle" fontFamily="sans-serif">{i + 1}</text>
          <line x1="22" y1={124 + i * 14} x2={80 + (i * 10) % 20} y2={124 + i * 14} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}
    </>
  ),

  /* ===== Pack 6: Journal + Wellness ===== */

  "/templates/daily-reflection": (
    <>
      <rect x="8" y="14" width="52" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="80" y="14" width="28" height="3" rx="1" fill="currentColor" fillOpacity="0.06" />
      {[0, 1, 2].map((s) => (
        <g key={s}>
          <rect x="8" y={30 + s * 42} width={36 + s * 6} height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
          {Array.from({ length: 3 }, (_, i) => (
            <line key={i} x1="8" y1={42 + s * 42 + i * 10} x2={85 + (i * 12) % 25} y2={42 + s * 42 + i * 10} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          ))}
        </g>
      ))}
    </>
  ),

  "/templates/gratitude-journal": (
    <>
      <rect x="8" y="14" width="56" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="8" y="28" width="24" height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i}>
          <text x="14" y={42 + i * 14} fontSize="5" fill="currentColor" fillOpacity="0.08" textAnchor="middle" fontFamily="sans-serif">{i + 1}</text>
          <line x1="22" y1={40 + i * 14} x2={90 + (i * 8) % 18} y2={40 + i * 14} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}
      <line x1="8" y1="100" x2="112" y2="100" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
      <rect x="8" y="108" width="24" height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
      {Array.from({ length: 3 }, (_, i) => (
        <g key={i}>
          <text x="14" y={122 + i * 14} fontSize="5" fill="currentColor" fillOpacity="0.08" textAnchor="middle" fontFamily="sans-serif">{i + 1}</text>
          <line x1="22" y1={120 + i * 14} x2={80 + (i * 12) % 24} y2={120 + i * 14} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}
    </>
  ),

  "/templates/mood-tracker": (
    <>
      <rect x="8" y="14" width="44" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 7 }, (_, col) => {
          const d = row * 7 + col + 1;
          if (d > 31) return null;
          const cx = 16 + col * 14;
          const cy = 34 + row * 22;
          const op = [0.06, 0.1, 0.14, 0.08, 0.12];
          return (
            <g key={`${row}-${col}`}>
              <circle cx={cx} cy={cy} r="5" fill="currentColor" fillOpacity={op[(d * 3) % 5]} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.08" />
              <text x={cx} y={cy + 1.5} fontSize="3.5" fill="currentColor" fillOpacity="0.15" textAnchor="middle" fontFamily="sans-serif">{d}</text>
            </g>
          );
        }),
      )}
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <circle cx={14 + i * 20} cy="150" r="3" fill="currentColor" fillOpacity={0.04 + i * 0.03} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.08" />
          <rect x={20 + i * 20} y="149" width="8" height="2" rx="0.5" fill="currentColor" fillOpacity="0.06" />
        </g>
      ))}
    </>
  ),

  "/templates/sleep-log": (
    <>
      <rect x="8" y="14" width="36" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="8" y="26" width="104" height="10" rx="1.5" fill="currentColor" fillOpacity="0.04" />
      <rect x="10" y="28" width="14" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="30" y="28" width="14" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="50" y="28" width="14" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="70" y="28" width="14" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="90" y="28" width="16" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <line x1="8" y1={42 + i * 16} x2="112" y2={42 + i * 16} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          <rect x="10" y={45 + i * 16} width="12" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.06" />
          <rect x="30" y={45 + i * 16} width="10" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <rect x="50" y={45 + i * 16} width="10" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <rect x="70" y={44 + i * 16} width={14 + (i * 5) % 10} height="5" rx="2" fill="currentColor" fillOpacity="0.06" />
          {Array.from({ length: 5 }, (_, s) => (
            <circle key={s} cx={92 + s * 4} cy={47 + i * 16} r="1" fill="currentColor" fillOpacity={s < 2 + (i % 4) ? "0.12" : "0.04"} />
          ))}
        </g>
      ))}
    </>
  ),

  "/templates/weekly-review": (
    <>
      <rect x="8" y="14" width="50" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {[0, 1, 2].map((s) => (
        <g key={s}>
          <rect x="8" y={28 + s * 44} width={20 + s * 8} height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
          <line x1="8" y1={34 + s * 44} x2="112" y2={34 + s * 44} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          {Array.from({ length: 3 }, (_, i) => (
            <line key={i} x1="8" y1={42 + s * 44 + i * 10} x2={75 + (i * 15) % 30} y2={42 + s * 44 + i * 10} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          ))}
        </g>
      ))}
    </>
  ),

  "/templates/self-care-checklist": (
    <>
      <rect x="8" y="14" width="52" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {[0, 1, 2, 3].map((s) => (
        <g key={s}>
          <rect x="8" y={28 + s * 34} width={22 + s * 4} height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
          {Array.from({ length: 3 }, (_, i) => (
            <g key={i}>
              <rect x="8" y={36 + s * 34 + i * 8} width="5" height="5" rx="1" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.1" fill={i === 0 ? "currentColor" : "none"} fillOpacity={i === 0 ? "0.06" : "0"} />
              <line x1="18" y1={39 + s * 34 + i * 8} x2={55 + (i * 17) % 40} y2={39 + s * 34 + i * 8} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
            </g>
          ))}
        </g>
      ))}
    </>
  ),

  /* ===== Pack 7: Health & Fitness ===== */

  "/templates/fitness-planner": (
    <>
      <rect x="8" y="14" width="50" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="8" y="26" width="104" height="10" rx="1.5" fill="currentColor" fillOpacity="0.04" />
      <rect x="10" y="28" width="26" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="42" y="28" width="10" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="58" y="28" width="10" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="74" y="28" width="12" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="92" y="28" width="16" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <line x1="8" y1={42 + i * 14} x2="112" y2={42 + i * 14} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          <line x1="10" y1={47 + i * 14} x2={28 + (i * 5) % 8} y2={47 + i * 14} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          <rect x="44" y={45 + i * 14} width="6" height="3" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <rect x="60" y={45 + i * 14} width="6" height="3" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <rect x="76" y={45 + i * 14} width="8" height="3" rx="0.5" fill="currentColor" fillOpacity="0.05" />
          <rect x="94" y={45 + i * 14} width={8 + (i * 3) % 10} height="3" rx="0.5" fill="currentColor" fillOpacity="0.04" />
        </g>
      ))}
    </>
  ),

  "/templates/weight-loss-tracker": (
    <>
      <rect x="8" y="14" width="60" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <rect x="8" y={32 + i * 24} width="8" height="2" rx="0.5" fill="currentColor" fillOpacity="0.06" />
          <line x1="20" y1={33 + i * 24} x2="112" y2={33 + i * 24} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.05" />
        </g>
      ))}
      <polyline points="24,88 32,84 40,78 48,82 56,74 64,70 72,66 80,72 88,64 96,58 104,54" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.12" strokeLinecap="round" strokeLinejoin="round" />
      {([[24,88],[32,84],[40,78],[48,82],[56,74],[64,70],[72,66],[80,72],[88,64],[96,58],[104,54]] as const).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="currentColor" fillOpacity="0.15" />
      ))}
      <line x1="20" y1="50" x2="112" y2="50" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="3 3" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={20 + i * 18} y="140" width="10" height="2" rx="0.5" fill="currentColor" fillOpacity="0.05" />
      ))}
    </>
  ),

  /* ===== Pack 8: Life Planning ===== */

  "/templates/vision-board": (
    <>
      <rect x="8" y="14" width="46" height="5" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 2 }, (_, col) => (
          <g key={`${row}-${col}`}>
            <rect x={8 + col * 54} y={28 + row * 46} width="48" height="40" rx="3" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" fill="currentColor" fillOpacity="0.02" />
            <rect x={12 + col * 54} y={32 + row * 46} width="20" height="3" rx="1" fill="currentColor" fillOpacity="0.08" />
            {Array.from({ length: 2 }, (_, i) => (
              <line key={i} x1={12 + col * 54} y1={42 + row * 46 + i * 10} x2={42 + col * 54 + i * 5} y2={42 + row * 46 + i * 10} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
            ))}
          </g>
        )),
      )}
    </>
  ),

  "/templates/savings-challenge": (
    <>
      <rect x="8" y="14" width="56" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 7 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          const n = row * 8 + col + 1;
          if (n > 52) return null;
          const cx = 14 + col * 13;
          const cy = 32 + row * 19;
          return (
            <g key={n}>
              <circle cx={cx} cy={cy} r="5" stroke="currentColor" strokeWidth="0.4" strokeOpacity={n <= 20 ? "0.15" : "0.08"} fill={n <= 20 ? "currentColor" : "none"} fillOpacity={n <= 20 ? "0.06" : "0"} />
              <text x={cx} y={cy + 1.5} fontSize="3.5" fill="currentColor" fillOpacity="0.15" textAnchor="middle" fontFamily="sans-serif">{n}</text>
            </g>
          );
        }),
      )}
    </>
  ),

  "/templates/travel-planner": (
    <>
      <rect x="8" y="14" width="50" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="8" y="26" width="22" height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
      {Array.from({ length: 3 }, (_, i) => (
        <g key={i}>
          <rect x="8" y={36 + i * 12} width="14" height="3" rx="0.5" fill="currentColor" fillOpacity="0.06" />
          <line x1="28" y1={37 + i * 12} x2={75 + (i * 12) % 25} y2={37 + i * 12} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}
      <line x1="8" y1="78" x2="112" y2="78" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
      <rect x="8" y="84" width="26" height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i}>
          <rect x={8 + (i % 2) * 54} y={94 + Math.floor(i / 2) * 12} width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.1" fill="none" />
          <line x1={16 + (i % 2) * 54} y1={96 + Math.floor(i / 2) * 12} x2={40 + (i % 2) * 54 + i * 5} y2={96 + Math.floor(i / 2) * 12} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}
      <line x1="8" y1="124" x2="112" y2="124" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
      <rect x="8" y="130" width="18" height="3" rx="1" fill="currentColor" fillOpacity="0.1" />
      {Array.from({ length: 2 }, (_, i) => (
        <g key={i}>
          <rect x="8" y={140 + i * 10} width="20" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.06" />
          <rect x="60" y={140 + i * 10} width={14 + i * 6} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.05" />
        </g>
      ))}
    </>
  ),

  "/templates/birthday-tracker": (
    <>
      <rect x="8" y="14" width="62" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          <rect x="8" y={26 + i * 11} width="16" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
          <line x1="28" y1={27 + i * 11} x2="112" y2={27 + i * 11} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          <line x1="28" y1={28 + i * 11} x2={50 + (i * 11) % 40} y2={28 + i * 11} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}
    </>
  ),

  "/templates/password-log": (
    <>
      <rect x="8" y="14" width="44" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      <rect x="8" y="26" width="104" height="10" rx="1.5" fill="currentColor" fillOpacity="0.04" />
      <rect x="10" y="28" width="16" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="34" y="28" width="22" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="64" y="28" width="20" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      <rect x="92" y="28" width="16" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <line x1="8" y1={42 + i * 13} x2="112" y2={42 + i * 13} stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.06" />
          <line x1="10" y1={46 + i * 13} x2={22 + (i * 3) % 6} y2={46 + i * 13} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          <line x1="34" y1={46 + i * 13} x2={48 + (i * 5) % 8} y2={46 + i * 13} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.06" />
          <rect x="64" y={45 + i * 13} width={16 + (i * 3) % 6} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.04" />
          <rect x="92" y={45 + i * 13} width={10 + (i * 4) % 8} height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.04" />
        </g>
      ))}
    </>
  ),

  "/templates/cleaning-schedule": (
    <>
      <rect x="8" y="14" width="56" height="4" rx="1" fill="currentColor" fillOpacity="0.12" />
      {Array.from({ length: 7 }, (_, c) => (
        <rect key={c} x={30 + c * 12} y="24" width="9" height="3" rx="0.5" fill="currentColor" fillOpacity="0.08" />
      ))}
      {Array.from({ length: 8 }, (_, r) => (
        <g key={r}>
          <rect x="8" y={34 + r * 16} width="18" height="3" rx="0.5" fill="currentColor" fillOpacity="0.06" />
          {Array.from({ length: 7 }, (_, c) => (
            <rect key={c} x={31 + c * 12} y={32 + r * 16} width="7" height="7" rx="1" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.1" fill={(r + c) % 4 === 0 ? "currentColor" : "none"} fillOpacity={(r + c) % 4 === 0 ? "0.06" : "0"} />
          ))}
        </g>
      ))}
    </>
  ),
};

/* ---------- Fallback thumb (lined paper) ---------- */

export const fallbackThumb = (
  <>
    {Array.from({ length: 14 }, (_, i) => (
      <line key={i} x1="12" y1={16 + i * 10.5} x2="108" y2={16 + i * 10.5} stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.08" />
    ))}
  </>
);
