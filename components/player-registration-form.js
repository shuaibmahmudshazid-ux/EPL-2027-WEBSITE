"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCircleCheck, FaEnvelope, FaImage, FaPhone, FaSpinner, FaUpload, FaUser } from "react-icons/fa6";

const sessions = ["2020-2021", "2021-2022", "2022-2023", "2023-2024", "2024-2025", "2025-2026", "Alumni"];
const categories = ["Bowler", "Wicket Keeper (Batsman)", "Batsman", "Batting All-Rounder", "Bowling All-Rounder"];
const fieldClass = "h-[53px] w-full rounded-sm border border-white/20 bg-[#07111d]/75 px-4 text-sm text-white outline-none placeholder:text-[#a2aab1] focus:border-[#d9b56d] focus:ring-2 focus:ring-[#d9b56d]/20";
const Input = ({ label, name, type = "text", required = true, ...props }) => <label className="block"><span className="mb-2 block text-sm font-bold">{label}{!required && <em className="ml-1 text-xs font-normal text-[#aeb8be]">(Optional)</em>}</span><input className={fieldClass} name={name} type={type} required={required} {...props} /></label>;

const idStatusText = { checking: "Checking availability...", available: "Student ID is available.", taken: "This Student ID is already registered.", invalid: "Student ID must be exactly 7 digits." };
const idStatusClass = { checking: "text-[#c5ccd1]", available: "text-[#e4bf72]", taken: "text-red-300", invalid: "text-red-300" };

