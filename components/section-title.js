import Image from "next/image";

const SectionTitle = ({ main, green, subtitle, center = false, dark = false }) => (
  <div className={`mb-8 ${center ? "text-center flex flex-col items-center" : ""}`}>
    <div className={`inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1 mb-2.5 shadow-sm ${
      dark 
        ? "border-[#f2c46a] bg-[#141110] text-[#fffcf5]" 
        : "border-[#444721]/40 bg-white text-[#181413]"
    }`}>
      <Image src="/epl-logo.png" alt="EPL" width={20} height={20} className="size-4 object-contain" />
      <span className={`text-[11px] font-black uppercase tracking-wider ${dark ? "text-[#f2c46a]" : "text-[#444721]"}`}>
        EPL • ESDM Premier League
      </span>
    </div>
    <h2 className={`font-sans font-black text-2xl tracking-tight sm:text-3xl md:text-4xl ${
      dark ? "text-white" : "text-[#141110]"
    }`}>
      {main} <span className={dark ? "text-[#f2c46a]" : "text-[#444721]"}>{green}</span>
    </h2>
    {subtitle && (
      <p className={`mt-2 text-sm sm:text-base font-semibold max-w-2xl leading-relaxed ${
        dark ? "text-[#fcf0da]" : "text-[#38312e]"
      }`}>
        {subtitle}
      </p>
    )}
    <div className={`mt-3.5 flex items-center gap-2 ${center ? "justify-center" : ""}`}>
      <span className={`h-1.5 w-12 rounded-full ${dark ? "bg-[#f2c46a]" : "bg-[#444721]"}`} />
      <span className="size-2 rounded-full bg-[#f2c46a] shadow-[0_0_6px_#f2c46a]" />
      <span className={`h-1 w-5 rounded-full ${dark ? "bg-white/40" : "bg-[#141110]/30"}`} />
    </div>
  </div>
);

export default SectionTitle;
