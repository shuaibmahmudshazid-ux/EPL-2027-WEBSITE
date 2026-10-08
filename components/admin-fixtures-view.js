"use client";

import { useState, useEffect } from "react";
import {
  FaCalendarDays,
  FaPlus,
  FaTrash,
  FaClock,
  FaLocationDot,
  FaSpinner,
  FaCheck,
  FaTriangleExclamation,
  FaXmark,
  FaShieldHalved,
} from "react-icons/fa6";

const TEAM_COLOR_PRESETS = [
  { label: "Blue / Indigo", value: "from-blue-600 to-indigo-900" },
  { label: "Amber / Yellow", value: "from-amber-600 to-yellow-800" },
  { label: "Emerald / Teal", value: "from-emerald-600 to-teal-900" },
  { label: "Rose / Red", value: "from-rose-600 to-red-900" },
  { label: "Cyan / Blue", value: "from-cyan-600 to-blue-900" },
  { label: "Lime / Green", value: "from-lime-600 to-green-900" },
  { label: "Purple / Violet", value: "from-purple-600 to-violet-900" },
];

export default function AdminFixturesView() {
  const [fixtures, setFixtures] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Form State
  const [matchNumber, setMatchNumber] = useState("Match 01");
  const [stage, setStage] = useState("Group Stage • Pool A");
  const [day, setDay] = useState("Day 1");
  const [date, setDate] = useState("12 Oct 2026");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [time, setTime] = useState("09:30 AM");
  const [venue, setVenue] = useState("Central Stadium, PSTU");
  const [pitch, setPitch] = useState("PSTU Pitch #1 (Batting Paradise)");
  const [format, setFormat] = useState("T10 Cricket (10 Overs)");
  const [status, setStatus] = useState("Upcoming");

  // Team 1
  const [team1Name, setTeam1Name] = useState("");
  const [team1Short, setTeam1Short] = useState("");
  const [team1Color, setTeam1Color] = useState("from-blue-600 to-indigo-900");
  const [team1Session, setTeam1Session] = useState("");

  // Team 2
  const [team2Name, setTeam2Name] = useState("");
  const [team2Short, setTeam2Short] = useState("");
  const [team2Color, setTeam2Color] = useState("from-amber-600 to-yellow-800");
  const [team2Session, setTeam2Session] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fixRes, teamRes] = await Promise.all([
        fetch("/api/fixtures", { cache: "no-store" }),
        fetch("/api/teams", { cache: "no-store" }),
      ]);

      if (fixRes.ok) {
        const fixData = await fixRes.json();
        setFixtures(Array.isArray(fixData.fixtures) ? fixData.fixtures : []);
      }

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeams(Array.isArray(teamData.teams) ? teamData.teams : []);
      }
    } catch (err) {
      console.error("Failed to fetch fixtures:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectTeam1 = (e) => {
    const val = e.target.value;
    setTeam1Name(val);
    const found = teams.find((t) => t.name === val);
    if (found) {
      setTeam1Short(val.slice(0, 3).toUpperCase());
    }
  };

  const handleSelectTeam2 = (e) => {
    const val = e.target.value;
    setTeam2Name(val);
    const found = teams.find((t) => t.name === val);
    if (found) {
      setTeam2Short(val.slice(0, 3).toUpperCase());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!matchNumber.trim() || !date.trim() || !time.trim()) {
      setStatusMessage({ type: "error", text: "Match number, date, and time are required." });
      return;
    }
    if (!team1Name.trim() || !team2Name.trim()) {
      setStatusMessage({ type: "error", text: "Both Team 1 and Team 2 names are required." });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/fixtures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchNumber: matchNumber.trim(),
          stage: stage.trim(),
          day: day.trim(),
          date: date.trim(),
          dayOfWeek: dayOfWeek.trim(),
          time: time.trim(),
          venue: venue.trim(),
          pitch: pitch.trim(),
          format: format.trim(),
          status: status.trim(),
          team1: {
            name: team1Name.trim(),
            short: team1Short.trim() || team1Name.slice(0, 3).toUpperCase(),
            color: team1Color,
            session: team1Session.trim(),
          },
          team2: {
            name: team2Name.trim(),
            short: team2Short.trim() || team2Name.slice(0, 3).toUpperCase(),
            color: team2Color,
            session: team2Session.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create fixture.");
      }

      setStatusMessage({ type: "success", text: "Upcoming match fixture added successfully!" });
      
      // Advance match number suggestion
      const numMatch = matchNumber.match(/\d+/);
      if (numMatch) {
        const nextNum = String(parseInt(numMatch[0]) + 1).padStart(2, "0");
        setMatchNumber(`Match ${nextNum}`);
      }

      // Clear teams
      setTeam1Name("");
      setTeam1Short("");
      setTeam1Session("");
      setTeam2Name("");
      setTeam2Short("");
      setTeam2Session("");

      await fetchData();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Failed to add fixture." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this fixture?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/fixtures/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFixtures((prev) => prev.filter((f) => f._id !== id));
        setStatusMessage({ type: "success", text: "Fixture deleted successfully." });
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete fixture.");
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Error deleting fixture." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 rounded-full bg-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Match Fixtures Management
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Publish upcoming matches, schedule clash dates, assign pool stages, and configure PSTU venue pitches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono font-bold text-amber-400">
            {fixtures.length} Fixtures Published
          </span>
        </div>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs font-bold transition-all ${
            statusMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/40 bg-red-500/10 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === "success" ? (
              <FaCheck className="text-sm shrink-0" />
            ) : (
              <FaTriangleExclamation className="text-sm shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <FaXmark />
          </button>
        </div>
      )}

      {/* Main Grid: Form on Left, List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/15 bg-[#171413] p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 pb-4 border-b border-white/10 mb-5">
            <FaCalendarDays className="text-amber-400 text-sm" />
            <h3 className="font-sans font-black text-base text-white uppercase tracking-wider">
              Add Upcoming Fixture
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Match Number & Stage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                  Match Number *
                </label>
                <input
                  type="text"
                  required
                  value={matchNumber}
                  onChange={(e) => setMatchNumber(e.target.value)}
                  placeholder="e.g. Match 01"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                  Stage / Pool
                </label>
                <input
                  type="text"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  placeholder="Group Stage • Pool A"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Day Filter Category & Date */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                  Day Filter
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0e0b0a] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="Day 1">Day 1</option>
                  <option value="Day 2">Day 2</option>
                  <option value="Day 3">Day 3</option>
                  <option value="Playoffs">Playoffs</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                  Date *
                </label>
                <input
                  type="text"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="12 Oct 2026"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                  Time *
                </label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="09:30 AM"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Day of Week */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                Day of Week
              </label>
              <input
                type="text"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                placeholder="Monday"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Team 1 Details Box */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-3">
              <span className="block text-[11px] font-black uppercase tracking-wider text-blue-400">
                Team 1 (First Innings / Home)
              </span>

              {teams.length > 0 && (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Pick registered team:</label>
                  <select
                    onChange={handleSelectTeam1}
                    className="w-full rounded-lg border border-white/15 bg-[#0e0b0a] px-2.5 py-1.5 text-xs text-white mb-2"
                  >
                    <option value="">-- Choose from existing teams or type below --</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  placeholder="Team 1 Name *"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={team1Short}
                  onChange={(e) => setTeam1Short(e.target.value)}
                  placeholder="Tag (e.g. STR)"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={team1Color}
                  onChange={(e) => setTeam1Color(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0e0b0a] px-2.5 py-1.5 text-xs text-white"
                >
                  {TEAM_COLOR_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={team1Session}
                  onChange={(e) => setTeam1Session(e.target.value)}
                  placeholder="Session (e.g. 2021-2022)"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Team 2 Details Box */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
              <span className="block text-[11px] font-black uppercase tracking-wider text-amber-400">
                Team 2 (Second Innings / Away)
              </span>

              {teams.length > 0 && (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Pick registered team:</label>
                  <select
                    onChange={handleSelectTeam2}
                    className="w-full rounded-lg border border-white/15 bg-[#0e0b0a] px-2.5 py-1.5 text-xs text-white mb-2"
                  >
                    <option value="">-- Choose from existing teams or type below --</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  placeholder="Team 2 Name *"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={team2Short}
                  onChange={(e) => setTeam2Short(e.target.value)}
                  placeholder="Tag (e.g. THU)"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={team2Color}
                  onChange={(e) => setTeam2Color(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0e0b0a] px-2.5 py-1.5 text-xs text-white"
                >
                  {TEAM_COLOR_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={team2Session}
                  onChange={(e) => setTeam2Session(e.target.value)}
                  placeholder="Session (e.g. 2022-2023)"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Venue & Pitch */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Central Stadium, PSTU"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                  Pitch Condition
                </label>
                <input
                  type="text"
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  placeholder="PSTU Pitch #1"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Adding Fixture...</span>
                </>
              ) : (
                <>
                  <FaPlus className="text-xs" />
                  <span>Publish Upcoming Fixture</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Fixtures List (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/15 bg-[#171413] p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2">
              <FaCalendarDays className="text-amber-400 text-sm" />
              <h3 className="font-sans font-black text-base text-white uppercase tracking-wider">
                Current Scheduled Fixtures
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {fixtures.length} matches
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <FaSpinner className="animate-spin text-2xl text-amber-400" />
              <span>Loading fixtures...</span>
            </div>
          ) : fixtures.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <FaCalendarDays className="mx-auto text-3xl text-slate-600 mb-2" />
              <p className="font-bold text-white">No fixtures scheduled yet</p>
              <p className="mt-1 text-slate-400">Use the form on the left to add upcoming matches.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {fixtures.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:border-amber-500/40 hover:bg-black/60 shadow-md"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-400 uppercase">
                        {item.matchNumber}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 text-[11px]">
                        {item.stage}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-400">
                      <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
                      {item.status || "Upcoming"}
                    </span>
                  </div>

                  {/* Team vs Team display */}
                  <div className="flex items-center justify-between gap-3 my-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div
                        className={`size-9 rounded-xl bg-gradient-to-br ${item.team1.color || "from-blue-600 to-indigo-900"} flex items-center justify-center font-black text-xs text-white shrink-0`}
                      >
                        {item.team1.short || item.team1.name?.slice(0, 3)}
                      </div>
                      <div className="truncate">
                        <span className="block text-xs font-bold text-white truncate">
                          {item.team1.name}
                        </span>
                        {item.team1.session && (
                          <span className="block text-[10px] text-slate-400">
                            {item.team1.session}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center px-2 shrink-0">
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-black text-amber-400">
                        VS
                      </span>
                      <span className="text-[10px] font-mono text-slate-300 mt-1">
                        {item.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right">
                      <div className="truncate">
                        <span className="block text-xs font-bold text-white truncate">
                          {item.team2.name}
                        </span>
                        {item.team2.session && (
                          <span className="block text-[10px] text-slate-400">
                            {item.team2.session}
                          </span>
                        )}
                      </div>
                      <div
                        className={`size-9 rounded-xl bg-gradient-to-br ${item.team2.color || "from-amber-600 to-yellow-800"} flex items-center justify-center font-black text-xs text-white shrink-0`}
                      >
                        {item.team2.short || item.team2.name?.slice(0, 3)}
                      </div>
                    </div>
                  </div>

                  {/* Footer & Delete button */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="truncate max-w-[140px]">{item.venue}</span>
                    </div>

                    <button
                      type="button"
                      disabled={deletingId === item._id}
                      onClick={() => handleDelete(item._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === item._id ? (
                        <FaSpinner className="animate-spin text-[9px]" />
                      ) : (
                        <FaTrash className="text-[9px]" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
