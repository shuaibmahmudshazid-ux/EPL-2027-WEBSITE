"use client";

import { useEffect, useState, useRef } from "react";
import {
  FaCircleCheck,
  FaKey,
  FaPlus,
  FaRotateRight,
  FaSpinner,
  FaTrash,
  FaUpload,
  FaUserGroup,
  FaUsers,
  FaXmark,
  FaShieldHalved,
} from "react-icons/fa6";

const emptyManager = () => ({ name: "", phone: "", email: "" });
const inputClass =
  "h-[50px] w-full rounded-xl border border-white/10 bg-[#0A0F1D]/80 px-4 text-sm text-white font-medium outline-none placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-all";

export default function TeamRegistrationForm() {
  const [managers, setManagers] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [registeredTeam, setRegisteredTeam] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const logoInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const updateManager = (index, field, value) =>
    setManagers((current) =>
      current.map((manager, managerIndex) =>
        managerIndex === index ? { ...manager, [field]: value } : manager
      )
    );

  const addManager = () => setManagers((current) => [...current, emptyManager()]);

  const removeManager = (index) =>
    setManagers((current) => current.filter((_, managerIndex) => managerIndex !== index));

  const handleLogoFile = (file) => {
    if (!file) return;
    setLogoFile(file);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0] || null;
    handleLogoFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleLogoFile(file);
      if (logoInputRef.current) {
        try {
          const dt = new DataTransfer();
          dt.items.add(file);
          logoInputRef.current.files = dt.files;
        } catch {}
      }
    }
  };

  const resetForm = (form) => {
    form?.reset();
    setManagers([]);
    setStatus("idle");
    setMessage("");
    setRegisteredTeam(null);
    setLogoFile(null);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const teamName = form.teamName.value.trim();
    const uniqueKey = form.uniqueKey.value.trim();

    if (!teamName) return setMessage("Enter your team name.");
    if (!uniqueKey) return setMessage("Enter the unique key provided by the committee.");
    if (!logoFile) return setMessage("Upload your team logo emblem.");

    const activeManagers = managers
      .map((manager) => ({
        name: manager.name.trim(),
        phone: manager.phone.replace(/\D/g, ""),
        email: manager.email.trim().toLowerCase(),
      }))
      .filter((manager) => manager.name || manager.phone || manager.email);

    for (const manager of activeManagers) {
      if (!manager.name || !manager.phone || !manager.email) {
        return setMessage("Complete all details (name, phone, email) for each manager added, or remove the incomplete entry.");
      }
      if (!/^\d{11}$/.test(manager.phone)) {
        return setMessage("Each manager's mobile number must contain exactly 11 digits.");
      }
    }

    setStatus("loading");
    setMessage("");

    try {
      const data = new FormData();
      data.append("name", teamName);
      data.append("uniqueKey", uniqueKey);
      data.append("managers", JSON.stringify(activeManagers));
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
    return (
      <div className="rounded-2xl sm:rounded-3xl border border-amber-500/40 bg-[#111827]/90 p-5 sm:p-8 md:p-12 text-center shadow-2xl backdrop-blur-2xl text-white">
        <i className="mx-auto grid size-16 sm:size-20 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-3xl sm:text-4xl text-[#0A0F1D] not-italic shadow-[0_0_25px_rgba(245,158,11,0.5)]">
          <FaCircleCheck />
        </i>
        <h1 className="mt-5 sm:mt-6 font-sans font-black text-2xl sm:text-4xl uppercase tracking-tight text-white">
          TEAM <span className="text-amber-400">REGISTERED!</span>
        </h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-slate-200 font-medium">
          <b className="text-amber-400">{registeredTeam?.name}</b> has been successfully registered
          for the <strong className="text-white">EPL - ESDM Premier League 2027</strong>.
        </p>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          The auction management committee will review the team roster and assign your purse budget.
        </p>
        <button
          className="mx-auto mt-6 sm:mt-8 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-7 sm:px-8 py-3 sm:py-3.5 text-xs font-black uppercase text-[#0A0F1D] shadow-lg hover:scale-105 transition-all w-full sm:w-auto"
          type="button"
          onClick={() => resetForm()}
        >
          <FaRotateRight /> REGISTER ANOTHER TEAM
        </button>
      </div>
    );
  }

  return (
    <form
      className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#111827]/85 p-4 sm:p-7 md:p-9 text-white shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
      onSubmit={submit}
    >
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pb-4 border-b border-white/10">
          {[
            { step: 1, title: "Team Authentication", desc: "Key & Identity" },
            { step: 2, title: "Official Emblem", desc: "Logo Upload" },
            { step: 3, title: "Management Roster", desc: "Manager Contacts" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="size-8 sm:size-9 rounded-full bg-amber-500 text-[#0A0F1D] flex items-center justify-center text-xs font-black shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                {item.step}
              </div>
              <div className="hidden sm:block">
                <span className="block text-xs font-bold text-white leading-tight">
                  {item.title}
                </span>
                <span className="block text-[10px] text-slate-400">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Header Banner */}
      <div className="mb-8 flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="size-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 grid place-items-center text-2xl text-amber-400 shrink-0 shadow-inner">
          <FaShieldHalved />
        </div>
        <div>
          <h1 className="font-sans font-black text-2xl sm:text-3xl uppercase tracking-tight text-white leading-none">
            Team <span className="text-amber-400">Registration</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Claim your team key and register your official franchise for the EPL 2027 draft.
          </p>
        </div>
      </div>

      {/* Team Details Grid */}
      <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
        
        {/* Logo Upload Box */}
        <div>
          <span className="mb-2 block text-xs font-black uppercase tracking-wider text-amber-400">
            Team Logo / Crest
          </span>
          <label
            htmlFor="team-logo-input"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex size-[180px] cursor-pointer select-none flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
              isDragging
                ? "border-amber-400 bg-amber-500/10 scale-105"
                : logoPreview
                ? "border-emerald-500/50 bg-[#0A0F1D]"
                : "border-white/20 bg-[#0A0F1D]/80 hover:border-amber-500/50 hover:bg-[#0A0F1D]"
            }`}
          >
            {logoPreview ? (
              <div className="relative size-full group">
                <img className="size-full object-cover" src={logoPreview} alt="Team logo" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLogoPreview(null);
                    setLogoFile(null);
                    if (logoInputRef.current) logoInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 size-6 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500 cursor-pointer z-10"
                  title="Remove emblem"
                >
                  <FaXmark className="text-xs" />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1.5 text-center text-[9px] font-semibold text-white pointer-events-none">
                  Click or drop to change
                </div>
              </div>
            ) : (
              <div className="p-3 text-center pointer-events-none">
                <FaUpload className="mx-auto text-3xl text-amber-400 mb-2" />
                <span className="block text-xs font-bold text-white">Upload Emblem</span>
                <span className="block text-[10px] text-slate-400 mt-1">Click to browse or drop</span>
                <span className="mt-1 block text-[9px] text-amber-400/80 font-bold">Max 2MB</span>
              </div>
            )}
            <input
              ref={logoInputRef}
              id="team-logo-input"
              className="sr-only"
              type="file"
              name="logo"
              accept="image/png,image/jpeg"
              onChange={handleLogoChange}
            />
          </label>
        </div>

        {/* Name and Key Fields */}
        <div className="grid gap-5">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-amber-400">
              TEAM NAME
            </span>
            <input
              className={inputClass}
              name="teamName"
              placeholder="e.g. ESDM Strikers, Coastal Titans"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
              UNIQUE VERIFICATION KEY <FaKey className="text-amber-400 text-xs" />
            </span>
            <input
              className={inputClass}
              name="uniqueKey"
              placeholder="Enter unique key provided by committee"
              required
            />
            <small className="mt-1.5 block text-[11px] text-slate-400">
              Contact the Addyanta-14 organizing committee to receive your verified team passkey.
            </small>
          </label>
        </div>

      </div>

      {/* Managers Section (Optional) */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-sans font-black text-lg text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-amber-400">●</span> Team Managers
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300 normal-case tracking-normal">
                Optional — Can be added later
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Managers can be provided now for auction credentials or added later via the tournament admin panel.
            </p>
          </div>

          <button
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-black uppercase text-amber-400 hover:bg-amber-500/20 transition-all self-start sm:self-auto"
            type="button"
            onClick={addManager}
          >
            <FaPlus className="text-xs" /> Add Manager
          </button>
        </div>

        {managers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center">
            <p className="text-xs text-slate-400 mb-2.5">
              No managers added yet. You can skip this step or add manager info anytime.
            </p>
            <button
              type="button"
              onClick={addManager}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              <FaPlus className="text-xs" /> + Add Manager (Optional)
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {managers.map((manager, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-2xl border border-white/10 bg-[#0A0F1D]/80 p-4 sm:grid-cols-[36px_1fr_1fr_1fr_32px] sm:items-end backdrop-blur-md"
              >
                <div className="size-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-400">
                  {index + 1}
                </div>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-black uppercase text-amber-400">
                    MANAGER NAME
                  </span>
                  <input
                    className={inputClass}
                    value={manager.name}
                    onChange={(e) => updateManager(index, "name", e.target.value)}
                    placeholder="Full name"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-black uppercase text-amber-400">
                    MOBILE NUMBER (11 DIGITS)
                  </span>
                  <input
                    className={inputClass}
                    type="tel"
                    inputMode="numeric"
                    value={manager.phone}
                    onChange={(e) => updateManager(index, "phone", e.target.value)}
                    placeholder="01XXXXXXXXX"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-black uppercase text-amber-400">
                    EMAIL ADDRESS
                  </span>
                  <input
                    className={inputClass}
                    type="email"
                    value={manager.email}
                    onChange={(e) => updateManager(index, "email", e.target.value)}
                    placeholder="manager@pstu.ac.bd"
                  />
                </label>

                <div className="flex items-center justify-center pb-2">
                  <button
                    className="cursor-pointer text-slate-500 hover:text-rose-400 transition-colors"
                    type="button"
                    aria-label={`Remove manager ${index + 1}`}
                    onClick={() => removeManager(index)}
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 border-t border-white/10 pt-6">
        <button
          className="w-full sm:w-auto flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 transition-all"
          type="submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? <FaSpinner className="animate-spin text-sm" /> : <FaUserGroup />}
          <span>{status === "loading" ? "REGISTERING TEAM..." : "CONFIRM TEAM REGISTRATION"}</span>
        </button>

        <button
          className="w-full sm:w-auto cursor-pointer rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-center"
          type="reset"
          onClick={(e) => resetForm(e.currentTarget.form)}
        >
          <FaRotateRight className="mr-1.5 inline text-xs" /> Reset
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-bold text-rose-300 flex items-center gap-2">
          <FaCircleCheck className="text-rose-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </form>
  );
}
