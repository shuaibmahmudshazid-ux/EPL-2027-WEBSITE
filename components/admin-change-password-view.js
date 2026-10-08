"use client";

import { useState } from "react";

const fieldClass = "mt-2 h-12 w-full rounded-xl border-2 border-white/20 bg-[#120f0e] px-4 text-sm text-white font-medium outline-none placeholder-white/35 focus:border-[#f2c46a] focus:ring-2 focus:ring-[#f2c46a]/20";

const AdminChangePasswordView = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  const submit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) { setStatus("error"); return setMessage("New password and confirmation do not match."); }
    if (newPassword.length < 6) { setStatus("error"); return setMessage("New password must be at least 6 characters."); }
    setStatus("loading"); setMessage("");
    try {
      const response = await fetch("/api/admin/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setStatus("success"); setMessage("Password updated successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (error) {
      setStatus("error"); setMessage(error.message || "Unable to change password.");
    }
  };

  return (
    <section className="mx-auto max-w-[500px] rounded-3xl border-2 border-white/20 bg-[#1a1514] p-7 sm:p-8 shadow-2xl backdrop-blur-2xl text-white">
      <h2 className="mb-5 flex items-center gap-2 font-sans font-black text-base tracking-wide text-white">
        <i className="size-2.5 rounded-full bg-[#f2c46a] animate-pulse not-italic" />
        CHANGE ADMIN PASSWORD
      </h2>
      <form onSubmit={submit}>
        <label className="mb-4 block text-xs font-black uppercase tracking-wider text-[#f2c46a]">CURRENT PASSWORD<input className={fieldClass} type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
        <label className="mb-4 block text-xs font-black uppercase tracking-wider text-[#f2c46a]">NEW PASSWORD<input className={fieldClass} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
        <label className="mb-5 block text-xs font-black uppercase tracking-wider text-[#f2c46a]">CONFIRM NEW PASSWORD<input className={fieldClass} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
        {message && <p className={`mb-4 text-xs font-bold ${status === "success" ? "text-[#f2c46a]" : "text-red-400"}`}>{message}</p>}
        <button className="h-12 w-full rounded-xl bg-gradient-to-r from-[#f2c46a] via-[#f7d070] to-[#e0a838] text-xs font-black uppercase tracking-wider text-[#141110] shadow-lg hover:brightness-110 disabled:opacity-60 transition cursor-pointer border border-[#f2c46a]" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "UPDATING..." : "UPDATE PASSWORD"}
        </button>
      </form>
    </section>
  );
};

export default AdminChangePasswordView;
