"use client";

import { useEffect, useState } from "react";
import { FaListCheck } from "react-icons/fa6";

const RegistrationRulesNotice = () => {
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

  return <div className="mb-6 rounded-2xl border border-[#d4a84f]/70 bg-[#031320]/85 p-5 text-sm text-white shadow-2xl backdrop-blur-md">
    <h2 className="mb-3 flex items-center gap-2 font-sans font-bold text-lg tracking-wide"><FaListCheck className="text-[#d4a84f]" />REGISTRATION <span className="text-[#d4a84f]">RULES</span></h2>
    <ol className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-[#d4a84f]">{rules.map((rule, index) => <li key={index}>{rule}</li>)}</ol>
  </div>;
};

export default RegistrationRulesNotice;
