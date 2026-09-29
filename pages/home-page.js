import Image from "next/image";
import Link from "next/link";
import { FaPhone, FaEnvelope, FaGavel, FaLock } from "react-icons/fa6";
import Hero from "../components/hero";
import TournamentInfo from "../components/tournament-info";
import SiteFooter from "../components/site-footer";

const navItems = ["Home", "About", "Schedule", "Teams", "Registration", "Contact"];
const container = "mx-auto w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]";

const Navigation = () => {
  return (
    <header className="absolute inset-x-0 top-0 z-30 text-white">
      {/* 1. TOP ANNOUNCEMENT & CONTACT BAR (CRICAUCTION SIGNATURE) */}
      <div className="hidden sm:block border-b border-white/10 bg-[#020b13]/90 py-1.5 text-xs text-slate-300">
        <div className={`${container} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-medium text-slate-200">
              © EPL 2027 ESDM Premier League
            </span>
          </div>
          <div className="flex items-center gap-5 text-[11px]">
            <a
              href="tel:01303526267"
              className="flex items-center gap-1.5 hover:text-[#d4a84f] transition-colors"
            >
              <FaPhone className="text-[#d4a84f] text-[10px]" />
              <span>01303526267</span>
            </a>
            <span className="text-white/20">|</span>
            <a
              href="mailto:shuaibmahmudshazid@gmail.com"
              className="flex items-center gap-1.5 hover:text-[#d4a84f] transition-colors"
            >
              <FaEnvelope className="text-[#d4a84f] text-[10px]" />
              <span>shuaibmahmudshazid@gmail.com</span>
            </a>
            <span className="text-white/20">|</span>
            <Link
              href="/secure-admin"
              className="flex items-center gap-1 text-[#d4a84f] hover:underline font-bold"
            >
              <FaLock className="text-[10px]" />
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION NAVBAR */}
      <div className="h-[68px] sm:h-[76px] border-b border-white/15 bg-[#031320]/95 backdrop-blur-md shadow-lg">
        <div className={`${container} flex h-full items-center justify-between`}>
          {/* Brand Logo */}
          <Link className="flex items-center gap-3 group" href="#home">
            <div className="relative size-11 sm:size-13">
              <Image
                className="object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                src="/epl-logo.png"
                alt="EPL — ESDM Premier League"
                fill
                priority
              />
            </div>
            <div>
              <b className="block text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                EPL <span className="text-[#d4a84f] text-base font-bold">2027</span>
              </b>
              <small className="block text-[8px] sm:text-[9px] tracking-[1.5px] text-[#d4a84f] font-bold uppercase mt-0.5">
                ESDM PREMIER LEAGUE
              </small>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden h-full items-center gap-6 min-[1050px]:flex min-[1200px]:gap-9">
            {navItems.map((item, index) => (
              <a
                className={`relative flex items-center h-full text-xs min-[1200px]:text-sm font-semibold tracking-wide transition-colors hover:text-[#d4a84f] ${
                  index === 0
                    ? "text-[#d4a84f] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#d4a84f]"
                    : "text-slate-200"
                }`}
                href={`#${item.toLowerCase()}`}
                key={item}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all overflow-hidden group"
              href="/auction"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
                <span className="relative inline-flex size-2 rounded-full bg-white" />
              </span>
              <FaGavel className="text-xs" />
              <span>LIVE AUCTION</span>
            </Link>

            <a
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#d4a84f]/40 bg-[#d4a84f]/10 px-4 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider text-[#d4a84f] hover:bg-[#d4a84f] hover:text-[#05131f] transition-all"
              href="#schedule"
            >
              Tournament Schedule
            </a>

            {/* Mobile Drawer Menu */}
            <details className="relative min-[1050px]:hidden">
              <summary className="cursor-pointer list-none rounded-xl border border-white/20 bg-white/5 p-2 text-xl text-white hover:bg-white/10">
                ☰
              </summary>
              <nav className="absolute right-0 top-12 w-60 rounded-2xl border border-white/20 bg-[#031320] p-3 shadow-2xl backdrop-blur-xl">
                <Link
                  className="flex items-center gap-2 rounded-xl bg-red-600/90 p-3 text-xs font-extrabold uppercase tracking-wider text-white mb-2 shadow"
                  href="/auction"
                >
                  <FaGavel /> Live Auction Arena
                </Link>
                {navItems.map((item) => (
                  <a
                    className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-[#d4a84f]"
                    href={`#${item.toLowerCase()}`}
                    key={item}
                  >
                    {item}
                  </a>
                ))}
                <div className="mt-2 pt-2 border-t border-white/10">
                  <Link
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#d4a84f] hover:bg-white/10"
                    href="/secure-admin"
                  >
                    <FaLock /> Admin Login
                  </Link>
                </div>
              </nav>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
};

const HomePage = () => (
  <main className="overflow-hidden bg-[#f8fafc] text-[#0f172a]">
    <Navigation />
    <Hero />
    <TournamentInfo />
    <SiteFooter />
  </main>
);

export default HomePage;
