"use client";

/**
 * Realistic circular rubber stamp overlay for SOLD and UNSOLD auction athletes.
 * Features an authentic double-ring boundary, authentic tilt angle,
 * rubber-ink glow, and stamp slam animation.
 */
export default function AuctionRoundStamp({
  status, // "sold" | "unsold"
  size = "md", // "xs" | "sm" | "md" | "lg" | "xl" | "responsive"
  animated = true,
  className = "",
  price = null,
  teamName = null,
}) {
  const normalizedStatus = (status || "").toLowerCase().trim();
  if (normalizedStatus !== "sold" && normalizedStatus !== "unsold") {
    return null;
  }

  const isSold = normalizedStatus === "sold";

  // Size configurations
  const sizeMap = {
    xs: {
      box: "size-10",
      outerRing: "border-[1.5px] p-[1.5px]",
      innerRing: "border-[1px]",
      title: "text-[7px] tracking-widest",
      sub: "text-[4px]",
      stars: "text-[5px]",
    },
    sm: {
      box: "size-16 sm:size-20",
      outerRing: "border-2 p-1",
      innerRing: "border-[1.5px]",
      title: "text-[12px] sm:text-[14px] tracking-[0.2em]",
      sub: "text-[7px] sm:text-[8px] tracking-wider",
      stars: "text-[8px] sm:text-[9px]",
    },
    md: {
      box: "size-28 sm:size-32 md:size-36",
      outerRing: "border-[3px] p-1.5",
      innerRing: "border-2",
      title: "text-[22px] sm:text-[26px] tracking-[0.22em]",
      sub: "text-[9px] sm:text-[10px] tracking-widest",
      stars: "text-[10px] sm:text-[12px]",
    },
    lg: {
      box: "size-36 sm:size-44 md:size-52",
      outerRing: "border-[4px] p-2",
      innerRing: "border-[2.5px]",
      title: "text-[30px] sm:text-[38px] md:text-[44px] tracking-[0.25em]",
      sub: "text-[11px] sm:text-[13px] md:text-[14px] tracking-[0.2em]",
      stars: "text-[13px] sm:text-[15px]",
    },
    xl: {
      box: "size-48 sm:size-56 md:size-64 lg:size-72",
      outerRing: "border-[5px] p-2.5",
      innerRing: "border-[3px]",
      title: "text-[42px] sm:text-[50px] md:text-[60px] tracking-[0.26em]",
      sub: "text-[13px] sm:text-[16px] tracking-[0.25em]",
      stars: "text-[16px] sm:text-[20px]",
    },
    responsive: {
      box: "size-[70%] max-size-[220px] min-size-[110px]",
      outerRing: "border-[3px] sm:border-[4px] p-1.5 sm:p-2",
      innerRing: "border-[1.5px] sm:border-2",
      title: "text-[20px] xs:text-[24px] sm:text-[32px] md:text-[38px] tracking-[0.24em]",
      sub: "text-[8px] xs:text-[10px] sm:text-[12px] tracking-[0.2em]",
      stars: "text-[9px] xs:text-[11px] sm:text-[13px]",
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Theme styling
  const theme = isSold
    ? {
        color: "text-emerald-400",
        border: "border-emerald-500",
        bg: "bg-emerald-950/75",
        glow: "shadow-[0_0_30px_rgba(16,185,129,0.5),inset_0_0_20px_rgba(16,185,129,0.3)]",
        drop: "drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]",
        label: "SOLD",
        subtext: "EPL 2027",
        auxText: "OFFICIAL",
      }
    : {
        color: "text-rose-500",
        border: "border-rose-600",
        bg: "bg-rose-950/75",
        glow: "shadow-[0_0_30px_rgba(244,63,94,0.5),inset_0_0_20px_rgba(244,63,94,0.3)]",
        drop: "drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]",
        label: "UNSOLD",
        subtext: "PASSED",
        auxText: "AUCTION",
      };

  return (
    <div
      aria-label={`Auction status: ${theme.label}`}
      className={`pointer-events-none select-none z-30 aspect-square rounded-full flex items-center justify-center ${
        currentSize.box
      } ${theme.border} ${theme.color} ${theme.bg} ${theme.glow} ${theme.drop} backdrop-blur-md ${
        currentSize.outerRing
      } ${
        animated ? "animate-stamp" : "rotate-[-12deg]"
      } ${className}`}
    >
      {/* Inner Ring (Double Stamp Boundary) */}
      <div
        className={`size-full rounded-full ${theme.border} ${currentSize.innerRing} flex flex-col items-center justify-between py-[12%] px-[8%] text-center border-dashed sm:border-solid`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-center gap-1 opacity-90">
          <span className={currentSize.stars}>★</span>
          <span className={`font-black uppercase ${currentSize.sub}`}>
            {theme.auxText}
          </span>
          <span className={currentSize.stars}>★</span>
        </div>

        {/* Center Heavy Bold Stamp Label */}
        <div className="my-auto flex flex-col items-center justify-center">
          <span
            className={`font-black uppercase leading-none font-sans drop-shadow-md ${currentSize.title}`}
            style={{
              textShadow: isSold
                ? "0 0 10px rgba(16,185,129,0.8), 0 2px 4px rgba(0,0,0,0.9)"
                : "0 0 10px rgba(244,63,94,0.8), 0 2px 4px rgba(0,0,0,0.9)",
            }}
          >
            {theme.label}
          </span>

          {/* Optional inline Sold price in stamp */}
          {price && isSold && (
            <span className="mt-0.5 font-mono font-black text-[9px] sm:text-[11px] text-white/90 tracking-normal">
              ৳ {typeof price === "number" ? price.toLocaleString() : price}
            </span>
          )}
        </div>

        {/* Bottom Subtext */}
        <div className="flex items-center justify-center gap-1 opacity-90">
          <span className={currentSize.stars}>★</span>
          <span className={`font-black uppercase ${currentSize.sub}`}>
            {theme.subtext}
          </span>
          <span className={currentSize.stars}>★</span>
        </div>
      </div>
    </div>
  );
}
