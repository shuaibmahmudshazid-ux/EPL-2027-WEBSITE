"use client";

import { useEffect, useState } from "react";
import { FaArrowRightFromBracket, FaBell, FaCalendarCheck, FaChartBar, FaKey, FaListCheck, FaShieldHalved, FaUserCheck, FaUserGroup, FaUserPlus, FaUsers } from "react-icons/fa6";
import AdminPlayersView from "./admin-players-view";
import AdminLoginForm from "./admin-login-form";
import AdminChangePasswordView from "./admin-change-password-view";
import AdminAddAdminView from "./admin-add-admin-view";
import AdminRegistrationRulesView from "./admin-registration-rules-view";
import AdminTeamKeysView from "./admin-team-keys-view";
import AdminTeamsView from "./admin-teams-view";

const menu=[{label:"Dashboard",icon:FaChartBar},{label:"Teams",icon:FaUserGroup},{label:"Players",icon:FaUsers},{label:"Player Registration Rules",icon:FaListCheck},{label:"Team Keys",icon:FaKey}];
const accountMenu=[{label:"Change Password",icon:FaKey},{label:"Add Admin",icon:FaUserPlus}];
const Stat=({icon:Icon,label,value,color})=><article className="rounded-lg border border-white/10 bg-[#031827] p-4"><div className="flex items-center gap-3"><i className={`grid size-14 place-items-center rounded-full text-2xl ${color}`}><Icon/></i><div><p className="text-xs font-bold uppercase">{label}</p><b className="text-3xl">{value ?? "…"}</b></div></div></article>;

