"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FaCircleCheck } from "react-icons/fa6";

const container = "mx-auto w-[min(1560px,calc(100%-36px))] min-[781px]:w-[min(1560px,calc(100%-64px))]";

const RegistrationSuccessPage = () => {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const playerId = searchParams.get("playerId");

  return (
    <main className="grid min-h-dvh place-items-center bg-[#021522] px-4 py-16 text-white">
      <div className={container}>
        <div className="mx-auto grid max-w-[560px] place-items-center rounded-2xl border border-[#c6ae8c]/70 bg-[#021827e8] p-8 text-center shadow-2xl backdrop-blur-md min-[680px]:p-12">
          <i className="grid size-20 place-items-center rounded-full bg-[#c7963b] text-5xl not-italic">
            <FaCircleCheck />
          </i>
          <h1 className="mt-6 font-sans font-bold text-[34px] leading-none tracking-wide min-[680px]:text-[44px]">
            REGISTRATION <span className="text-[#d4a84f]">SUCCESSFUL</span>
          </h1>
          <p className="mt-4 text-sm min-[680px]:text-base">
            {name ? <>Thank you, <b className="text-[#d4a84f]">{name}</b>.</> : "Thank you."} Your player registration has been received.
          </p>
          {playerId && (
            <p className="mt-4 rounded-lg border border-[#d4a84f]/70 bg-[#031320]/80 px-6 py-3 text-sm">
              Student ID: <b className="text-[#a9d639]">{playerId}</b>
            </p>
          )}
          <p className="mt-4 text-xs text-[#c5ccd1]">
            {name ? "A confirmation email has been sent if you provided one." : ""} Our team will review your registration and notify you of the result.
          </p>
          <Link className="mt-8 rounded-lg bg-[linear-gradient(135deg,#d0a048,#a97828)] px-8 py-4 text-sm font-bold" href="/">
            BACK TO HOME
          </Link>
        </div>
      </div>
    </main>
  );
};

export default RegistrationSuccessPage;
