"use client";

import { Cog } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  return (
    <nav className="fixed w-full z-20 px-8 py-[12.5px] flex justify-between bg-black border-b border-white/13 items-center shadow-xs">
      <div className="flex items-center gap-2 font-black text-2xl text-dark">
        <Image
          className="cursor-pointer hover:invert-100 rounded-full transition-all duration-500"
          src="/logo.png"
          alt="logo"
          onClick={()=>{router.push("/")}}
          width={40}
          height={40}
          quality={100}
        />
      </div>
      <button
        onClick={() => router.push("/settings")}
        className="p-2 hover:rotate-90 transition-all bg-transparent shadow-none text-white cursor-pointer"
      >
        <Cog size={30} />
      </button>
    </nav>
  );
};

export default Navbar;
