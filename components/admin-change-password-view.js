"use client";

import { useState } from "react";

const fieldClass = "mt-2 h-11 w-full rounded border border-white/25 bg-[#02121f] px-3 text-sm text-white outline-none focus:border-[#d4a84f]";

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

  return <section className="mx-auto max-w-[460px] rounded-lg border border-[#b8a18055] bg-[#031827]/90 p-5 shadow-lg">
    <h2 className="mb-4 flex items-center gap-2 font-sans font-bold text-sm tracking-wide"><i className="size-2 rounded-full bg-[#c7963b]" />CHANGE PASSWORD</h2>
    <form onSubmit={submit}>
      <label className="mb-3 block text-xs font-bold">CURRENT PASSWORD<input className={fieldClass} type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
      <label className="mb-3 block text-xs font-bold">NEW PASSWORD<input className={fieldClass} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
      <label className="mb-4 block text-xs font-bold">CONFIRM NEW PASSWORD<input className={fieldClass} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
      {message && <p className={`mb-4 text-xs ${status === "success" ? "text-[#e4bf72]" : "text-red-300"}`}>{message}</p>}
      <button className="h-11 w-full rounded bg-[#b8872f] text-sm font-bold disabled:opacity-60" type="submit" disabled={status === "loading"}>{status === "loading" ? "UPDATING..." : "UPDATE PASSWORD"}</button>
    </form>
  </section>;
};

export default AdminChangePasswordView;
