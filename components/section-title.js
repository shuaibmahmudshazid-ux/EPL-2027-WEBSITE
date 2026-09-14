const SectionTitle = ({ main, green }) => (
  <>
    <h3 className="font-sans font-bold text-[20px] tracking-[.12em] text-[#172638]">
      {main} <span className="text-[#d4a84f]">{green}</span>
    </h3>
    <div className="my-3 mb-5 flex items-center gap-2"><i className="h-px w-10 bg-[#d9b56d]" /><i className="size-1.5 bg-[#d9b56d]" /></div>
  </>
);
export default SectionTitle;
