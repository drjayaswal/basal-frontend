"use client";
import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  return (
    <nav className="fixed w-full z-10 border-b border-slate-100 bg-white px-8 py-3 flex justify-between items-center shadow-xs">
      <div className="flex items-center gap-2 font-black text-2xl text-dark">
        <Image
          className="p-0 m-0 cursor-pointer"
          src="/bias-breaker-logo.png"
          alt="bias-breaker-logo"
          onClick={()=>{router.push("/")}}
          width={40}
          height={40}
          quality={100}
        />
      </div>
      <Button
        onClick={() => router.push("/settings")}
        variant={"brand"}
        className="scale-150 hover:rotate-90 transition-all bg-transparent shadow-none text-slate-400 hover:text-main cursor-pointer"
      >
        <Cog size={50} />
      </Button>
    </nav>
  );
};

export default Navbar;
