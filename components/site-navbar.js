"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGavel, FaLock, FaBars, FaXmark, FaTv, FaCalendarCheck } from "react-icons/fa6";

export default function SiteNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasFixtures, setHasFixtures] = useState(false);
  const [hasGallery, setHasGallery] = useState(false);
  const [hasTeams, setHasTeams] = useState(false);
  const [isAuctionLive, setIsAuctionLive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/fixtures", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setHasFixtures(Array.isArray(d.fixtures) && d.fixtures.length > 0))
      .catch(() => {});
    fetch("/api/gallery", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setHasGallery(Array.isArray(d.items) && d.items.length > 0))
      .catch(() => {});
    fetch("/api/auction/state", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setIsAuctionLive(d?.state?.status === "in_progress" || d?.state?.status === "paused");
        setHasTeams(Array.isArray(d?.teams) && d.teams.length > 0);
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Players", href: "/#players" },
    ...(hasFixtures ? [{ name: "Upcoming Fixtures", href: "/#fixtures" }] : []),
    ...(hasTeams ? [{ name: "Teams", href: "/#teams" }] : []),
    ...(hasGallery ? [{ name: "Gallery", href: "/#gallery" }] : []),
    { name: "Schedule", href: "/schedule" },
    { name: "Auction", href: "/auction" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0F1D]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          : "bg-[#0A0F1D]/75 backdrop-blur-md border-b border-white/5"
      }`}
    >
      {/* Top micro announcement bar */}
      <div className="hidden md:block border-b border-white/5 bg-[#070A12]/80 py-1.5 text-[11px] text-slate-400">
        <div className="mx-auto flex w-[min(1450px,calc(100%-48px))] items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-semibold text-slate-300">
              ESDM Premier League 2027 • Official Sports Portal
            </span>
            <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              AUCTION DRAFT: UPCOMING
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">
              Faculty of Environmental Science & Disaster Management, PSTU
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="h-[68px] sm:h-[80px]">
        <div className="mx-auto flex h-full w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))] items-center justify-between">
          {/* Left: Brand Logo + Crest */}
          <Link href="/" className="group flex items-center gap-2 xs:gap-3 sm:gap-3.5 min-w-0">
            <div className="relative size-10 xs:size-12 sm:size-14 transition-transform duration-300 group-hover:scale-105 shrink-0">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <Image
                className="relative object-contain filter drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)]"
                src="/epl-logo.png"
                alt="EPL 2027 - ESDM Premier League"
                fill
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1 sm:gap-1.5 leading-none">
                <span className="font-sans font-black text-xl xs:text-2xl sm:text-3xl tracking-tight text-white uppercase leading-none">
                  ESDM
                </span>
                <span className="font-sans font-bold text-base xs:text-lg sm:text-xl text-amber-400 tracking-tight">
                  2027
                </span>
              </div>
              <p className="text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-[1.5px] sm:tracking-[2px] text-slate-400 mt-1 leading-none truncate">
                PREMIER LEAGUE
              </p>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden h-full items-center gap-1 lg:flex xl:gap-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : item.href.startsWith("/#")
                  ? false
                  : pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex h-full items-center px-4 text-xs xl:text-sm font-bold tracking-wide transition-all ${
                    isActive
                      ? "text-amber-400 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-gradient-to-r after:from-amber-400 after:to-amber-500 after:shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Live Auction Pill & Portal Switches */}
          <div className="flex items-center gap-2 xs:gap-3 shrink-0">
            <Link
              href="/auction"
              className="group relative inline-flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-3 xs:px-4 sm:px-5 py-2 sm:py-2.5 text-[10px] xs:text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_24px_rgba(245,158,11,0.45)] hover:shadow-[0_0_32px_rgba(245,158,11,0.7)] hover:scale-[1.03] active:scale-95 transition-all overflow-hidden"
            >
              <span className="relative flex size-2 xs:size-2.5 shrink-0">
                <span className={`absolute inline-flex h-full w-full rounded-full ${isAuctionLive ? "animate-ping bg-emerald-400 opacity-80" : "bg-amber-700 opacity-40"}`} />
                <span className={`relative inline-flex size-2 xs:size-2.5 rounded-full ${isAuctionLive ? "bg-emerald-400 shadow-[0_0_8px_#10B981]" : "bg-amber-900"}`} />
              </span>
              <FaGavel className="text-[10px] xs:text-xs group-hover:rotate-12 transition-transform duration-200" />
              <span className="hidden xs:inline">{isAuctionLive ? "LIVE AUCTION" : "AUCTION ARENA"}</span>
              <span className="xs:hidden">AUCTION</span>
            </Link>

            <Link
              href="/schedule"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:border-amber-500/40 hover:bg-white/10 transition-all backdrop-blur-md"
            >
              <FaCalendarCheck className="text-xs text-amber-400" />
              <span>Fixtures</span>
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-xl border border-white/10 bg-white/5 p-2 xs:p-2.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <FaXmark className="size-5" /> : <FaBars className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#0A0F1D]/98 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl animate-in slide-in-from-top duration-200 max-h-[calc(100dvh-68px)] overflow-y-auto">
          <div className="mb-4">
            <Link
              href="/auction"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 p-3.5 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-lg shadow-amber-500/20"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <FaGavel /> ENTER LIVE AUCTION ARENA
            </Link>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/5 hover:text-amber-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <Link
              href="/secure-admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-amber-400 font-bold hover:text-amber-300 py-1"
            >
              <FaLock className="text-xs" /> Admin Portal
            </Link>
            <span className="text-[11px] text-slate-400">Addyanta-14</span>
          </div>
        </div>
      )}
    </header>
  );
}
