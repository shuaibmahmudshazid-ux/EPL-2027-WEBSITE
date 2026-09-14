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
const Heading = ({ children }) => (
  <h3 className="mb-3 font-sans font-bold text-base tracking-[.7px] text-[#d4a84f]">
    {children}
  </h3>
);
const SiteFooter = () => (
  <footer
    id="contact"
    className="bg-black text-[#d6dfe5]"
  >
    <div
      className={`${container} grid gap-8 py-11 min-[781px]:grid-cols-2 min-[1100px]:grid-cols-[1.4fr_.8fr_1fr_1.35fr]`}
    >
      <div className="border-b border-white/10 pb-4 min-[781px]:border-0">
        <Heading>EPL - ESDM PREMIER LEAGUE</Heading>
        <p className="m-0 max-w-[300px] text-[11px] leading-[1.7]">
          An initiative by the ESDM Faculty to bring together passion,
          performance and sportsmanship. Let the best team win!
        </p>
        <div className="mt-3 text-lg">ⓕ　◎　𝕏　▶　ⓘ</div>
      </div>
      <div className="border-b border-white/10 pb-4 min-[781px]:border-0">
        <Heading>QUICK LINKS</Heading>
        {navItems.map((item) => (
          <a
            className="mb-1.5 block text-[11px] hover:text-[#d4a84f]"
            href={`#${item.toLowerCase()}`}
            key={item}
          >
            › &nbsp;{item}
          </a>
        ))}
      </div>
      <div className="border-b border-white/10 pb-4 min-[781px]:border-0">
        <Heading>CONTACT US</Heading>
        <p className="mb-2 text-[11px] leading-[1.7]">
          ✉ &nbsp;shuaibmahmudshazid@gmail.com
        </p>
        <p className="mb-2 text-[11px] leading-[1.7]">
          ⌕ &nbsp;01303526267
        </p>
        <p className="text-[11px] leading-[1.7]">
          ⌖ &nbsp;FACULTY OF ENVIRONMENTAL SCIENCE AND DISASTER MANAGEMENT,
          <br />　PSTU 
        </p>
      </div>

    </div>
    <div className="border-t border-white/15 bg-black py-[11px] text-[11px] text-[#d6dfe5]">
      <div
        className={`${container} flex flex-col items-center gap-1.5 text-center min-[781px]:flex-row min-[781px]:justify-between`}
      >
        <span>© 2027 EPL - ESDM Premier League. All Rights Reserved.</span>
        <span>Play Fair. Play Hard. Play Together.</span>
      </div>
    </div>
  </footer>
);
export default SiteFooter;