const PlayerRegistrationForm = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [idStatus, setIdStatus] = useState(null);
  const idCheckTimer = useRef(null);

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);
  useEffect(() => () => clearTimeout(idCheckTimer.current), []);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    setPhotoPreview((previous) => { if (previous) URL.revokeObjectURL(previous); return file ? URL.createObjectURL(file) : null; });
  };

  const handlePlayerIdChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 7);
    event.target.value = value;
    clearTimeout(idCheckTimer.current);
    if (value.length !== 7) return setIdStatus(value ? "invalid" : null);
    setIdStatus("checking");
    idCheckTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/players/check-id?playerId=${value}`);
        const result = await response.json();
        setIdStatus(response.ok && result.available ? "available" : "taken");
      } catch { setIdStatus(null); }
    }, 400);
  };

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const phone = data.get("phone").replace(/\D/g, "");
    const playerId = data.get("playerId").replace(/\D/g, "");
    const registrationNumber = data.get("registrationNumber").replace(/\D/g, "");
    const categoriesSelected = data.getAll("categories[]");
    const photo = data.get("photo");
    if (phone.length !== 11) return setMessage("Phone number must contain exactly 11 digits.");
    if (playerId.length !== 7) return setMessage("Student ID must be exactly 7 digits.");
    if (registrationNumber.length !== 5) return setMessage("Registration number must be exactly 5 digits.");
    if (idStatus === "taken") return setMessage("This Student ID is already registered.");
    if (!categoriesSelected.length) return setMessage("Select a category.");
    setStatus("loading"); setMessage("");
    try {
      const response = await fetch("/api/players", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.push(`/registration-success?playerId=${result.player.playerId}&name=${encodeURIComponent(result.player.fullName)}`);
    } catch (error) { setStatus("error"); setMessage(error.message || "Registration could not be submitted."); }
  };

  return <form className="border border-white/15 bg-[#102235]/95 p-5 shadow-[0_28px_70px_rgba(0,0,0,.38)] backdrop-blur-md min-[680px]:p-8" onSubmit={submit}>
    <div className="mb-7 flex items-center gap-4 border-b border-white/10 pb-6"><i className="grid size-16 shrink-0 place-items-center rounded-sm bg-[#af8239] text-3xl text-[#07111d] not-italic"><FaUser /></i><div><h1 className="font-sans font-bold text-[38px] leading-none tracking-[.06em] min-[680px]:text-[52px]">PLAYER <span className="text-[#d9b56d]">REGISTRATION</span></h1><p className="mt-2 text-sm text-white/75 min-[680px]:text-base">Register yourself to join the <b className="text-[#d9b56d]">EPL - ESDM Premier League.</b></p></div></div>
    <div className="grid gap-5 min-[680px]:grid-cols-[213px_1fr] min-[680px]:gap-8">
      <label className="block">
        <span className="mb-2 block text-sm font-bold">PLAYER PHOTO</span>
        <span className="relative flex h-[272px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#d4a84f] bg-[#031320]/75 text-center">
          {photoPreview
            ? <img className="absolute inset-0 size-full object-cover" src={photoPreview} alt="Selected player" />
            : <><FaUpload className="text-5xl text-[#d4a84f]" /><strong className="mt-4">Upload Photo</strong><small className="mt-2 px-3 text-xs text-[#abb3b9]">JPG or PNG</small><small className="mt-1 px-3 text-xs text-[#d4a84f]">This photo will be shown during the auction</small></>}
          <input className="sr-only" type="file" name="photo" accept="image/png,image/jpeg" onChange={handlePhotoChange} required />
        </span>
      </label>
      <div className="grid gap-5 min-[680px]:grid-cols-2">
        <Input label="FULL NAME" name="fullName" placeholder="Enter full name" />
        <Input label="PHONE NUMBER" name="phone" type="tel" inputMode="numeric" pattern="[0-9]{11}" placeholder="11 digit phone number" />
        <label className="block">
          <span className="mb-2 block text-sm font-bold">STUDENT ID</span>
          <input className={fieldClass} name="playerId" type="text" inputMode="numeric" pattern="[0-9]{7}" maxLength={7} placeholder="7 digit student ID" onChange={handlePlayerIdChange} required />
          {idStatus && <small className={`mt-1.5 block text-xs ${idStatusClass[idStatus]}`}>{idStatusText[idStatus]}</small>}
        </label>
        <Input label="REGISTRATION NUMBER" name="registrationNumber" type="text" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} placeholder="5 digit registration number" />
        <label><span className="mb-2 block text-sm font-bold">SESSION</span><select className={fieldClass} name="session" required><option value="">Select session</option>{sessions.map(session => <option key={session}>{session}</option>)}</select></label>
        <Input label="EMAIL" name="email" type="email" required={false} placeholder="Enter email address" />
        <fieldset className="min-[680px]:col-span-2"><legend className="mb-2 text-sm font-bold">CATEGORY</legend><div className="grid grid-cols-2 gap-2 rounded-lg border border-[#d4a84f]/70 bg-[#031320]/80 p-3">{categories.map(category => <label className="flex cursor-pointer items-center gap-2 text-xs" key={category}><input className="size-4 accent-[#d4a84f]" type="radio" name="categories[]" value={category} required />{category}</label>)}</div></fieldset>
      </div>
    </div>
    <div className="mt-8 flex flex-wrap gap-4 border-t border-white/10 pt-6">
      <button className="flex cursor-pointer items-center justify-center gap-2 bg-[#d9b56d] px-8 py-4 text-sm font-bold tracking-[.08em] text-[#07111d] hover:bg-[#ecd096] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={status === "loading"}>{status === "loading" && <FaSpinner className="animate-spin" />}{status === "loading" ? "REGISTERING..." : "REGISTER PLAYER"}</button>
      <button className="cursor-pointer border border-white/30 px-8 py-4 text-sm font-bold tracking-[.08em] hover:border-[#d9b56d]" type="reset" onClick={() => { setMessage(""); setStatus("idle"); setIdStatus(null); setPhotoPreview((previous) => { if (previous) URL.revokeObjectURL(previous); return null; }); }}>RESET</button>
    </div>
    {message && <p className="mt-4 flex items-center gap-2 text-sm text-red-300"><FaCircleCheck />{message}</p>}
    <p className="mt-4 text-xs text-[#c5ccd1]"><FaImage className="mr-2 inline text-[#d4a84f]" />Your information is secure and will only be used for EPL - ESDM Premier League.</p>
  </form>;
};
export default PlayerRegistrationForm;
