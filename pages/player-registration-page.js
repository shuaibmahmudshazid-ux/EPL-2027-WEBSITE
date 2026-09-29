import Image from "next/image";
import Link from "next/link";
import { FaGavel, FaArrowLeft } from "react-icons/fa6";
import PlayerRegistrationForm from "../components/player-registration-form";
import RegistrationRulesNotice from "../components/registration-rules-notice";
import SiteFooter from "../components/site-footer";

const navItems = ["Home", "About", "Schedule", "Teams", "Registration", "Contact"];
const container = "mx-auto w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]";

const RegistrationNavigation = () => (
  <header className="absolute inset-x-0 top-0 z-30 h-[72px] border-b border-white/15 bg-[#031320]/95 backdrop-blur-md text-white shadow-lg">
    <div className={`${container} flex h-full items-center justify-between`}>
      <Link className="flex items-center gap-3" href="/">
        <div className="relative size-11">
          <Image
            className="object-contain"
            src="/epl-logo.png"
            alt="EPL — ESDM Premier League"
            fill
            priority
          />
        </div>
        <div>
          <b className="block text-xl font-black tracking-tight leading-none">
            EPL <span className="text-[#d4a84f] text-base">2027</span>
          </b>
          <small className="block text-[8px] tracking-[1.5px] text-[#d4a84f] font-bold uppercase mt-0.5">
            ESDM PREMIER LEAGUE
          </small>
        </div>
      </Link>

      <nav className="hidden h-full items-center gap-8 min-[900px]:flex">
        {navItems.map((item) => (
          <Link
            className={`text-xs font-semibold tracking-wide transition-colors hover:text-[#d4a84f] ${
              item === "Registration" ? "text-[#d4a84f] font-bold" : "text-slate-300"
            }`}
            href={item === "Home" ? "/" : `/#${item.toLowerCase()}`}
            key={item}
          >
            {item}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] px-4 py-2 text-xs font-bold text-white shadow hover:brightness-110 transition"
          href="/auction"
        >
          <FaGavel /> Live Auction
        </Link>
        <Link
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
          href="/"
        >
          <FaArrowLeft className="text-[10px]" /> Back to Home
        </Link>
      </div>
    </div>
  </header>
);

const PlayerRegistrationPage = () => (
  <main className="bg-[#05131f] text-white">
    <section className="relative flex min-h-[715px] items-center overflow-hidden pt-[72px] min-[781px]:min-h-[585px] min-[1100px]:min-h-[max(800px,min(50vw,950px))]">
      <Image
        className="object-cover object-right-top"
        src="/cricket-stadium-desktop-v2.png"
        alt="Cricket stadium"
        fill
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030d17]/98 via-[#051625]/92 to-[#020b13]/85" />
      <RegistrationNavigation />
      <div className={`${container} relative z-10 w-full py-8 min-[1000px]:py-12`}>
        <div className="max-w-[860px]">
          <RegistrationRulesNotice />
          <PlayerRegistrationForm />
        </div>
      </div>
    </section>
    <SiteFooter />
  </main>
);

export default PlayerRegistrationPage;