const AdminDashboard=()=>{
const [session,setSession]=useState(undefined);
const [activeSection,setActiveSection]=useState("Dashboard");
const [stats,setStats]=useState({totalPlayers:null,totalTeams:null,pendingPlayers:null});
const [showLogoutConfirm,setShowLogoutConfirm]=useState(false);

useEffect(()=>{
  (async()=>{
    try{
      const response=await fetch("/api/admin/me");
      const result=await response.json();
      setSession(response.ok?result.admin:null);
    }catch{
      setSession(null);
    }
  })();
},[]);

useEffect(()=>{
  if(!session) return;
  (async()=>{
    try{
      const [playersResponse,teamsResponse]=await Promise.all([fetch("/api/players"),fetch("/api/teams")]);
      const playersResult=await playersResponse.json();
      const teamsResult=await teamsResponse.json();
      const players=playersResponse.ok?playersResult.players:[];
      const teams=teamsResponse.ok?teamsResult.teams:[];
      setStats({totalPlayers:players.length,totalTeams:teams.length,pendingPlayers:players.filter((player)=>player.status==="pending").length});
    }catch{
      setStats({totalPlayers:"—",totalTeams:"—",pendingPlayers:"—"});
    }
  })();
},[session]);

const logout=async()=>{
  setShowLogoutConfirm(false);
  await fetch("/api/admin/logout",{method:"POST"});
  setSession(null);
  setActiveSection("Dashboard");
};

if(session===undefined) return <div className="grid min-h-screen place-items-center bg-[#02121f] text-sm text-[#9faab2]">Loading admin panel...</div>;
if(session===null) return <AdminLoginForm onSuccess={setSession}/>;

const initials=session.email.slice(0,2).toUpperCase();
return <div className="min-h-screen bg-[#02121f] text-[#edf2f4]">
  <aside className="fixed inset-y-0 left-0 hidden w-[240px] border-r border-white/15 bg-[#031725] p-3 lg:flex lg:flex-col">
    <div className="mb-7 border-b border-dashed border-white/50 p-3 text-center font-bold">✉ &nbsp; EPL LOGO</div>
    <nav className="space-y-1">{menu.map(({label,icon:Icon})=><a className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${label===activeSection?"bg-[#956a26] text-white":"text-[#d1dade] hover:bg-white/10"}`} href="#dashboard" onClick={(event)=>{event.preventDefault();setActiveSection(label);}} key={label}><Icon/>{label}</a>)}</nav>
    <div className="mt-auto space-y-1 border-t border-white/15 pt-3">
      <p className="px-3 pb-1 text-[10px] font-bold uppercase text-[#7d8993]">Account</p>
      {accountMenu.map(({label,icon:Icon})=><a className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${label===activeSection?"bg-[#956a26] text-white":"text-[#d1dade] hover:bg-white/10"}`} href="#dashboard" onClick={(event)=>{event.preventDefault();setActiveSection(label);}} key={label}><Icon/>{label}</a>)}
      <a className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[#d1dade] hover:bg-white/10" href="#dashboard" onClick={(event)=>{event.preventDefault();setShowLogoutConfirm(true);}}><FaArrowRightFromBracket/>Logout</a>
    </div>
  </aside>
  <main className="flex min-h-screen flex-col lg:ml-[240px]">
    <header className="flex h-[77px] shrink-0 items-center justify-between border-b border-white/15 px-5">
      <div><h1 className="text-2xl font-bold">EPL Admin Panel</h1><p className="text-xs text-[#d4a84f]">ESDM Premier League</p></div>
      <div className="flex items-center gap-4"><FaBell className="text-xl"/><div className="hidden text-right text-sm sm:block"><b>{session.email}</b><small className="block text-[#d4a84f] capitalize">{session.role==="superadmin"?"Super Admin":"Admin"}</small></div><i className="grid size-10 place-items-center rounded-full bg-[#b68d5a] text-[#091720]">{initials}</i></div>
    </header>
    <div id="dashboard" className="mx-auto w-full max-w-[1460px] flex-1 p-4">
      {activeSection==="Players"?<AdminPlayersView/>
        :activeSection==="Teams"?<AdminTeamsView/>
        :activeSection==="Player Registration Rules"?<AdminRegistrationRulesView/>
        :activeSection==="Team Keys"?<AdminTeamKeysView/>
        :activeSection==="Change Password"?<AdminChangePasswordView/>
        :activeSection==="Add Admin"?<AdminAddAdminView/>
        :<div className="grid gap-3 md:grid-cols-3">
          <Stat icon={FaUserCheck} label="Total Players" value={stats.totalPlayers} color="bg-[#76511d] text-[#e4bf72]"/>
          <Stat icon={FaShieldHalved} label="Total Teams" value={stats.totalTeams} color="bg-[#103e68] text-[#4aa7ff]"/>
          <Stat icon={FaCalendarCheck} label="Pending Players" value={stats.pendingPlayers} color="bg-[#6b4a10] text-[#ffbf24]"/>
        </div>}
    </div>
    <footer className="mt-5 flex shrink-0 justify-between border-t border-white/15 px-5 py-4 text-xs text-[#ccd4d8]"><span className="text-[#d4a84f]">● System Status: All Systems Operational</span><span>© 2025 EPL - ESDM Premier League.</span><span>Contact Support</span></footer>
  </main>
  {showLogoutConfirm && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
    <div className="w-full max-w-[360px] rounded-lg border border-white/15 bg-[#031827] p-5 text-center shadow-2xl">
      <i className="mx-auto grid size-12 place-items-center rounded-full bg-[#7a1f1f] text-xl not-italic text-[#ff9d9d]"><FaArrowRightFromBracket/></i>
      <h2 className="mt-4 text-base font-bold">Log out of admin panel?</h2>
      <p className="mt-1 text-xs text-[#9faab2]">You will need to sign in again to access the admin panel.</p>
      <div className="mt-5 flex gap-3">
        <button className="flex-1 rounded-md border border-white/25 px-4 py-2.5 text-sm font-bold hover:bg-white/10" type="button" onClick={()=>setShowLogoutConfirm(false)}>Cancel</button>
        <button className="flex-1 rounded-md bg-[#c0392b] px-4 py-2.5 text-sm font-bold hover:brightness-110" type="button" onClick={logout}>Logout</button>
      </div>
    </div>
  </div>}
</div>;
};
export default AdminDashboard;
