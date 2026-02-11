import { navLinks } from "@/lib/const";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full z-10 bg-black backdrop-blur-md border-t border-white/13 fixed bottom-0 left-0 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 md:px-8">
        <div className="flex flex-col gap-y-3 md:flex-row md:justify-between md:items-center">
          <nav className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-1">
            <Image src="/logo.png" alt="logo" width={30} height={30} />
            {navLinks.map((link, index) => (
              <div
                key={index}
                className={`relative group/tooltip flex items-center ${link.isGrouped ? "-mr-px" : ""}`}
              >
                <Link
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`
        text-[9px] p-2 md:text-[10px] ${link.color} text-white transition-colors uppercase tracking-tighter whitespace-nowrap border border-transparent
        ${link.isGrouped ? "border-white/10 hover:border-transparent bg-white/5" : ""}
        ${link.position === "start" ? "rounded-l-xl -mr-4.5" : ""}
        ${link.position === "end" ? "rounded-r-xl -ml-4.5" : ""}
      `}
                >
                  {link.name}
                </Link>

                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 hidden md:block">
                  <div className="bg-white text-black text-[10px] font-bold uppercase tracking-wider py-1 px-3 whitespace-nowrap shadow-xl border border-white/20 relative">
                    {link.tooltip}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-white" />
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
