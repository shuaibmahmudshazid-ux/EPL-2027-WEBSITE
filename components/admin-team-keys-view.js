"use client";

import { useEffect, useState } from "react";
import { FaCheck, FaCopy, FaKey, FaPlus } from "react-icons/fa6";

const AdminTeamKeysView = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const load = async () => {
    try {
      const response = await fetch("/api/admin/team-keys");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setKeys(result.teamKeys);
    } catch (err) {
      setMessage(err.message || "Unable to load keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { (async () => { await load(); })(); }, []);

  const generate = async () => {
    setGenerating(true); setMessage("");
    try {
      const response = await fetch("/api/admin/team-keys", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await load();
    } catch (err) {
      setMessage(err.message || "Unable to generate key.");
    } finally {
      setGenerating(false);
    }
  };

  const freeCount = keys.filter((teamKey) => teamKey.status === "free").length;

  const copyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((current) => current === key ? "" : current), 1500);
    } catch {
      setMessage("Unable to copy key. Copy it manually.");
    }
  };

  return (
    <section className="mx-auto max-w-[760px] rounded-3xl border-2 border-white/20 bg-[#1a1514] p-7 shadow-2xl backdrop-blur-2xl text-white">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-sans font-black text-base tracking-wide text-white">
          <i className="size-2.5 rounded-full bg-[#f2c46a] animate-pulse not-italic" />
          TEAM REGISTRATION KEYS
        </h2>
        <button
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f2c46a] via-[#f7d070] to-[#e0a838] px-4 py-2.5 text-xs font-black uppercase text-[#141110] shadow hover:brightness-110 disabled:opacity-60 transition cursor-pointer border border-[#f2c46a]"
          type="button"
          onClick={generate}
          disabled={generating}
        >
          <FaPlus />{generating ? "GENERATING..." : "GENERATE NEW KEY"}
        </button>
      </div>
      <p className="mb-5 text-xs sm:text-sm font-semibold text-[#fcf0da]">
        Give one of these keys to each team. A key can be used only once during team registration.
        {!loading && <b className="text-[#f2c46a]"> {freeCount} of {keys.length} keys are still free.</b>}
      </p>
      {message && <p className="mb-4 text-xs font-bold text-red-400">{message}</p>}
      {loading ? (
        <p className="text-xs font-bold text-[#f2c46a]">Loading keys...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/15 bg-[#120f0e]">
          <table className="w-full text-left text-xs">
            <thead className="border-b-2 border-white/20 bg-white/5 text-[#f2c46a] font-black uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-3">#</th>
                <th className="px-3.5 py-3">Key</th>
                <th className="px-3.5 py-3">Status</th>
                <th className="px-3.5 py-3">Used By</th>
                <th className="whitespace-nowrap px-3.5 py-3">Created</th>
                <th className="px-3.5 py-3">Copy</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((teamKey, index) => (
                <tr className="border-b border-white/10 text-white font-medium hover:bg-white/5" key={teamKey._id}>
                  <td className="px-3.5 py-3 font-bold text-[#aeac78]">{index + 1}</td>
                  <td className="whitespace-nowrap px-3.5 py-3 font-mono font-black text-white tracking-wide">
                    <FaKey className="mr-1.5 inline text-[#f2c46a]" />{teamKey.key}
                  </td>
                  <td className="px-3.5 py-3">
                    <b className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      teamKey.status === "used" 
                        ? "bg-red-500/20 text-red-300 border border-red-500/40" 
                        : "bg-[#f2c46a]/20 text-[#f2c46a] border border-[#f2c46a]/50"
                    }`}>
                      {teamKey.status === "used" ? "Used" : "Free"}
                    </b>
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-3 font-bold">{teamKey.team?.name || "—"}</td>
                  <td className="whitespace-nowrap px-3.5 py-3 text-white/70">{new Date(teamKey.createdAt).toLocaleDateString()}</td>
                  <td className="px-3.5 py-3">
                    <button
                      className="rounded-lg p-1.5 text-white hover:text-[#f2c46a] transition cursor-pointer"
                      type="button"
                      onClick={() => copyKey(teamKey.key)}
                      aria-label={`Copy key ${teamKey.key}`}
                    >
                      {copiedKey === teamKey.key ? <FaCheck className="text-[#f2c46a]" /> : <FaCopy />}
                    </button>
                  </td>
                </tr>
              ))}
              {!keys.length && (
                <tr>
                  <td className="px-3.5 py-8 text-center text-white/50 font-bold" colSpan={6}>
                    No keys generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminTeamKeysView;
