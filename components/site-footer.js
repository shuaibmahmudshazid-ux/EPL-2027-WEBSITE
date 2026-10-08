import Image from "next/image";
import Link from "next/link";
import {
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaLinkedinIn,
  FaChevronRight,
  FaGavel,
  FaLock,
  FaCalendarDays,
  FaShieldHalved,
} from "react-icons/fa6";

const container =
  "mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Upcoming Fixtures", href: "/#fixtures" },
  { name: "Tournament Gallery", href: "/#gallery" },
  { name: "Full Match Schedule", href: "/schedule" },
  { name: "Live Auction Arena", href: "/auction" },
  { name: "Player Registration", href: "/player-registration" },
  { name: "Team Registration", href: "/team-registration" },
  { name: "Admin Portal", href: "/secure-admin" },
];

export default function SiteFooter() {
  return (
    <footer id="contact" className="relative bg-[#070A12] text-white border-t border-white/10 overflow-hidden">
      {/* Background ambient mesh */}
      <div className="absolute top-0 left-1/4 size-96 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

      {/* Main Grid */}
      <div className={`${container} relative z-10 grid gap-8 sm:gap-10 py-12 sm:py-20 min-[781px]:grid-cols-2 min-[1100px]:grid-cols-[1.5fr_1fr_1.2fr_1.3fr]`}>
        
        {/* Col 1: Brand & Department Info */}
        <div>
          <div className="flex items-center gap-3.5 mb-5">
            <div className="relative size-14">
              <Image
                src="/epl-logo.png"
                alt="EPL Logo"
                fill
                className="object-contain filter drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)]"
              />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-sans font-black text-2xl text-white tracking-tight leading-none uppercase">
                  ESDM
                </span>
                <span className="font-sans font-bold text-lg text-amber-400">
                  2027
                </span>
              </div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1">
                PREMIER LEAGUE
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-normal leading-relaxed text-slate-400 max-w-sm mb-6">
            The flagship annual cricket championship organized at Patuakhali Science and Technology University. 
            Fostering sportsmanship, talent discovery, and faculty unity.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-2.5">
            {[
              { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
              { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
              { icon: FaXTwitter, href: "https://twitter.com", label: "Twitter" },
              { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
              { icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-xs text-slate-300 hover:text-[#0A0F1D] hover:bg-amber-400 hover:border-amber-400 transition-all shadow-md"
                aria-label={label}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <h4 className="mb-5 font-sans font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-amber-400" />
            Quick Navigation
          </h4>
          <ul className="space-y-2.5 text-xs">
            {navLinks.map((item) => (
              <li key={item.name}>
                <Link
                  className="flex items-center gap-2 font-semibold text-slate-300 hover:text-amber-400 transition-colors"
                  href={item.href}
                >
                  <FaChevronRight className="text-[9px] text-slate-600" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Department Contact Info */}
        <div>
          <h4 className="mb-5 font-sans font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-amber-400" />
            Department & Venue
          </h4>
          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <i className="size-7 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-xs text-amber-400 shrink-0 mt-0.5 not-italic">
                <FaLocationDot />
              </i>
              <div>
                <p className="font-bold text-white">
                  Faculty of Environmental Science and Disaster Management
                </p>
                <p className="text-slate-400 mt-0.5">
                  Patuakhali Science and Technology University (PSTU), Dumki, Patuakhali
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <i className="size-7 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-xs text-amber-400 shrink-0 not-italic">
                <FaPhone />
              </i>
              <a href="tel:01303526267" className="font-semibold text-slate-300 hover:text-amber-400 tabular-nums transition-colors">
                +880 1303 526267
              </a>
            </div>

            <div className="flex items-center gap-3">
              <i className="size-7 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-xs text-amber-400 shrink-0 not-italic">
                <FaEnvelope />
              </i>
              <a
                href="mailto:shuaibmahmudshazid@gmail.com"
                className="font-semibold text-slate-300 hover:text-amber-400 break-all transition-colors"
              >
                shuaibmahmudshazid@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Col 4: Organizer Branding & Portals */}
        <div>
          <h4 className="mb-5 font-sans font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-amber-400" />
            Organizing Body
          </h4>
          
          <div className="rounded-2xl border border-white/10 bg-[#111827]/60 p-4 backdrop-blur-xl">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Proudly Organized By
            </p>
            <div className="flex items-center gap-3">
              <Image
                src="/addyanta-14-logo.png"
                alt="Addyanta-14"
                width={120}
                height={50}
                className="h-10 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              />
              <div>
                <b className="block text-sm font-black text-white leading-tight">Addyanta-14</b>
                <span className="text-[11px] text-amber-400 font-bold">14th Batch • ESDM</span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 space-y-2">
            <Link
              href="/auction"
              className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              <div className="flex items-center gap-2">
                <FaGavel className="text-xs" />
                <span>Live Auction Arena</span>
              </div>
              <FaChevronRight className="text-[10px]" />
            </Link>

            <Link
              href="/secure-admin"
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-2">
                <FaLock className="text-xs text-slate-400" />
                <span>Admin Management</span>
              </div>
              <FaChevronRight className="text-[10px]" />
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Legal / Copyright Bar */}
      <div className="border-t border-white/10 bg-[#05070D] py-4 text-xs font-medium text-slate-400">
        <div className={`${container} flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between`}>
          <span>
            © 2027 ESDM Premier League (EPL). All rights reserved.
          </span>
          <span className="text-slate-300">
            Faculty of Environmental Science and Disaster Management, PSTU • Organized by <strong className="text-amber-400">Addyanta-14</strong>
          </span>
        </div>
      </div>
    </footer>
  );
}
