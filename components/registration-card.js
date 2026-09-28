import { FaArrowRight, FaUser, FaUsers } from "react-icons/fa6";

const RegistrationCard = ({ team = false, title, children, href }) => (
  <a
    className={`group grid min-h-[112px] w-full max-w-[322px] grid-cols-[58px_1fr_32px] items-center rounded-sm border border-white/20 p-3 shadow-[0_20px_42px_rgba(0,0,0,.2)] transition duration-300 hover:-translate-y-1 hover:border-[#d9b56d]/80 hover:shadow-[0_24px_52px_rgba(0,0,0,.32)] min-[781px]:grid-cols-[66px_1fr_34px] min-[781px]:p-4 ${team ? "bg-[linear-gradient(135deg,rgba(22,54,80,.96),rgba(7,22,38,.94))]" : "bg-[linear-gradient(135deg,rgba(20,66,54,.96),rgba(7,29,32,.94))]"}`}
    href={href ?? `mailto:epl.esdm@university.edu?subject=${team ? "Team" : "Player"}%20Registration`}
  >
    <i
      className={`grid size-12 place-items-center rounded-sm text-2xl not-italic min-[781px]:size-[54px] ${team ? "bg-[#315f84] text-base" : "bg-[#b98b42]"}`}
    >
      {team ? <FaUsers /> : <FaUser />}
    </i>
    <span>
      <b className="text-[16px] leading-[1.1] tracking-[.08em]">{title}</b>
      <small className="mt-[8px] block text-[10px] leading-[1.5] text-white/70">
        {children}
      </small>
    </span>
    <strong className="grid size-8 place-items-center rounded-sm bg-white/95 text-[18px] text-[#102235] transition group-hover:bg-[#d9b56d]">
      <FaArrowRight />
    </strong>
  </a>
);
export default RegistrationCard;
