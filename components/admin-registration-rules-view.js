"use client";

import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaPlus, FaTrash } from "react-icons/fa6";

const fieldClass = "h-11 flex-1 rounded border border-white/25 bg-[#02121f] px-3 text-sm text-white outline-none focus:border-[#d4a84f]";

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

  return <section className="mx-auto max-w-[720px] rounded-lg border border-[#b8a18055] bg-[#031827]/90 p-5 shadow-lg">
    <h2 className="mb-2 flex items-center gap-2 font-sans font-bold text-sm tracking-wide"><i className="size-2 rounded-full bg-[#c7963b]" />REGISTRATION RULES</h2>
    <p className="mb-4 text-xs text-[#9faab2]">Add rules one at a time. Use the arrows to change the order players see them in.</p>
    {loading ? <p className="text-xs text-[#d4a84f]">Loading current rules...</p> : <>
      <ol className="mb-4 space-y-2">
        {rules.map((rule, index) => <li className="flex items-center gap-2 rounded border border-white/15 bg-[#02121f]/60 px-3 py-2 text-sm" key={index}>
          <b className="w-5 shrink-0 text-[#d4a84f]">{index + 1}.</b>
          <span className="flex-1">{rule}</span>
          <button className="rounded p-1.5 text-[#9faab2] hover:text-white disabled:opacity-30" type="button" onClick={() => moveRule(index, -1)} disabled={index === 0 || status === "loading"} aria-label="Move up"><FaArrowUp /></button>
          <button className="rounded p-1.5 text-[#9faab2] hover:text-white disabled:opacity-30" type="button" onClick={() => moveRule(index, 1)} disabled={index === rules.length - 1 || status === "loading"} aria-label="Move down"><FaArrowDown /></button>
          <button className="rounded p-1.5 text-red-300 hover:text-red-200" type="button" onClick={() => removeRule(index)} disabled={status === "loading"} aria-label="Remove"><FaTrash /></button>
        </li>)}
        {!rules.length && <p className="text-xs text-[#7d8993]">No rules added yet.</p>}
      </ol>
      <div className="flex gap-2">
        <input className={fieldClass} placeholder="Write a new rule..." value={newRule} onChange={(event) => setNewRule(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addRule(); } }} />
        <button className="flex items-center gap-2 rounded bg-[#b8872f] px-4 text-sm font-bold disabled:opacity-60" type="button" onClick={addRule} disabled={!newRule.trim() || status === "loading"}><FaPlus />ADD NEW</button>
      </div>
      {message && <p className={`mt-3 text-xs ${status === "success" ? "text-[#e4bf72]" : "text-red-300"}`}>{message}</p>}
    </>}
  </section>;
};

export default AdminRegistrationRulesView;
