"use client";

/**
 * Code Molecule Brand Unit Component
 * Displays the live animated logo mark and brand typography
 * using Code Molecule's original signature green brand colors:
 * - Big 'C' & Droplets: #18a04a
 * - Hub & Nodes: #70d494
 * - "Code": #ffffff
 * - "Molecule": Gradient from #26c761 via #41d877 to #33d6b3
 */
export default function CodeMoleculeBrand({
  className = "",
  showLabel = true,
  href = "https://codemolecule.com",
  variant = "badge", // "badge" | "inline" | "floating"
}) {
  const content = (
    <div
      className={`codemolecule-wrapper inline-flex items-center gap-2 ${
        variant === "badge"
          ? "rounded-full border border-white/15 bg-black/85 px-3.5 py-1.5 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.8)] hover:border-[#18a04a]/60 hover:shadow-[0_0_20px_rgba(24,160,74,0.35)] transition-all"
          : variant === "floating"
          ? "rounded-full border border-[#18a04a]/40 bg-[#06100a]/90 px-3.5 py-1.5 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.85)] hover:border-[#26c761] hover:scale-105 transition-all"
          : ""
      } ${className}`}
    >
      {showLabel && (
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 select-none">
          Developed by
        </span>
      )}

      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="codemolecule-brand group inline-flex items-center gap-2 cursor-pointer no-underline"
        id="brandUnit"
        title="Code Molecule — Software & Web Solutions"
      >
        {/* 1. Live Animated Logo Mark */}
        <span className="brand-mark inline-flex items-center justify-center shrink-0" id="brandMark">
          <svg
            className="live-logo size-6 sm:size-7 shrink-0 transition-transform duration-300 group-hover:scale-110"
            id="liveLogoSvg"
            viewBox="0 0 1932 1932"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Code Molecule Live Logo"
          >
            <defs>
              <filter
                id="goo-cm"
                filterUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="1932"
                height="1932"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="26" />
                <feColorMatrix
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -12"
                />
              </filter>
            </defs>

            {/* Big 'C' Shape */}
            <g>
              <path
                d="M1153 478 A520 520 0 1 0 1153 1442"
                fill="none"
                stroke="var(--c-dark, #18a04a)"
                strokeWidth="210"
                strokeLinecap="round"
              />
            </g>

            {/* Connector Base Lines */}
            <g stroke="var(--c-light, #70d494)" strokeWidth="70" strokeLinecap="round" fill="none">
              <path d="M1110 880 L1400 670" />
              <path d="M1110 1060 L1390 1270" />
            </g>

            {/* Flowing Liquid Droplets */}
            <g filter="url(#goo-cm)">
              <g stroke="var(--c-dark, #18a04a)" strokeWidth="70" strokeLinecap="round" fill="none">
                <path className="fill-line" pathLength="100" d="M1110 880 L1400 670" />
                <path className="fill-line" pathLength="100" d="M1110 1060 L1390 1270" />
              </g>
              <g id="stream" className="drops">
                <circle r="43.8" style={{ offsetPath: 'path("M 1110 880 L 1400 670")', offsetRotate: "0deg" }} />
                <circle r="35.3" style={{ offsetPath: 'path("M 1110 880 L 1400 670")', offsetRotate: "0deg" }} />
                <circle r="43.6" style={{ offsetPath: 'path("M 1110 880 L 1400 670")', offsetRotate: "0deg" }} />
                <circle r="41.6" style={{ offsetPath: 'path("M 1110 880 L 1400 670")', offsetRotate: "0deg" }} />
                <circle r="43.3" style={{ offsetPath: 'path("M 1110 880 L 1400 670")', offsetRotate: "0deg" }} />
                <circle r="40.7" style={{ offsetPath: 'path("M 1110 880 L 1400 670")', offsetRotate: "0deg" }} />
                <circle r="45.8" style={{ offsetPath: 'path("M 1110 880 L 1400 670")', offsetRotate: "0deg" }} />
                <circle r="45.4" style={{ offsetPath: 'path("M 1110 1060 L 1390 1270")', offsetRotate: "0deg" }} />
                <circle r="43.0" style={{ offsetPath: 'path("M 1110 1060 L 1390 1270")', offsetRotate: "0deg" }} />
                <circle r="41.8" style={{ offsetPath: 'path("M 1110 1060 L 1390 1270")', offsetRotate: "0deg" }} />
                <circle r="36.5" style={{ offsetPath: 'path("M 1110 1060 L 1390 1270")', offsetRotate: "0deg" }} />
                <circle r="45.2" style={{ offsetPath: 'path("M 1110 1060 L 1390 1270")', offsetRotate: "0deg" }} />
                <circle r="35.4" style={{ offsetPath: 'path("M 1110 1060 L 1390 1270")', offsetRotate: "0deg" }} />
                <circle r="44.0" style={{ offsetPath: 'path("M 1110 1060 L 1390 1270")', offsetRotate: "0deg" }} />
              </g>
            </g>

            {/* Central Hub Server */}
            <g className="hub">
              <circle cx="958" cy="968" r="212" fill="var(--c-light, #70d494)" />
              <circle className="tint" cx="958" cy="968" r="212" />
              <circle className="glow" cx="958" cy="968" r="212" />
              <g fill="var(--icon-white, #ffffff)">
                <rect x="830" y="872" width="254" height="55" rx="22" />
                <rect x="830" y="941" width="254" height="53" />
                <rect x="830" y="1008" width="254" height="55" rx="22" />
              </g>
              {/* Server indicator dots in dark #1a1a1a */}
              <g fill="var(--icon-grey, #1a1a1a)">
                <circle cx="1014" cy="899" r="9" />
                <circle cx="1047" cy="899" r="12" />
                <circle cx="1014" cy="967" r="9" />
                <circle cx="1047" cy="967" r="12" />
                <circle cx="1014" cy="1036" r="9" />
                <circle cx="1047" cy="1036" r="12" />
                <circle className="led l1" cx="867" cy="967" r="7" />
                <circle className="led l2" cx="889" cy="967" r="7" />
                <circle className="led l3" cx="912" cy="967" r="7" />
                <circle className="led l3" cx="867" cy="1036" r="7" />
                <circle className="led l1" cx="889" cy="1036" r="7" />
                <circle className="led l2" cx="912" cy="1036" r="7" />
              </g>
            </g>

            {/* Top Node: Laptop */}
            <g className="pop">
              <circle className="burst" cx="1471" cy="583" r="174" />
              <circle className="flash" cx="1471" cy="583" r="174" />
              <rect x="1373" y="500" width="196" height="136" rx="14" fill="var(--icon-white, #ffffff)" />
              {/* Dark Screen #1a1a1a */}
              <rect x="1393" y="520" width="156" height="99" fill="var(--icon-grey, #1a1a1a)" />
              <path d="M1357 641 H1583 Q1580 660 1560 660 H1380 Q1360 660 1357 641 Z" fill="var(--icon-white, #ffffff)" />
            </g>

            {/* Bottom Node: Phone */}
            <g className="pop">
              <circle className="burst" cx="1467" cy="1335" r="174" />
              <circle className="flash" cx="1467" cy="1335" r="174" />
              <rect x="1397" y="1220" width="140" height="228" rx="22" fill="var(--icon-white, #ffffff)" />
              {/* Dark Screen #1a1a1a */}
              <rect x="1415" y="1246" width="105" height="156" fill="var(--icon-grey, #1a1a1a)" />
              {/* Dark Button #1a1a1a */}
              <circle cx="1467" cy="1423" r="10" fill="var(--icon-grey, #1a1a1a)" />
            </g>
          </svg>
        </span>

        {/* 2. Typography: Code Molecule */}
        <span className="brand-text flex items-center font-bold tracking-tight text-sm sm:text-base text-white" id="brandText">
          <span>Code</span>
          <span className="gradient-text ml-1.5 font-bold bg-gradient-to-r from-[#26c761] via-[#41d877] to-[#33d6b3] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(38,199,97,0.35)]">
            Molecule
          </span>
        </span>
      </a>
    </div>
  );

  return content;
}
