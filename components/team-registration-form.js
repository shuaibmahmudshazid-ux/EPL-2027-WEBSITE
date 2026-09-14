"use client";

import { FaCircleCheck, FaKey, FaPlus, FaRotateRight, FaSpinner, FaTrash, FaUpload, FaUserGroup } from "react-icons/fa6";
import { useEffect, useState } from "react";

const emptyManager = () => ({ name: "", phone: "", email: "" });
const inputClass = "h-10 w-full rounded-sm border border-white/20 bg-[#07111d]/75 px-3 text-sm text-white outline-none placeholder:text-[#9da8b0] focus:border-[#d9b56d] focus:ring-2 focus:ring-[#d9b56d]/20";

const TeamRegistrationForm = () => {
  const [managers, setManagers] = useState([emptyManager(), emptyManager()]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [registeredTeam, setRegisteredTeam] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => () => { if (logoPreview) URL.revokeObjectURL(logoPreview); }, [logoPreview]);

  const updateManager = (index, field, value) => setManagers((current) => current.map((manager, managerIndex) => managerIndex === index ? { ...manager, [field]: value } : manager));
  const addManager = () => setManagers((current) => [...current, emptyManager()]);
  const removeManager = (index) => setManagers((current) => current.length > 1 ? current.filter((_, managerIndex) => managerIndex !== index) : current);

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0] || null;
    setLogoFile(file);
    setLogoPreview((previous) => { if (previous) URL.revokeObjectURL(previous); return file ? URL.createObjectURL(file) : null; });
  };

  const resetForm = (form) => {
    form?.reset();
    setManagers([emptyManager(), emptyManager()]);
    setStatus("idle");
    setMessage("");
    setRegisteredTeam(null);
    setLogoFile(null);
    setLogoPreview((previous) => { if (previous) URL.revokeObjectURL(previous); return null; });
  };

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const teamName = form.teamName.value.trim();
    const uniqueKey = form.uniqueKey.value.trim();
    if (!teamName) return setMessage("Enter your team name.");
    if (!uniqueKey) return setMessage("Enter the unique key provided by the admin.");
    if (!logoFile) return setMessage("Upload your team logo.");
    if (managers.some((manager) => !manager.name.trim() || !manager.phone.trim() || !manager.email.trim())) return setMessage("Complete all manager fields.");
    if (managers.some((manager) => !/^\d{11}$/.test(manager.phone.replace(/\D/g, "")))) return setMessage("Each manager's mobile number must contain exactly 11 digits.");
    setStatus("loading"); setMessage("");
    try {
      const data = new FormData();
      data.append("name", teamName);
      data.append("uniqueKey", uniqueKey);
      data.append("managers", JSON.stringify(managers.map((manager) => ({ name: manager.name.trim(), phone: manager.phone.replace(/\D/g, ""), email: manager.email.trim().toLowerCase() }))));
      if (logoFile) data.append("logo", logoFile);
      const response = await fetch("/api/teams", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setRegisteredTeam(result.team);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Team registration could not be submitted.");
    }
  };

  if (status === "success") {
    return <div className="rounded-2xl border border-[#d4a84f]/70 bg-[#021827e8] p-5 text-center shadow-2xl backdrop-blur-md min-[680px]:p-8">
      <i className="mx-auto grid size-16 place-items-center rounded-full bg-[#c7963b] text-3xl not-italic"><FaCircleCheck /></i>
      <h1 className="mt-5 font-sans font-bold text-[32px] leading-none tracking-wide min-[680px]:text-[44px]">TEAM <span className="text-[#d4a84f]">REGISTERED</span></h1>
      <p className="mt-3 text-sm min-[680px]:text-base">
        <b className="text-[#d4a84f]">{registeredTeam?.name}</b> has been successfully registered for the <b className="text-[#d4a84f]">EPL - ESDM Premier League</b>.
      </p>
      <p className="mt-2 text-xs text-[#c5ccd1]">Our team will review your registration and notify you of the result.</p>
      <button className="mx-auto mt-6 flex cursor-pointer items-center gap-2 rounded-lg border border-white/50 px-8 py-4 text-sm font-bold hover:border-[#d4a84f]" type="button" onClick={() => resetForm()}><FaRotateRight />REGISTER ANOTHER TEAM</button>
    </div>;
  }

  return <form className="border border-white/15 bg-[#102235]/95 p-5 shadow-[0_28px_70px_rgba(0,0,0,.38)] backdrop-blur-md min-[680px]:p-8" onSubmit={submit}>
    <div className="mb-7 flex items-center gap-4 border-b border-white/10 pb-6"><i className="grid size-16 shrink-0 place-items-center rounded-sm bg-[#af8239] text-3xl text-[#07111d] not-italic"><FaUserGroup /></i><div><h1 className="font-sans font-bold text-[38px] leading-none tracking-[.06em] min-[680px]:text-[52px]">TEAM <span className="text-[#d9b56d]">REGISTRATION</span></h1><p className="mt-2 text-sm text-white/75 min-[680px]:text-base">Register your team to join the <b className="text-[#d9b56d]">EPL - ESDM Premier League.</b></p></div></div>
    <div className="grid gap-5 min-[680px]:grid-cols-[140px_1fr]">
      <label className="block">
        <span className="mb-2 block text-sm font-bold">TEAM LOGO</span>
        <span className="relative flex size-[140px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#d4a84f] bg-[#031320]/75 text-center">
          {logoPreview
            ? <img className="absolute inset-0 size-full object-cover" src={logoPreview} alt="Team logo" />
            : <><FaUpload className="text-3xl text-[#d4a84f]" /><small className="mt-2 text-[10px] text-[#abb3b9]">JPG, PNG<br />(Max 2MB)</small></>}
          <input className="sr-only" type="file" name="logo" accept="image/png,image/jpeg" onChange={handleLogoChange} required />
        </span>
      </label>
      <div className="grid gap-5">
        <label><span className="mb-2 block text-sm font-bold">TEAM NAME</span><input className={inputClass} name="teamName" placeholder="Enter team name" required /></label>
        <label><span className="mb-2 flex items-center gap-2 text-sm font-bold">UNIQUE KEY <FaKey className="text-[#d4a84f]" /></span><input className={inputClass} name="uniqueKey" placeholder="Enter unique key" required /><small className="mt-2 block text-xs text-[#b8c1c7]">Contact the EPL committee to get your team key — they will provide it to you.</small></label>
      </div>
    </div>
    <div className="mt-6"><h2 className="font-sans font-bold text-lg"><span className="text-[#d4a84f]">●</span> MANAGERS</h2><p className="mb-3 text-xs text-[#c5cdd1]">Add at least one manager. You can add more if needed.</p><div className="space-y-2">{managers.map((manager,index)=><div className="grid gap-3 rounded-lg border border-white/25 bg-[#041b2b]/75 p-3 min-[760px]:grid-cols-[34px_1fr_1fr_1fr_28px] min-[760px]:items-end" key={index}><span className="grid size-7 place-items-center rounded-full bg-[#be8f37] text-sm font-bold">{index + 1}</span><label><span className="mb-1 block text-xs font-bold">MANAGER NAME</span><input className={inputClass} value={manager.name} onChange={(event) => updateManager(index, "name", event.target.value)} placeholder="Enter manager name" required /></label><label><span className="mb-1 block text-xs font-bold">MOBILE NUMBER</span><input className={inputClass} type="tel" inputMode="numeric" value={manager.phone} onChange={(event) => updateManager(index, "phone", event.target.value)} placeholder="11 digit mobile number" required /></label><label><span className="mb-1 block text-xs font-bold">EMAIL ADDRESS</span><input className={inputClass} type="email" value={manager.email} onChange={(event) => updateManager(index, "email", event.target.value)} placeholder="Enter email address" required /></label><button className="mb-2 cursor-pointer text-[#ff5b52] hover:text-red-300" type="button" aria-label={`Remove manager ${index + 1}`} onClick={() => removeManager(index)}><FaTrash /></button></div>)}</div></div>
    <div className="mt-4 flex flex-wrap items-center gap-4"><button className="cursor-pointer rounded-md border border-dashed border-[#d4a84f] px-4 py-2 text-sm font-bold text-[#d9ad55]" type="button" onClick={addManager}><FaPlus className="mr-2 inline" />ADD MANAGER</button><span className="text-xs text-[#c4ccd1]">ⓘ All manager contact details will be used for official team communication.</span></div>
    <div className="mt-5 flex flex-wrap gap-4"><button className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#d0a048,#a97828)] px-8 py-4 text-sm font-bold hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={status === "loading"}>{status === "loading" ? <FaSpinner className="animate-spin" /> : <FaUserGroup />}{status === "loading" ? "REGISTERING..." : "REGISTER TEAM"}</button><button className="cursor-pointer rounded-lg border border-white/50 px-8 py-4 text-sm font-bold hover:border-[#d4a84f]" type="reset" onClick={(event) => resetForm(event.currentTarget.form)}><FaRotateRight className="mr-2 inline" />RESET</button></div>
    {message && <p className="mt-4 flex items-center gap-2 text-sm text-red-300"><FaCircleCheck />{message}</p>}
  </form>;
};
export default TeamRegistrationForm;
