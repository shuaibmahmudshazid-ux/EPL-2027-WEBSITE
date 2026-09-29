import { FaArrowRight, FaUser, FaUsers } from "react-icons/fa6";

const RegistrationCard = ({ team = false, title, children, href }) => (
  <a
    className={`group relative flex items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden w-full max-w-[360px] ${
      team
        ? "border-amber-400/30 bg-gradient-to-br from-[#0e273c]/95 via-[#081b2b]/95 to-[#040f1a]/95 hover:border-amber-400/70"
        : "border-red-500/30 bg-gradient-to-br from-[#241014]/95 via-[#18090d]/95 to-[#090406]/95 hover:border-red-500/70"
    }`}
    href={href ?? `mailto:epl.esdm@university.edu?subject=${team ? "Team" : "Player"}%20Registration`}
  >
    <div
      className={`absolute -right-8 -top-8 size-24 rounded-full blur-2xl opacity-25 pointer-events-none ${
        team ? "bg-amber-400" : "bg-red-500"
      }`}
    />

    <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
      <i
        className={`grid size-12 sm:size-13 shrink-0 place-items-center rounded-xl text-xl sm:text-2xl shadow-md transition-transform duration-300 group-hover:scale-105 ${
          team
            ? "bg-gradient-to-br from-[#d4a84f] to-[#a37424] text-[#06121c]"
            : "bg-gradient-to-br from-[#dc2626] to-[#991b1b] text-white"
        }`}
      >
        {team ? <FaUsers /> : <FaUser />}
      </i>
      <div>
        <b className="block text-[15px] sm:text-base font-extrabold tracking-wide text-white group-hover:text-[#d4a84f] transition-colors leading-tight">
          {title}
        </b>
        <span className="mt-1 block text-[11px] sm:text-xs leading-snug text-slate-300">
          {children}
        </span>
      </div>
    </div>

    <strong
      className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm transition-all duration-300 group-hover:translate-x-1 shadow-md relative z-10 ${
        team
          ? "bg-amber-400/20 border border-amber-400/40 text-amber-300 group-hover:bg-amber-400 group-hover:text-black"
          : "bg-red-500/20 border border-red-500/40 text-red-300 group-hover:bg-red-600 group-hover:text-white"
      }`}
    >
      <FaArrowRight />
    </strong>
  </a>
);

export default RegistrationCard;
