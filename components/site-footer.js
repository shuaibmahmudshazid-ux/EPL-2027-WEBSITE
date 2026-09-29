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
} from "react-icons/fa6";

const container =
  "mx-auto w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]";

const navItems = [
  "Home",
  "About",
  "Schedule",
  "Teams",
  "Registration",
  "Contact",
];

const SiteFooter = () => (
  <footer id="contact" className="bg-[#030d17] text-slate-300 border-t border-white/10">
    <div
      className={`${container} grid gap-10 py-14 sm:py-16 min-[781px]:grid-cols-2 min-[1100px]:grid-cols-[1.5fr_0.9fr_1.2fr_1.2fr]`}
    >
      {/* Col 1: Brand & Slogan */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative size-12">
            <Image
              src="/epl-logo.png"
              alt="EPL Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h3 className="font-sans font-black text-xl text-white tracking-tight leading-none">
              EPL <span className="text-[#d4a84f]">2027</span>
            </h3>
            <p className="text-[10px] font-bold tracking-widest text-[#d4a84f] uppercase mt-0.5">
              ESDM PREMIER LEAGUE
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-slate-400 max-w-sm mb-5">
          An initiative by the ESDM Faculty to bring together passion, performance and sportsmanship. Let the best team win!
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-2.5">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="size-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-xs text-slate-300 hover:bg-[#c53030] hover:text-white hover:border-transparent transition-all"
            aria-label="Facebook"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="size-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-xs text-slate-300 hover:bg-[#c53030] hover:text-white hover:border-transparent transition-all"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="size-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-xs text-slate-300 hover:bg-[#c53030] hover:text-white hover:border-transparent transition-all"
            aria-label="X Twitter"
          >
            <FaXTwitter />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="size-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-xs text-slate-300 hover:bg-[#c53030] hover:text-white hover:border-transparent transition-all"
            aria-label="YouTube"
          >
            <FaYoutube />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="size-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-xs text-slate-300 hover:bg-[#c53030] hover:text-white hover:border-transparent transition-all"
            aria-label="LinkedIn"
          >
            <FaLinkedinIn />
          </a>
        </div>
      </div>

      {/* Col 2: Quick Links */}
      <div>
        <h4 className="mb-4 font-sans font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[#c53030]" />
          Quick Links
        </h4>
        <ul className="space-y-2.5 text-xs">
          {navItems.map((item) => (
            <li key={item}>
              <a
                className="flex items-center gap-2 text-slate-400 hover:text-[#d4a84f] transition-colors"
                href={`#${item.toLowerCase()}`}
              >
                <FaChevronRight className="text-[10px] text-slate-600" />
                <span>{item}</span>
              </a>
            </li>
          ))}
          <li>
            <Link
              className="flex items-center gap-2 text-[#d4a84f] hover:text-white transition-colors font-bold"
              href="/auction"
            >
              <FaGavel className="text-[10px]" />
              <span>Live Auction Arena</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Col 3: Contact Us */}
      <div>
        <h4 className="mb-4 font-sans font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[#c53030]" />
          Contact Us
        </h4>
        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="flex items-start gap-3">
            <i className="size-7 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-xs text-[#d4a84f] shrink-0 mt-0.5 not-italic">
              <FaEnvelope />
            </i>
            <a
              href="mailto:shuaibmahmudshazid@gmail.com"
              className="hover:text-[#d4a84f] transition-colors break-all"
            >
              shuaibmahmudshazid@gmail.com
            </a>
          </div>

          <div className="flex items-center gap-3">
            <i className="size-7 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-xs text-[#d4a84f] shrink-0 not-italic">
              <FaPhone />
            </i>
            <a href="tel:01303526267" className="hover:text-[#d4a84f] transition-colors">
              01303526267
            </a>
          </div>

          <div className="flex items-start gap-3">
            <i className="size-7 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-xs text-[#d4a84f] shrink-0 mt-0.5 not-italic">
              <FaLocationDot />
            </i>
            <span className="leading-relaxed text-slate-400">
              Faculty of Environmental Science and Disaster Management, PSTU
            </span>
          </div>
        </div>
      </div>

      {/* Col 4: Portals & Organizing Authority */}
      <div>
        <h4 className="mb-4 font-sans font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[#c53030]" />
          Official Portals
        </h4>
        <div className="space-y-3">
          <Link
            href="/auction"
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white hover:border-red-500/50 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-red-500 animate-ping" />
              <b className="font-bold">Live Auction Arena</b>
            </div>
            <FaChevronRight className="text-[10px] text-slate-400" />
          </Link>

          <Link
            href="/secure-admin"
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white hover:border-amber-500/50 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <FaLock className="text-[#d4a84f]" />
              <b className="font-bold text-[#d4a84f]">Admin Management</b>
            </div>
            <FaChevronRight className="text-[10px] text-slate-400" />
          </Link>

          <div className="pt-2">
            <p className="text-[11px] text-slate-400">
              Organized with pride by <b className="text-white">Addyanta-14</b>
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Legal / Copyright Bar */}
    <div className="border-t border-white/10 bg-[#020810] py-4 text-xs text-slate-400">
      <div
        className={`${container} flex flex-col items-center gap-2 text-center min-[781px]:flex-row min-[781px]:justify-between`}
      >
        <span>© EPL 2027 ESDM Premier League</span>
        <span className="text-[#d4a84f] font-semibold">
          Play Fair. Play Hard. Play Together.
        </span>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
