import { FaArrowRight, FaCalendarDays, FaUser, FaUsers } from "react-icons/fa6";

const RegistrationCard = ({ team = false, title, children, href, deadline }) => (
  <a
    className={`group relative flex items-center justify-between gap-4 rounded-2xl border-2 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden w-full max-w-[370px] ${
      team
        ? "border-[#f2c46a] bg-gradient-to-br from-[#26201e] via-[#1c1716] to-[#120f0e] hover:border-[#ffe194]"
        : "border-[#aeac78] bg-gradient-to-br from-[#241f1d] via-[#1b1615] to-[#120f0e] hover:border-[#d6d4a0]"
    }`}
    href={href ?? `mailto:epl.esdm@university.edu?subject=${team ? "Team" : "Player"}%20Registration`}
  >
    <div
      className={`absolute -right-8 -top-8 size-24 rounded-full blur-2xl opacity-40 pointer-events-none transition-opacity group-hover:opacity-75 ${
        team ? "bg-[#f2c46a]" : "bg-[#aeac78]"
      }`}
    />

    <div className="flex items-center gap-4 relative z-10">
      <i
        className={`grid size-13 shrink-0 place-items-center rounded-2xl text-2xl shadow-lg transition-transform duration-300 group-hover:scale-105 ${
          team
            ? "bg-gradient-to-br from-[#f2c46a] to-[#c89632] text-[#141110] border border-[#f2c46a]"
            : "bg-gradient-to-br from-[#aeac78] to-[#646636] text-white border border-[#aeac78]"
        }`}
      >
        {team ? <FaUsers /> : <FaUser />}
      </i>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <b className="block text-base font-black tracking-wide text-white group-hover:text-[#f2c46a] transition-colors leading-tight">
            {title}
          </b>
          {deadline && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f2c46a] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#141110] shadow-sm">
              <FaCalendarDays className="text-[10px]" />
              {deadline}
            </span>
          )}
        </div>
        <span className="mt-1.5 block text-xs font-medium leading-relaxed text-[#fcf0da]">
          {children}
        </span>
      </div>
    </div>

    <strong
      className={`grid size-10 shrink-0 place-items-center rounded-xl text-base transition-all duration-300 group-hover:translate-x-1 shadow-lg relative z-10 ${
        team
          ? "bg-[#f2c46a] text-[#141110] group-hover:bg-white"
          : "bg-[#aeac78] text-[#141110] group-hover:bg-white"
      }`}
    >
      <FaArrowRight />
    </strong>
  </a>
);

export default RegistrationCard;
