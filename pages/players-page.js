"use client";

import SiteNavbar from "../components/site-navbar";
import PlayerShowcaseSection from "../components/player-showcase-section";
import SiteFooter from "../components/site-footer";

export default function PlayersPage() {
  return (
    <main className="overflow-x-hidden bg-[#0A0F1D] text-white min-h-screen min-h-[100dvh] w-full max-w-[100vw]">
      <SiteNavbar />
      <PlayerShowcaseSection initiallyExpanded={true} />
      <SiteFooter />
    </main>
  );
}
