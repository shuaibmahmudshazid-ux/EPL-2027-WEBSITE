import SiteNavbar from "../components/site-navbar";
import Hero from "../components/hero";
import TournamentInfo from "../components/tournament-info";
import SiteFooter from "../components/site-footer";

export default function HomePage() {
  return (
    <main className="overflow-x-hidden bg-[#0A0F1D] text-white min-h-screen min-h-[100dvh] w-full max-w-[100vw]">
      <SiteNavbar />
      <Hero />
      <TournamentInfo />
      <SiteFooter />
    </main>
  );
}
