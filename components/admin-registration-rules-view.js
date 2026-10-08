"use client";

import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaPlus, FaTrash } from "react-icons/fa6";

const fieldClass = "h-12 flex-1 rounded-xl border-2 border-white/20 bg-[#120f0e] px-4 text-sm text-white font-medium outline-none placeholder-white/35 focus:border-[#f2c46a] focus:ring-2 focus:ring-[#f2c46a]/20";

const AdminRegistrationRulesView = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/registration-rules");
        const result = await response.json();
        setRules(result.rules || []);
      } catch {
        setMessage("Unable to load current rules.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (updated) => {
    setStatus("loading"); setMessage("");
    try {
      const response = await fetch("/api/registration-rules", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rules: updated }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setRules(result.rules);
      setStatus("success"); setMessage("Rules updated.");
    } catch (error) {
      setStatus("error"); setMessage(error.message || "Unable to save rules.");
    }
  };

  const addRule = () => {
    const text = newRule.trim();
    if (!text) return;
    setNewRule("");
    save([...rules, text]);
  };

  const removeRule = (index) => save(rules.filter((_, i) => i !== index));

  const moveRule = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= rules.length) return;
    const updated = [...rules];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    save(updated);
  };

  return (
    <section className="mx-auto max-w-[760px] rounded-3xl border-2 border-white/20 bg-[#1a1514] p-7 shadow-2xl backdrop-blur-2xl text-white">
      <h2 className="mb-2 flex items-center gap-2 font-sans font-black text-base tracking-wide text-white">
        <i className="size-2.5 rounded-full bg-[#f2c46a] animate-pulse not-italic" />
        PLAYER REGISTRATION RULES
      </h2>
      <p className="mb-5 text-xs sm:text-sm font-semibold text-[#fcf0da]">
        Add rules one at a time. Use the arrows to change the order players see them in.
      </p>
      {loading ? (
        <p className="text-xs font-bold text-[#f2c46a]">Loading current rules...</p>
      ) : (
        <>
          <ol className="mb-5 space-y-2.5">
            {rules.map((rule, index) => (
              <li className="flex items-center gap-3 rounded-xl border border-white/15 bg-[#120f0e] px-4 py-3 text-sm text-white shadow-sm" key={index}>
                <b className="w-6 shrink-0 text-[#f2c46a] text-base">{index + 1}.</b>
                <span className="flex-1 text-xs sm:text-sm font-semibold leading-relaxed">{rule}</span>
                <button className="rounded-lg p-1.5 text-white hover:text-[#f2c46a] disabled:opacity-30 transition cursor-pointer" type="button" onClick={() => moveRule(index, -1)} disabled={index === 0 || status === "loading"} aria-label="Move up"><FaArrowUp /></button>
                <button className="rounded-lg p-1.5 text-white hover:text-[#f2c46a] disabled:opacity-30 transition cursor-pointer" type="button" onClick={() => moveRule(index, 1)} disabled={index === rules.length - 1 || status === "loading"} aria-label="Move down"><FaArrowDown /></button>
                <button className="rounded-lg p-1.5 text-red-400 hover:text-red-300 transition cursor-pointer" type="button" onClick={() => removeRule(index)} disabled={status === "loading"} aria-label="Remove"><FaTrash /></button>
              </li>
            ))}
            {!rules.length && <p className="text-xs text-white/50">No rules added yet.</p>}
          </ol>
          <div className="flex gap-2.5">
            <input className={fieldClass} placeholder="Write a new rule..." value={newRule} onChange={(event) => setNewRule(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addRule(); } }} />
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f2c46a] via-[#f7d070] to-[#e0a838] px-5 text-xs font-black uppercase text-[#141110] shadow hover:brightness-110 disabled:opacity-60 transition cursor-pointer border border-[#f2c46a]" type="button" onClick={addRule} disabled={!newRule.trim() || status === "loading"}>
              <FaPlus />ADD NEW
            </button>
          </div>
          {message && <p className={`mt-3 text-xs font-bold ${status === "success" ? "text-[#f2c46a]" : "text-red-400"}`}>{message}</p>}
        </>
      )}
    </section>
  );
};

export default AdminRegistrationRulesView;
