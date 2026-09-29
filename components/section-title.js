import Image from "next/image";

const SectionTitle = ({ main, green, subtitle, center = false }) => (
  <div className={`mb-8 ${center ? "text-center flex flex-col items-center" : ""}`}>
    <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/80 px-3 py-1 mb-2 shadow-xs">
      <Image src="/epl-logo.png" alt="EPL" width={20} height={20} className="size-4 object-contain" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#c53030]">EPL • ESDM Premier League</span>
    </div>
    <h2 className="font-sans font-extrabold text-2xl tracking-tight text-[#0f172a] sm:text-3xl md:text-4xl">
      {main} <span className="text-[#c53030]">{green}</span>
    </h2>
    {subtitle && <p className="mt-2 text-sm text-[#64748b] max-w-2xl">{subtitle}</p>}
    <div className={`mt-3 flex items-center gap-1.5 ${center ? "justify-center" : ""}`}>
      <span className="h-1 w-10 rounded-full bg-[#c53030]" />
      <span className="size-1.5 rounded-full bg-[#d4a84f]" />
      <span className="h-0.5 w-4 rounded-full bg-slate-200" />
    </div>
  </div>
);

export default SectionTitle;

