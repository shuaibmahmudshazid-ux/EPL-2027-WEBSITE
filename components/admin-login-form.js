"use client";

import { useState } from "react";

const AdminLoginForm = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      onSuccess(result.admin);
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="grid min-h-screen place-items-center bg-[#02121f] px-4 text-white">
    <form className="w-full max-w-[380px] rounded-lg border border-[#b8a18055] bg-[#031827]/90 p-6 shadow-lg" onSubmit={submit}>
      <h1 className="mb-1 font-sans font-bold text-2xl tracking-wide">EPL ADMIN <span className="text-[#d4a84f]">LOGIN</span></h1>
      <p className="mb-5 text-xs text-[#9faab2]">Sign in to manage EPL - ESDM Premier League.</p>
      <label className="mb-3 block text-xs font-bold">EMAIL<input className="mt-2 h-11 w-full rounded border border-white/25 bg-[#02121f] px-3 text-sm text-white outline-none focus:border-[#d4a84f]" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label className="mb-4 block text-xs font-bold">PASSWORD<input className="mt-2 h-11 w-full rounded border border-white/25 bg-[#02121f] px-3 text-sm text-white outline-none focus:border-[#d4a84f]" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {error && <p className="mb-4 text-xs text-red-300">{error}</p>}
      <button className="h-11 w-full rounded bg-[#b8872f] text-sm font-bold disabled:opacity-60" type="submit" disabled={loading}>{loading ? "SIGNING IN..." : "SIGN IN"}</button>
    </form>
  </div>;
};

export default AdminLoginForm;
