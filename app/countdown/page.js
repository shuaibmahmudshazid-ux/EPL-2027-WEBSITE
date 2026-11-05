import CountdownCard from "../../components/countdown-card";
import CodeMoleculeBrand from "../../components/code-molecule-brand";
import SiteNavbar from "../../components/site-navbar";
import Link from "next/link";
import { FaGavel, FaTowerBroadcast, FaTrophy, FaCalendarCheck } from "react-icons/fa6";

export const metadata = {
  title: "Official Auction Countdown | EPL 2027",
  description: "Live countdown to the EPL 2027 Player Auction draft. Begins today at 5:30 PM BD Time (GMT +6.00).",
};

export default function CountdownPage() {
  return (
    <div className="relative min-h-screen bg-[#070A12] text-white flex flex-col justify-between selection:bg-amber-400 selection:text-black overflow-x-hidden">
      <SiteNavbar />

      {/* Ambient background lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 size-[600px] rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute -bottom-40 right-1/4 size-[600px] rounded-full bg-sky-600/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 max-w-5xl mx-auto w-full">
        {/* Top Tournament Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-300 backdrop-blur-md mb-6 shadow-sm">
          <FaTrophy className="text-amber-400 text-xs" />
          <span>ESDM PREMIER LEAGUE 2027 • OFFICIAL DRAFT CLOCK</span>
        </div>

        {/* Page Headline */}
        <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-center text-white drop-shadow-[0_4px_25px_rgba(0,0,0,0.8)] mb-3">
          LIVE AUCTION <br className="hidden xs:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]">
            COUNTDOWN ARENA
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 text-center max-w-xl mx-auto mb-8 sm:mb-10">
          The mega auction draft begins <strong className="text-amber-300">Today at 5:30 PM BD Time (GMT +6.00)</strong>. 
          Real-time bidding, marquee player reveals, and dynamic team purses.
        </p>

        {/* The Countdown Card Component */}
        <div className="w-full max-w-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
          <CountdownCard className="w-full" />
        </div>

        {/* Navigation Quick Links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/auction"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <FaGavel className="text-xs" />
            <span>Enter Auction Arena</span>
          </Link>
          <Link
            href="/auction/stage"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-200 transition-all"
          >
            <FaTowerBroadcast className="text-xs text-amber-400" />
            <span>Auditorium Stage</span>
          </Link>
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-200 transition-all"
          >
            <FaCalendarCheck className="text-xs text-sky-400" />
            <span>Match Schedule</span>
          </Link>
        </div>
      </main>

      {/* Bottom Footer Info Bar */}
      <footer className="relative z-10 border-t border-white/10 bg-[#040711]/80 backdrop-blur-md px-4 py-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
          <span>
            © 2027 ESDM Premier League • PSTU. Organized with pride by <strong className="text-amber-400">Addyanta-14</strong>.
          </span>
          <span className="text-[11px] font-mono">
            BST = GMT +6.00 • Auditorium Screen Mode Available
          </span>
        </div>
      </footer>

      {/* Floating Bottom-Right: Developed by CodeMolecule */}
      <div className="fixed bottom-4 right-4 z-40">
        <CodeMoleculeBrand variant="floating" />
      </div>
    </div>
  );
}

