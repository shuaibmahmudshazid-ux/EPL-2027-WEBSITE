import Link from "next/link";
import Image from "next/image";
import {
  FaArrowRight,
  FaCalendarDays,
  FaCheck,
  FaGavel,
  FaLayerGroup,
  FaShieldHalved,
  FaTrophy,
  FaUserPlus,
  FaUsers,
  FaBolt,
  FaChartLine,
} from "react-icons/fa6";
import SectionTitle from "./section-title";

const container =
  "mx-auto w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]";

const highlights = [
  {
    icon: FaTrophy,
    name: "Competitive Matches",
    text: "Exciting T10 matches between top teams.",
    color: "from-amber-500 to-amber-700 text-white",
  },
  {
    icon: FaBolt,
    name: "Top Talent",
    text: "Showcase your skills and shine on the big stage.",
    color: "from-red-500 to-red-700 text-white",
  },
  {
    icon: FaShieldHalved,
    name: "Prizes & Rewards",
    text: "Attractive prizes for winners and runners-up.",
    color: "from-blue-500 to-blue-700 text-white",
  },
  {
    icon: FaChartLine,
    name: "Live Updates",
    text: "Live scores, match updates and much more.",
    color: "from-emerald-500 to-emerald-700 text-white",
  },
];

const features = [
  {
    num: "01",
    title: "Live Player Auction",
    text: "Experience real-time interactive player bidding with instant sound chimes, timer countdowns, and dynamic team budgets.",
    icon: FaGavel,
  },
  {
    num: "02",
    title: "Team Management",
    text: "Create and organize teams with unique shortcut keys, manager information, and custom club logos.",
    icon: FaUsers,
  },
  {
    num: "03",
    title: "Player Registration",
    text: "Manage player profiles, student IDs, academic sessions, playing categories, and passport photos effortlessly.",
    icon: FaUserPlus,
  },
  {
    num: "04",
    title: "Auction Tiers & Base Prices",
    text: "Divide players into balanced categories (Batsman, Bowler, All-rounder) with tailored base prices.",
    icon: FaLayerGroup,
  },
];

const steps = [
  {
    num: 1,
    title: "Player Registration",
    desc: "Submit your student roll, academic session, playing category, and photo to join the tournament draft pool.",
    icon: FaUserPlus,
    link: "/player-registration",
    btn: "Register Player",
  },
  {
    num: 2,
    title: "Team Registration",
    desc: "Team managers register with verified unique keys, contact details, and club emblem to participate.",
    icon: FaUsers,
    link: "/team-registration",
    btn: "Register Team",
  },
  {
    num: 3,
    title: "Auction Tiers",
    desc: "Players are categorized into tiers with base prices to ensure a competitive and fair draft bidding.",
    icon: FaLayerGroup,
    link: "/auction",
    btn: "View Tiers",
  },
  {
    num: 4,
    title: "Live Bidding Arena",
    desc: "Team owners bid live in real-time to build their dream squad and compete for the EPL 2027 championship!",
    icon: FaGavel,
    link: "/auction",
    btn: "Enter Arena",
  },
];

const numbers = [
  { label: "Match Format", value: "T10", note: "High-Octane Cricket" },
  { label: "Competing Teams", value: "Multi-Team", note: "ESDM Department Squads" },
  { label: "Draft Pool", value: "100+", note: "Registered Students & Alumni" },
  { label: "Grand Prize", value: "1 Trophy", note: "Eternal Faculty Glory" },
];

const reasons = [
  "Build teamwork and leadership",
  "Network with peers and seniors",
  "Boost your campus experience",
  "Be part of the ESDM legacy",
];

