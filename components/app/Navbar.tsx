"use client";

import { Cog } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  return (
    <nav className="fixed w-full z-10 border-b border-white bg-black px-8 py-3 flex justify-between items-center shadow-xs">
      <div className="flex items-center gap-2 font-black text-2xl text-dark">
        <Image
          className="p-0 m-0 cursor-pointer"
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
        className="rounded-full p-2 hover:rotate-90 transition-all bg-transparent shadow-none text-white hover:text- hover:bg-indigo-500 cursor-pointer"
      >
        <Cog size={30} />
      </button>
    </nav>
  );
};

export default Navbar;
