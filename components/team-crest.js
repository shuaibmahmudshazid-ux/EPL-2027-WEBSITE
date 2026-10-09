"use client";

import Image from "next/image";

export default function TeamCrest({ name = "", logoUrl = null, className = "size-10" }) {
  const cleanName = (name || "").toLowerCase();

  const renderInner = () => {
    if (logoUrl) {
      return (
        <div
          className="relative size-full rounded-full overflow-hidden border-2 border-amber-400/50 bg-[#070D1E] shadow-xl flex items-center justify-center p-0.5 ring-2 ring-amber-500/30 transition-transform duration-300 group-hover:scale-105"
        >
          <Image src={logoUrl} alt={name} fill unoptimized className="object-cover rounded-full" />
        </div>
      );
    }

    // 1. STORMERS PSTU (Navy / Electric Blue Cyclone & Lightning)
    if (cleanName.includes("stormer")) {
      return (
        <div
          className="relative size-full rounded-full overflow-hidden border-2 border-blue-400/50 bg-[#0B132B] shadow-xl grid place-items-center ring-2 ring-blue-500/30 transition-transform duration-300"
        >
          <svg viewBox="0 0 100 100" className="size-full filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.6)]">
            <defs>
              <linearGradient id="stormGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E40AF" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <linearGradient id="stormRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="#0B132B" />
            <ellipse cx="50" cy="50" rx="44" ry="24" fill="none" stroke="url(#stormRing)" strokeWidth="6" transform="rotate(-25 50 50)" opacity="0.85" />
            <circle cx="50" cy="50" r="32" fill="#0B132B" stroke="#60A5FA" strokeWidth="3" />
            <path d="M38 52 C32 40, 68 40, 62 52 C58 60, 42 60, 38 52 Z" fill="url(#stormGrad)" />
            <polygon points="52,32 44,48 51,48 47,66 60,47 53,47" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
          </svg>
        </div>
      );
    }

    // 2. TITANS PSTU (Obsidian / Titanium Helmet Shield)
    if (cleanName.includes("titan")) {
      return (
        <div
          className="relative size-full rounded-full overflow-hidden border-2 border-slate-400/50 bg-[#0F172A] shadow-xl grid place-items-center ring-2 ring-sky-500/30 transition-transform duration-300"
        >
          <svg viewBox="0 0 100 100" className="size-full filter drop-shadow-[0_2px_8px_rgba(148,163,184,0.5)]">
            <defs>
              <linearGradient id="titanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="#0A1120" />
            <path d="M50 12 L82 24 L78 62 L50 88 L22 62 L18 24 Z" fill="url(#titanGrad)" stroke="#94A3B8" strokeWidth="3" />
            <polygon points="50,22 64,36 58,40 50,30 42,40 36,36" fill="#F8FAFC" />
            <path d="M34 46 L66 46 L60 68 L50 78 L40 68 Z" fill="#0B1120" stroke="#38BDF8" strokeWidth="2" />
            <polygon points="50,50 58,64 42,64" fill="#38BDF8" opacity="0.8" />
          </svg>
        </div>
      );
    }

    // 3. WARRIORS PSTU (Gold & Bronze Armored Lion Shield)
    if (cleanName.includes("warrior")) {
      return (
        <div
          className="relative size-full rounded-full overflow-hidden border-2 border-amber-500/50 bg-[#1C1408] shadow-xl grid place-items-center ring-2 ring-amber-500/30 transition-transform duration-300"
        >
          <svg viewBox="0 0 100 100" className="size-full filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]">
            <defs>
              <linearGradient id="warriorGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="#1C1408" />
            <path d="M50 14 C76 14, 84 26, 84 56 C84 76, 50 90, 50 90 C50 90, 16 76, 16 56 C16 26, 24 14, 50 14 Z" fill="#291807" stroke="#F59E0B" strokeWidth="3" />
            <path d="M50 26 L62 40 L56 42 L50 34 L44 42 L38 40 Z" fill="#FDE68A" />
            <path d="M34 44 C42 40, 58 40, 66 44 C68 58, 62 70, 50 76 C38 70, 32 58, 34 44 Z" fill="url(#warriorGold)" />
            <line x1="28" y1="28" x2="72" y2="72" stroke="#FEF08A" strokeWidth="3" strokeLinecap="round" />
            <line x1="72" y1="28" x2="28" y2="72" stroke="#FEF08A" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      );
    }

    // 4. GLADIATORS PSTU (Crimson & Gold Crest)
    if (cleanName.includes("gladiator")) {
      return (
        <div
          className="relative size-full rounded-full overflow-hidden border-2 border-red-500/50 bg-[#180407] shadow-xl grid place-items-center ring-2 ring-red-500/30 transition-transform duration-300"
        >
          <svg viewBox="0 0 100 100" className="size-full filter drop-shadow-[0_2px_8px_rgba(220,38,38,0.6)]">
            <defs>
              <linearGradient id="gladGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DC2626" />
                <stop offset="50%" stopColor="#991B1B" />
                <stop offset="100%" stopColor="#450A0A" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="#180407" />
            <path d="M50 12 L78 28 L74 68 L50 88 L26 68 L22 28 Z" fill="url(#gladGrad)" stroke="#F59E0B" strokeWidth="3" />
            <path d="M42 22 C46 16, 54 16, 58 22 L54 36 L46 36 Z" fill="#EF4444" stroke="#FDE047" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="18" fill="#180407" stroke="#F59E0B" strokeWidth="2" />
            <line x1="36" y1="36" x2="64" y2="64" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="64" y1="36" x2="36" y2="64" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );
    }

    // 5. CRIMSONS PSTU (Deep Scarlet / Flame Crest)
    if (cleanName.includes("crimson")) {
      return (
        <div
          className="relative size-full rounded-full overflow-hidden border-2 border-rose-500/50 bg-[#24060E] shadow-xl grid place-items-center ring-2 ring-rose-500/30 transition-transform duration-300"
        >
          <svg viewBox="0 0 100 100" className="size-full filter drop-shadow-[0_2px_8px_rgba(225,29,72,0.6)]">
            <defs>
              <linearGradient id="crimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E11D48" />
                <stop offset="50%" stopColor="#9F1239" />
                <stop offset="100%" stopColor="#4C0519" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="#24060E" />
            <polygon points="50,14 82,32 74,74 50,88 26,74 18,32" fill="url(#crimsonGrad)" stroke="#FDA4AF" strokeWidth="2.5" />
            <path d="M36 34 L44 46 L50 40 L56 46 L64 34 L60 54 L50 68 L40 54 Z" fill="#FFE4E6" />
            <circle cx="45" cy="48" r="2.5" fill="#E11D48" />
            <circle cx="55" cy="48" r="2.5" fill="#E11D48" />
          </svg>
        </div>
      );
    }

    // 6. ROYALS PSTU (Royal Purple / Imperial Crown Crest)
    if (cleanName.includes("royal")) {
      return (
        <div
          className="relative size-full rounded-full overflow-hidden border-2 border-purple-500/50 bg-[#3B0764] shadow-xl grid place-items-center ring-2 ring-purple-500/30 transition-transform duration-300"
        >
          <svg viewBox="0 0 100 100" className="size-full filter drop-shadow-[0_2px_8px_rgba(168,85,247,0.6)]">
            <defs>
              <linearGradient id="royalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333EA" />
                <stop offset="50%" stopColor="#6B21A8" />
                <stop offset="100%" stopColor="#3B0764" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#royalGrad)" stroke="#FDE047" strokeWidth="3" />
            <polygon points="32,46 38,36 44,44 50,32 56,44 62,36 68,46 64,56 36,56" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
            <text x="50" y="74" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">
              RP
            </text>
          </svg>
        </div>
      );
    }

    // Default Monogram Circle Emblem
    return (
      <div
        className="relative size-full rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 grid place-items-center font-black text-white text-xs sm:text-sm border-2 border-white/30 shadow-xl ring-2 ring-amber-500/30 tracking-wider"
      >
        {name ? name.slice(0, 3).toUpperCase() : "EPL"}
      </div>
    );
  };

  return (
    <div className={`relative ${className} shrink-0 grid place-items-center`}>
      {/* Motion Graphics: Expanding radar pulse wave */}
      <div className="pointer-events-none absolute -inset-2.5 rounded-full border border-amber-400/25 animate-crest-wave" />
      {/* Motion Graphics: Rotating dashed orbital ring */}
      <div className="pointer-events-none absolute -inset-1.5 rounded-full border border-dashed border-amber-400/45 animate-crest-orbit" />
      {/* Motion Graphics: Counter-rotating fine outer ring */}
      <div className="pointer-events-none absolute -inset-3 rounded-full border border-dotted border-amber-300/20 animate-crest-orbit-fast" />
      {/* Core Circular Emblem */}
      {renderInner()}
    </div>
  );
}
