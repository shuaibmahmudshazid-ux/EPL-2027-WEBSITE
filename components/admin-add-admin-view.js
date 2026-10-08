"use client";

import { useEffect, useState } from "react";

const fieldClass = "mt-2 h-12 w-full rounded-xl border-2 border-white/20 bg-[#120f0e] px-4 text-sm text-white font-medium outline-none placeholder-white/35 focus:border-[#f2c46a] focus:ring-2 focus:ring-[#f2c46a]/20";
const roleBadge = {
  superadmin: "bg-[#f2c46a] text-[#141110] font-black",
  admin: "bg-white/20 border border-white/30 text-white font-bold",
};

const AdminAddAdminView = () => {
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [listError, setListError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [superAdminPassword, setSuperAdminPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  const loadAdmins = async () => {
    try {
      const response = await fetch("/api/admin/list");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setAdmins(result.admins);
    } catch (err) {
      setListError(err.message || "Unable to load admins.");
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => { (async () => { await loadAdmins(); })(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) { setStatus("error"); return setMessage("Password and confirmation do not match."); }
    if (password.length < 6) { setStatus("error"); return setMessage("Password must be at least 6 characters."); }
    setStatus("loading"); setMessage("");
    try {
      const response = await fetch("/api/admin/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, superAdminPassword }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setStatus("success"); setMessage(`Admin account created for ${result.admin.email}.`);
      setEmail(""); setPassword(""); setConfirmPassword(""); setSuperAdminPassword("");
      loadAdmins();
    } catch (error) {
      setStatus("error"); setMessage(error.message || "Unable to add admin.");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr] text-white">
      <section className="rounded-3xl border-2 border-white/20 bg-[#1a1514] p-6 sm:p-7 shadow-2xl backdrop-blur-2xl">
        <h2 className="mb-4 flex items-center gap-2 font-sans font-black text-base tracking-wide text-white">
          <i className="size-2.5 rounded-full bg-[#f2c46a] animate-pulse not-italic" />
          ALL REGISTERED ADMINS
        </h2>
        {loadingAdmins && <p className="text-xs font-bold text-[#f2c46a]">Loading admins...</p>}
        {listError && <p className="text-xs font-bold text-red-400">{listError}</p>}
        {!loadingAdmins && !listError && (
          <div className="overflow-x-auto rounded-2xl border border-white/15 bg-[#120f0e]">
            <table className="w-full text-left text-xs">
              <thead className="border-b-2 border-white/20 bg-white/5 text-[#f2c46a] font-black uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-3">#</th>
                  <th className="px-3.5 py-3">Email</th>
                  <th className="px-3.5 py-3">Role</th>
                  <th className="whitespace-nowrap px-3.5 py-3">Added On</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, i) => (
                  <tr className="border-b border-white/10 text-white font-medium hover:bg-white/5" key={admin._id}>
                    <td className="px-3.5 py-3 font-bold text-[#aeac78]">{i + 1}</td>
                    <td className="px-3.5 py-3 font-bold">{admin.email}</td>
                    <td className="px-3.5 py-3">
                      <b className={`rounded-full px-2.5 py-0.5 capitalize text-[10px] ${roleBadge[admin.role] || "bg-white/20 text-white"}`}>
                        {admin.role === "superadmin" ? "Super Admin" : "Admin"}
                      </b>
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3 text-white/70">{new Date(admin.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="rounded-3xl border-2 border-white/20 bg-[#1a1514] p-6 sm:p-7 shadow-2xl backdrop-blur-2xl">
        <h2 className="mb-4 flex items-center gap-2 font-sans font-black text-base tracking-wide text-white">
          <i className="size-2.5 rounded-full bg-[#f2c46a] animate-pulse not-italic" />
          ADD NEW ADMIN
        </h2>
        <form onSubmit={submit}>
          <label className="mb-3.5 block text-xs font-black uppercase tracking-wider text-[#f2c46a]">NEW ADMIN EMAIL<input className={fieldClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label className="mb-3.5 block text-xs font-black uppercase tracking-wider text-[#f2c46a]">NEW ADMIN PASSWORD<input className={fieldClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <label className="mb-4 block text-xs font-black uppercase tracking-wider text-[#f2c46a]">CONFIRM PASSWORD<input className={fieldClass} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
          <label className="mb-5 block text-xs font-black uppercase tracking-wider text-[#f2c46a]">SUPER ADMIN PASSWORD (to authorize)<input className={fieldClass} type="password" value={superAdminPassword} onChange={(event) => setSuperAdminPassword(event.target.value)} required /></label>
          {message && <p className={`mb-4 text-xs font-bold ${status === "success" ? "text-[#f2c46a]" : "text-red-400"}`}>{message}</p>}
          <button className="h-12 w-full rounded-xl bg-gradient-to-r from-[#f2c46a] via-[#f7d070] to-[#e0a838] text-xs font-black uppercase tracking-wider text-[#141110] shadow-lg hover:brightness-110 disabled:opacity-60 transition cursor-pointer border border-[#f2c46a]" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "ADDING..." : "ADD ADMIN"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminAddAdminView;
