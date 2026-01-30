"use client";

import { ArrowRight, Cog, UserCog2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="relative flex items-center justify-center text-white selection:bg-indigo-100 overflow-hidden">
      <section className="flex items-center border border-white/30 relative z-10 max-w-4xl mx-auto text-center">
        <button
          onClick={() => router.push("/services")}
          className="flex items-center gap-3 bg-black text-white px-8 py-4 cursor-pointer duration-500 font-bold transition-all hover:bg-indigo-500 group/btn"
        >
          Access Services
          <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
                <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-3 bg-black text-white px-8 py-4 cursor-pointer duration-500 font-bold transition-all hover:bg-indigo-500 group/btn"
        >
          Settings
          <Cog className="w-5 h-5 group-hover/btn:rotate-90 transition-transform"/>
        </button>
                <button
          onClick={() => router.push("/developers")}
          className="flex items-center gap-3 bg-black text-white px-8 py-4 cursor-pointer duration-500 font-bold transition-all hover:bg-indigo-500 group/btn"
        >
          Developers
          <UserCog2 className="w-5 h-5" />
        </button>
      </section>
    </div>
  );
}