const TournamentInfo = () => {
  return (
    <div id="about" className="bg-[#f8fafc] text-[#0f172a]">
      {/* 1. CRICAUCTION-STYLE AUCTION STATUS CARDS */}
      <section className="py-12 border-b border-slate-200/80 bg-white">
        <div className={container}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 mb-2 shadow-xs">
                <span className="size-2 rounded-full bg-red-600 animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#c53030]">
                  Live Arena & Schedule
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f172a]">
                Tournament <span className="text-[#c53030]">Auctions & Portal</span>
              </h2>
            </div>
            <Link
              href="/auction"
              className="inline-flex items-center gap-2 rounded-xl bg-[#c53030] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#b91c1c] hover:shadow-lg transition-all"
            >
              <FaGavel />
              Enter Live Arena
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Live Auction Arena */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-400 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-[11px] font-extrabold text-[#c53030]">
                  <span className="size-1.5 rounded-full bg-red-600 animate-pulse" />
                  LIVE ARENA
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <FaCalendarDays className="text-[#c53030]" />
                  9th October 2026
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-[#0c2438] to-[#04101a] p-2 flex items-center justify-center shadow-md">
                  <Image src="/epl-logo.png" alt="EPL" width={48} height={48} className="object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-[#c53030] transition-colors">
                    EPL Live Auction Arena
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">ESDM Premier League Player Bidding</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Real-time team bidding</span>
                <Link
                  href="/auction"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c53030] hover:underline"
                >
                  Join Arena <FaArrowRight />
                </Link>
              </div>
            </div>

            {/* Card 2: Team Registration */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-extrabold text-amber-800">
                  <FaShieldHalved />
                  TEAM ACCESS
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <FaCalendarDays className="text-slate-400" />
                  Registration Open
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-[#d4a84f] to-[#a37424] p-3 flex items-center justify-center text-white text-2xl shadow-md">
                  <FaUsers />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                    Team Registration
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Claim your team key & register</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Authorized team managers</span>
                <Link
                  href="/team-registration"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline"
                >
                  Register Team <FaArrowRight />
                </Link>
              </div>
            </div>

            {/* Card 3: Player Registration */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-extrabold text-blue-800">
                  <FaUserPlus />
                  PLAYER DRAFT
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <FaCalendarDays className="text-slate-400" />
                  Open For Students
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 p-3 flex items-center justify-center text-white text-2xl shadow-md">
                  <FaUserPlus />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                    Player Registration
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Enrol with roll & player stats</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">ESDM students & alumni</span>
                <Link
                  href="/player-registration"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                >
                  Register Player <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TOURNAMENT HIGHLIGHTS */}
      <section className="py-14 sm:py-16">
        <div className={container}>
          <SectionTitle
            main="TOURNAMENT"
            green="HIGHLIGHTS"
            subtitle="The premier university cricket festival uniting the students, alumni, and faculty of ESDM."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ icon: Icon, name, text, color }, index) => (
              <article
                key={name}
                className="group relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className={`size-13 rounded-2xl bg-gradient-to-br ${color} grid place-items-center text-xl shadow-md mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon />
                </div>
                <h3 className="text-base font-extrabold uppercase tracking-wide text-slate-900 mb-2">
                  {name}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 m-0">
                  {text}
                </p>
                <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-[#c53030] transition-colors">
                  <span>Feature #{index + 1}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE CRICAUCTION NUMBERED FEATURES SECTION (01, 02, 03, 04) */}
      <section className="py-14 sm:py-16 bg-gradient-to-b from-white to-[#f1f5f9] border-y border-slate-200/80">
        <div className={container}>
          <SectionTitle
            main="OUR PLATFORM"
            green="FEATURES"
            subtitle="Explore how the EPL digital auction system brings professional IPL-style bidding to university cricket."
            center
          />

          <div className="grid gap-6 md:grid-cols-2">
            {features.map(({ num, title, text, icon: Icon }) => (
              <div
                key={num}
                className="group relative flex items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-red-300 hover:shadow-xl"
              >
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-black text-slate-200 group-hover:text-[#c53030] transition-colors tabular-nums">
                    {num}
                  </span>
                  <div className="size-10 mt-2 rounded-xl bg-red-50 text-[#c53030] grid place-items-center text-base border border-red-100">
                    <Icon />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#c53030] transition-colors">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. EPL IN NUMBERS (CRICAUCTION METRIC COUNTERS) */}
      <section className="py-14 sm:py-16 bg-[#05131f] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,168,79,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(197,48,48,0.15),transparent_40%)]" />

        <div className={`${container} relative z-10`}>
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4a84f]">
                Tournament Stats
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              EPL <span className="text-[#d4a84f]">in Numbers</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Join the largest and most prestigious cricket tournament of the ESDM Faculty.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {numbers.map(({ label, value, note }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-white/10"
              >
                <b className="block text-3xl sm:text-4xl font-black tracking-tight text-[#d4a84f] tabular-nums">
                  {value}
                </b>
                <h4 className="mt-2 text-sm font-extrabold uppercase tracking-wider text-white">
                  {label}
                </h4>
                <p className="mt-1 text-xs text-slate-400">{note}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-r from-red-950/40 via-black/40 to-amber-950/40 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <span className="text-2xl">🏏</span>
              <div>
                <b className="block text-sm font-bold text-white">Ready to join the ESDM Cricket Showdown?</b>
                <span className="text-xs text-slate-400">Register your team or sign up as an individual player now.</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/player-registration"
                className="rounded-xl bg-[#c53030] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 transition"
              >
                Register Player
              </Link>
              <Link
                href="/team-registration"
                className="rounded-xl bg-[#d4a84f] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition"
              >
                Register Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HELP & HOW IT WORKS (CRICAUCTION 4-STEP TIMELINE) */}
      <section className="py-14 sm:py-16 bg-white border-b border-slate-200">
        <div className={container}>
          <SectionTitle
            main="HOW IT"
            green="WORKS"
            subtitle="Follow these 4 simple steps from registration to live auction bidding."
            center
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ num, title, desc, icon: Icon, link, btn }) => (
              <div
                key={num}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="size-9 rounded-xl bg-red-50 text-[#c53030] border border-red-200 font-black text-sm grid place-items-center">
                      {num}
                    </span>
                    <i className="text-slate-300 text-lg group-hover:text-[#c53030] transition-colors">
                      <Icon />
                    </i>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">
                    {title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600 mb-4">
                    {desc}
                  </p>
                </div>
                <Link
                  href={link}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-700 hover:bg-[#c53030] hover:text-white hover:border-[#c53030] transition-colors"
                >
                  {btn} <FaArrowRight />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHY JOIN EPL? */}
      <section id="teams" className="py-14 sm:py-16 bg-[#f8fafc]">
        <div className={container}>
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <SectionTitle
                main="WHY JOIN"
                green="EPL 2027?"
                subtitle="The premier platform where talent meets opportunity, camaraderie, and spirited university competition."
              />
              <div className="grid gap-3.5 sm:grid-cols-2 mt-6">
                {reasons.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-[#d4a84f] transition-colors"
                  >
                    <div className="size-7 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center text-xs shrink-0 font-bold">
                      <FaCheck />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#05131f] to-[#0c2438] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-[#d4a84f]/10 blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-block rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-extrabold text-[#d4a84f] uppercase tracking-wider mb-4">
                  ESDM Faculty Tradition
                </span>
                <h3 className="text-2xl font-black text-white">
                  Play Fair. Play Hard. Play Together.
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                  Whether you are swinging for sixes as a batsman, taking crucial wickets, or leading your team as a manager from the auction table, EPL is where memories are created.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/player-registration"
                    className="rounded-xl bg-[#c53030] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 transition shadow-md"
                  >
                    Register as Player
                  </Link>
                  <Link
                    href="/auction"
                    className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition backdrop-blur-md"
                  >
                    Live Auction Arena
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TournamentInfo;
