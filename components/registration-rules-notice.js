"use client";

import { useEffect, useState } from "react";
import { FaListCheck } from "react-icons/fa6";

export default function RegistrationRulesNotice() {
  const [rules, setRules] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/registration-rules");
        const result = await response.json();
        setRules(result.rules || []);
      } catch {
        setRules([]);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  if (!loaded || !rules.length) return null;

  return (
    <div className="mb-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-[#111827]/80 p-4 sm:p-6 text-sm text-slate-300 shadow-2xl backdrop-blur-xl">
      <h2 className="mb-3 flex items-center gap-2 font-sans font-black text-sm sm:text-base uppercase tracking-wider text-white">
        <FaListCheck className="text-amber-400" />
        Official Registration <span className="text-amber-400">Rules</span>
      </h2>
      <ol className="list-decimal space-y-2 pl-5 marker:font-black marker:text-amber-400 text-xs sm:text-sm text-slate-300">
        {rules.map((rule, index) => (
          <li key={index} className="leading-relaxed">
            {rule}
          </li>
        ))}
      </ol>
    </div>
  );
}
