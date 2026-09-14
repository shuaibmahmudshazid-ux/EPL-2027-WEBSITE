"use client";

import { useEffect, useState } from "react";

const fieldClass = "mt-2 h-11 w-full rounded border border-white/25 bg-[#02121f] px-3 text-sm text-white outline-none focus:border-[#d4a84f]";
const roleBadge = { superadmin: "bg-[#39216a] text-[#cb7cff]", admin: "bg-[#76511d] text-[#f2d590]" };

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

  return <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
    <section className="rounded-lg border border-[#b8a18055] bg-[#031827]/90 p-4 shadow-lg">
      <h2 className="mb-4 flex items-center gap-2 font-sans font-bold text-sm tracking-wide"><i className="size-2 rounded-full bg-[#c7963b]" />ALL ADMINS</h2>
      {loadingAdmins && <p className="text-xs text-[#d4a84f]">Loading admins...</p>}
      {listError && <p className="text-xs text-red-300">{listError}</p>}
      {!loadingAdmins && !listError && <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead className="border-y border-white/15 text-[#d4dde1]"><tr><th className="px-2 py-2">#</th><th className="px-2 py-2">Email</th><th className="px-2 py-2">Role</th><th className="whitespace-nowrap px-2 py-2">Added On</th></tr></thead>
          <tbody>
            {admins.map((admin, i) => <tr className="border-b border-white/10" key={admin._id}>
              <td className="px-2 py-2">{i + 1}</td>
              <td className="px-2 py-2 font-medium">{admin.email}</td>
              <td className="px-2 py-2"><b className={`rounded px-1.5 py-0.5 capitalize ${roleBadge[admin.role]}`}>{admin.role === "superadmin" ? "Super Admin" : "Admin"}</b></td>
              <td className="whitespace-nowrap px-2 py-2">{new Date(admin.createdAt).toLocaleDateString()}</td>
            </tr>)}
          </tbody>
        </table>
      </div>}
    </section>
    <section className="rounded-lg border border-[#b8a18055] bg-[#031827]/90 p-5 shadow-lg">
      <h2 className="mb-4 flex items-center gap-2 font-sans font-bold text-sm tracking-wide"><i className="size-2 rounded-full bg-[#c7963b]" />ADD NEW ADMIN</h2>
      <form onSubmit={submit}>
        <label className="mb-3 block text-xs font-bold">NEW ADMIN EMAIL<input className={fieldClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="mb-3 block text-xs font-bold">NEW ADMIN PASSWORD<input className={fieldClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <label className="mb-4 block text-xs font-bold">CONFIRM PASSWORD<input className={fieldClass} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
        <label className="mb-4 block text-xs font-bold">SUPER ADMIN PASSWORD (to authorize)<input className={fieldClass} type="password" value={superAdminPassword} onChange={(event) => setSuperAdminPassword(event.target.value)} required /></label>
        {message && <p className={`mb-4 text-xs ${status === "success" ? "text-[#e4bf72]" : "text-red-300"}`}>{message}</p>}
        <button className="h-11 w-full rounded bg-[#b8872f] text-sm font-bold disabled:opacity-60" type="submit" disabled={status === "loading"}>{status === "loading" ? "ADDING..." : "ADD ADMIN"}</button>
      </form>
    </section>
  </div>;
};

export default AdminAddAdminView;
