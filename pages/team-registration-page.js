import Image from "next/image";
import Link from "next/link";
import { FaShieldHalved } from "react-icons/fa6";
import SiteNavbar from "../components/site-navbar";
import TeamRegistrationForm from "../components/team-registration-form";
import SiteFooter from "../components/site-footer";

const container =
  "mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]";

export default function TeamRegistrationPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1D] text-white relative overflow-hidden">
      <SiteNavbar />

      <section className="relative py-12 sm:py-16">
        {/* Stadium Background under dark overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            className="object-cover object-center opacity-30"
            src="/cricket-stadium-desktop-v2.png"
            alt="Cricket stadium"
            fill
            priority
          />
        </div>

        {/* Ambient mesh lighting */}
        <div className="absolute top-10 right-1/4 size-96 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 size-96 rounded-full bg-sky-500/10 blur-[130px] pointer-events-none" />

        <div className={`${container} relative z-10`}>
          <div className="max-w-[860px] mx-auto">
            <TeamRegistrationForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
