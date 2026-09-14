import SectionTitle from "./section-title";
const container =
  "mx-auto w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]";
const highlights = [
  ["🏆", "Competitive Matches", "Exciting T10 matches between top teams."],
  ["♟", "Top Talent", "Showcase your skills and shine on the big stage."],
  ["◉", "Prizes & Rewards", "Attractive prizes for winners and runners-up."],
  ["▣", "Live Updates", "Live scores, match updates and much more."],
];
const TournamentInfo = () => (
  <section
    id="about"
    className="premium-surface bg-[linear-gradient(120deg,#fff,#f1f4f6)] py-12 min-[781px]:py-16"
  >
    <div
      className={`${container} grid gap-[30px] min-[1100px]:grid-cols-[1.6fr_1fr] min-[1100px]:gap-[52px]`}
    >
      <div>
        <SectionTitle main="TOURNAMENT" green="HIGHLIGHTS" />
        <div className="grid grid-cols-2 gap-y-7 min-[781px]:grid-cols-4 min-[781px]:gap-y-0">
          {highlights.map(([icon, name, text], index) => (
            <article
              className={`px-[17px] ${index === 0 || index === 2 ? "border-l-0 pl-0" : "border-l border-[#d6dadd]"}`}
              key={name}
            >
              <i className="grid size-[49px] place-items-center rounded-sm border border-[#d9b56d] bg-white/60 text-2xl not-italic shadow-sm">
                {icon}
              </i>
              <b className="my-[13px] mb-1.5 block text-[11px] uppercase tracking-[.08em]">{name}</b>
              <p className="m-0 text-[11px] leading-[1.5] text-[#647180]">
                {text}
              </p>
            </article>
          ))}
        </div>
      </div>
      <div id="teams">
        <SectionTitle main="WHY JOIN" green="EPL?" />
        <ul className="m-0 list-none p-0">
          {[
            "Build teamwork and leadership",
            "Network with peers and seniors",
            "Boost your campus experience",
            "Be part of the ESDM legacy",
          ].map((item) => (
            <li
              className="mb-4 flex items-center gap-3 text-[13px] text-[#526475]"
              key={item}
            >
              <i className="grid size-[18px] place-items-center rounded-full border border-[#a97828] text-[#a97828] not-italic">
                ✓
              </i>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
export default TournamentInfo;
