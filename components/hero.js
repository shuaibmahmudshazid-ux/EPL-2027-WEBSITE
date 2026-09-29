import Image from "next/image";
import RegistrationCard from "./registration-card";
import CountdownCard from "./countdown-card";
const container =
  "mx-auto w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]";
const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-[760px] overflow-hidden text-white pt-[90px] sm:pt-[110px] pb-12 flex items-center"
    >
      {/* Stadium Background */}
      <Image
        className="hidden object-cover object-right-top min-[781px]:block"
        src="/cricket-stadium-desktop-v2.png"
        alt="Cricket equipment in a floodlit stadium"
        fill
        priority
        sizes="100vw"
      />
      <Image
        className="object-cover object-center min-[781px]:hidden"
        src="/cricket-stadium-mobile.png"
        alt="Cricket equipment in a floodlit stadium"
        fill
        priority
        sizes="100vw"
      />

      {/* Atmospheric CricAuction Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#030d17]/98 via-[#061828]/90 to-[#071d30]/60 max-[780px]:bg-gradient-to-b max-[780px]:from-[#030d17]/98 max-[780px]:via-[#051625]/92 max-[780px]:to-[#020b13]/85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(212,168,79,0.12),transparent_40%)] pointer-events-none" />

      <div className={`${container} relative z-10 w-full py-6`}>
        <div className="max-w-[780px]">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 mb-4 shadow-lg backdrop-blur-md">
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="m-0 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#f5c66b]">
              The Ultimate Cricket Showdown of the <span className="text-white">ESDM Faculty!</span>
            </p>
          </div>

          {/* Main Hero Headline */}
          <h1 className="m-0 text-4xl sm:text-6xl min-[1100px]:text-7xl font-black leading-[1.05] tracking-tight [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]">
            EPL <span className="font-light text-[#d4a84f]">—</span> ESDM
          </h1>
          <h2 className="mt-1 text-2xl sm:text-4xl min-[1100px]:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#f7d58b] via-[#e5b85a] to-[#d4a84f] [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]">
            PREMIER LEAGUE
          </h2>

          {/* Organizer Brand */}
          <div className="mt-3 flex items-center gap-3 text-base sm:text-xl font-medium text-slate-200">
            <span>Organized by</span>
            <Image
              className="h-9 sm:h-12 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
              src="/addyanta-14-logo.png"
              alt="Addyanta-14"
              width={770}
              height={429}
            />
          </div>

          <div className="my-5 h-0.5 w-48 bg-gradient-to-r from-[#d4a84f] via-[#ef4444] to-transparent rounded-full" />

          {/* Registration Action Cards */}
          <div
            id="registration"
            className="flex flex-col sm:flex-row gap-4 w-full"
          >
            <RegistrationCard
              href="/player-registration"
              title={
                <>
                  PLAYER REGISTRATION
                </>
              }
            >
              Register as an individual player and get drafted into an auction tier.
            </RegistrationCard>

            <RegistrationCard
              team
              href="/team-registration"
              title={
                <>
                  TEAM REGISTRATION
                </>
              }
            >
              Register your team with your unique team key and compete for the trophy.
            </RegistrationCard>
          </div>

          {/* Countdown Clock */}
          <CountdownCard className="mt-6 w-[520px] max-w-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
