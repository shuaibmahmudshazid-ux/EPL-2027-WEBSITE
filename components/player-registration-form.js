"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaCalendarDays,
  FaCircleCheck,
  FaEnvelope,
  FaImage,
  FaPhone,
  FaSpinner,
  FaUpload,
  FaUser,
  FaXmark,
  FaIdCard,
  FaCheck,
} from "react-icons/fa6";

const sessions = [
  "2020-2021",
  "2021-2022",
  "2022-2023",
  "2023-2024",
  "2024-2025",
  "2025-2026",
  "Alumni",
];

const categories = [
  "Bowler",
  "Wicket Keeper (Batsman)",
  "Batsman",
  "Batting All-Rounder",
  "Bowling All-Rounder",
];

const fieldClass =
  "h-[52px] w-full rounded-xl border border-white/10 bg-[#0A0F1D]/80 px-4 text-sm text-white font-medium outline-none placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-all";

const Input = ({ label, name, type = "text", required = true, ...props }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-black uppercase tracking-wider text-amber-400">
      {label}
      {!required && (
        <em className="ml-1 text-[11px] font-normal text-slate-400 not-italic">(Optional)</em>
      )}
    </span>
    <input className={fieldClass} name={name} type={type} required={required} {...props} />
  </label>
);

const idStatusText = {
  checking: "Checking Student ID availability...",
  available: "Student ID is verified and available.",
  taken: "This Student ID is already registered in the draft.",
  invalid: "Student ID must be exactly 7 digits.",
};

const idStatusClass = {
  checking: "text-sky-400",
  available: "text-emerald-400 font-bold",
  taken: "text-rose-400 font-bold",
  invalid: "text-rose-400 font-bold",
};

