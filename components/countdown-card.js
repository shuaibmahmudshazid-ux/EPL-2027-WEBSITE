"use client";

import { useEffect, useState } from "react";
const TARGET_DATE = new Date("2026-10-02T00:00:00");
const pad = (value) => String(value).padStart(2, "0");
const INITIAL_TIME_LEFT = { days: 0, hours: 0, minutes: 0, seconds: 0 };

const getTimeLeft = () => {
  const totalSeconds = Math.max(0, Math.floor((TARGET_DATE.getTime() - Date.now()) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

const CountdownCard = ({ className = "" }) => {
  // The initial value must be deterministic: Date.now() differs between the
  // server render and client hydration.
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_LEFT);

  useEffect(() => {
    const updateTimeLeft = () => setTimeLeft(getTimeLeft());
    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MIN", value: timeLeft.minutes },
    { label: "SEC", value: timeLeft.seconds },
  ];

  return (
    <article id="schedule" className={`border border-white/15 bg-[#07111d]/60 px-3 py-[18px] pb-[15px] text-white shadow-[0_18px_40px_rgba(0,0,0,.25)] backdrop-blur-xl min-[781px]:px-6 ${className}`}>
      <h3 className="text-center text-[12px] font-bold tracking-[.2em] text-white/85 [text-shadow:1px_1px_3px_rgba(0,0,0,.7)]">
        AUCTION <span className="text-[#d9b56d]">STARTS IN</span>
      </h3>
      <div className="mt-[15px] flex items-center justify-center gap-1.5">
        {units.map(({ label, value }, index) => (
          <div className="flex items-center" key={label}>
            <div className="min-w-[60px] py-2 text-center">
              <b className="block text-4xl font-bold tabular-nums text-[#d9b56d] [text-shadow:1px_1px_4px_rgba(0,0,0,.7)] min-[781px]:text-5xl">{pad(value)}</b>
              <small className="text-[8px] tracking-[1px] [text-shadow:1px_1px_2px_rgba(0,0,0,.7)]">{label}</small>
            </div>
            {index < units.length - 1 && <b className="mx-1 text-2xl text-[#d9b56d] [text-shadow:1px_1px_3px_rgba(0,0,0,.7)]">:</b>}
          </div>
        ))}
      </div>
    </article>
  );
};

export default CountdownCard;