export default function PlayerRegistrationForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [idStatus, setIdStatus] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const idCheckTimer = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  useEffect(() => {
    return () => clearTimeout(idCheckTimer.current);
  }, []);

  const handlePhotoFile = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Player registration image must be 2 MB or less.");
      setPhotoPreview(null);
      setPhotoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setMessage("");
    setPhotoFile(file);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    handlePhotoFile(file);
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
      handlePhotoFile(file);
      if (fileInputRef.current) {
        try {
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInputRef.current.files = dt.files;
        } catch {
          // Handled via photoFile state
        }
      }
    }
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
      } catch {
        setIdStatus(null);
      }
    }, 400);
  };

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const phone = data.get("phone")?.toString().replace(/\D/g, "") || "";
    const playerId = data.get("playerId")?.toString().replace(/\D/g, "") || "";

    if (phone.length !== 11) return setMessage("Phone number must be exactly 11 digits.");
    if (playerId.length !== 7) return setMessage("Student ID must be exactly 7 digits.");
    if (idStatus === "taken") return setMessage("This Student ID is already registered.");

    const formPhoto = data.get("photo");
    if ((!formPhoto || !(formPhoto instanceof File) || formPhoto.size === 0) && photoFile) {
      data.set("photo", photoFile);
    }

    if (!data.get("photo") || (data.get("photo") instanceof File && data.get("photo").size === 0)) {
      return setMessage("Please upload a player passport photo.");
    }

    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/players", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.push(
        `/registration-success?playerId=${result.player.playerId}&name=${encodeURIComponent(
          result.player.fullName
        )}`
      );
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Registration could not be submitted.");
    }
  };

  return (
    <form
      className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#111827]/85 p-4 sm:p-7 md:p-9 text-white shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
      onSubmit={submit}
    >
      {/* ======================================================== */}
      {/* 1. STEP-BY-STEP PROGRESS INDICATOR                       */}
      {/* ======================================================== */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pb-4 border-b border-white/10">
          {[
            { step: 1, title: "Identity Details", desc: "Roll, Session, Contact" },
            { step: 2, title: "Cricket Role", desc: "Category & Playing Skill" },
            { step: 3, title: "Photo & Review", desc: "Live Stage Passport" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div
                className={`size-8 sm:size-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                  currentStep >= item.step
                    ? "bg-amber-500 text-[#0A0F1D] shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                    : "bg-white/5 border border-white/10 text-slate-400"
                }`}
              >
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

      {/* Header Banner inside card */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 grid place-items-center text-2xl text-amber-400 shrink-0 shadow-inner">
            <FaUser />
          </div>
          <div>
            <h1 className="font-sans font-black text-2xl sm:text-3xl text-white tracking-tight uppercase leading-none">
              Player <span className="text-amber-400">Registration</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Join the official EPL 2027 draft pool and enter auction tiers.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Deadline: 27th Oct Midnight</span>
        </div>
      </div>

      {/* Main Grid: Photo Box (Left) + Form Fields (Right) */}
      <div className="grid gap-6 sm:grid-cols-[220px_1fr] sm:gap-8">
        
        {/* Photo Upload with Drag and Drop */}
        <div>
          <span className="mb-2 block text-xs font-black uppercase tracking-wider text-amber-400">
            Player Passport Photo
          </span>
          <label
            htmlFor="player-photo-input"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all select-none ${
              isDragging
                ? "border-amber-400 bg-amber-500/10 scale-[1.02]"
                : photoPreview
                ? "border-emerald-500/50 bg-[#0A0F1D]"
                : "border-white/20 bg-[#0A0F1D]/80 hover:border-amber-500/50 hover:bg-[#0A0F1D]"
            }`}
          >
            {photoPreview ? (
              <div className="relative size-full group">
                <img
                  className="size-full object-cover"
                  src={photoPreview}
                  alt="Selected player"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPhotoPreview(null);
                    setPhotoFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 size-7 rounded-full bg-rose-600/90 text-white flex items-center justify-center hover:bg-rose-500 transition-colors shadow-lg cursor-pointer z-10"
                  title="Remove photo"
                >
                  <FaXmark className="text-xs" />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-black/75 p-2 text-center text-[10px] font-semibold text-white pointer-events-none">
                  Click or drop to change photo
                </div>
              </div>
            ) : (
              <div className="p-4 text-center pointer-events-none">
                <FaUpload className="mx-auto text-4xl text-amber-400 mb-3" />
                <strong className="block text-sm font-bold text-white">
                  Drag & Drop Photo
                </strong>
                <span className="block mt-1 text-[11px] text-slate-400">
                  or click to open file manager
                </span>
                <span className="mt-3 inline-block rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                  JPG / PNG (Max 2 MB)
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="player-photo-input"
              className="sr-only"
              type="file"
              name="photo"
              accept="image/png,image/jpeg"
              onChange={handlePhotoChange}
            />
          </label>
          <p className="mt-2 text-[11px] text-slate-400 text-center">
            Displayed on the live projector screen during bidding.
          </p>
        </div>

        {/* Inputs Column */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="FULL NAME" name="fullName" placeholder="e.g. Shuaib Mahmud" />
          
          <Input
            label="MOBILE NUMBER (11 DIGITS)"
            name="phone"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{11}"
            placeholder="01XXXXXXXXX"
          />

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-amber-400">
              STUDENT ID (7 DIGITS)
            </span>
            <input
              className={fieldClass}
              name="playerId"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{7}"
              maxLength={7}
              placeholder="e.g. 2102001"
              onChange={handlePlayerIdChange}
              required
            />
            {idStatus && (
              <small className={`mt-1.5 block text-xs ${idStatusClass[idStatus]}`}>
                {idStatusText[idStatus]}
              </small>
            )}
          </label>

          <Input
            label="REGISTRATION NUMBER"
            name="registrationNumber"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            placeholder="5 digit reg number"
          />

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-amber-400">
              ACADEMIC SESSION
            </span>
            <select className={fieldClass} name="session" required>
              <option value="" className="bg-[#0A0F1D] text-slate-400">Select session</option>
              {sessions.map((session) => (
                <option key={session} value={session} className="bg-[#0A0F1D] text-white">
                  {session}
                </option>
              ))}
            </select>
          </label>

          <Input
            label="EMAIL ADDRESS"
            name="email"
            type="email"
            required={false}
            placeholder="student@pstu.ac.bd"
          />

          {/* Category Selector */}
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-xs font-black uppercase tracking-wider text-amber-400">
              PLAYING CATEGORY & ROLE
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 rounded-2xl border border-white/10 bg-[#0A0F1D]/80 p-3.5">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-2 text-xs font-bold text-slate-200 hover:border-amber-500/40 hover:text-amber-400 transition-colors"
                >
                  <input
                    className="size-4 accent-amber-500"
                    type="radio"
                    name="categories[]"
                    value={category}
                    required
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 border-t border-white/10 pt-6">
        <button
          className="w-full sm:w-auto flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 transition-all"
          type="submit"
          disabled={status === "loading"}
        >
          {status === "loading" && <FaSpinner className="animate-spin text-sm" />}
          <span>{status === "loading" ? "SUBMITTING DRAFT..." : "COMPLETE REGISTRATION"}</span>
        </button>

        <button
          className="w-full sm:w-auto cursor-pointer rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-center"
          type="reset"
          onClick={() => {
            setMessage("");
            setStatus("idle");
            setIdStatus(null);
            setPhotoPreview((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return null;
            });
          }}
        >
          Reset Form
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-bold text-rose-300 flex items-center gap-2">
          <FaCircleCheck className="text-rose-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <p className="mt-4 text-[11px] font-medium text-slate-400 flex items-center gap-2">
        <FaImage className="text-amber-400" />
        <span>Your data is securely stored for the official EPL 2027 mega auction event.</span>
      </p>
    </form>
  );
}
