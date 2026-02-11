"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChatCircleDotsIcon,
  GithubLogoIcon,
  LightbulbIcon,
  PackageIcon,
  SyringeIcon,
  UserGearIcon,
  UserIcon,
  ArrowRightIcon,
  CodesandboxLogoIcon,
} from "@phosphor-icons/react";
import Image from "next/image";

export default function Main() {
  const router = useRouter();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 5 },
    show: { opacity: 1, y: 0 },
  };

  const menuItems = [
    {
      label: "Ingest",
      path: "/ingest",
      icon: SyringeIcon,
      desc: "Add Context",
      tooltip: "Add Context",
    },
    {
      label: "Conversations",
      path: "/conversations",
      icon: ChatCircleDotsIcon,
      desc: "Talk to AI",
      tooltip: "Talk to Basal",
    },
    {
      label: "Services",
      path: "/services",
      icon: PackageIcon,
      desc: "View Core",
      tooltip: "View features",
    },
    {
      label: "Profile",
      path: "/profile",
      icon: UserIcon,
      desc: "Settings",
      tooltip: "User Profile",
    },
    {
      label: "Developers",
      path: "/developers",
      icon: UserGearIcon,
      desc: "Creators",
      tooltip: "Meet Team",
    },
    {
      label: "Feedback",
      path: "/feedback",
      icon: LightbulbIcon,
      desc: "Support",
      tooltip: "Send Ideas",
    },
    {
      label: "Codebase",
      path: "https://github.com/drjayaswal/basal-docker.git/fork",
      icon: CodesandboxLogoIcon,
      desc: "Code",
      tooltip: "Fork Project",
      external: true,
    },
    {
      label: "Contribution",
      path: "https://github.com/drjayaswal/basal-docker.git",
      icon: GithubLogoIcon,
      external: true,
      desc: "Open Source",
      tooltip: "Contribute",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 font-mono selection:bg-fuchsia-600 selection:text-white">
      <section className="relative z-10 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          className="mb-8 space-y-2"
        >
          <div className="flex items-center text-fuchsia-600 mb-1">
            <Image
              src="/logo.png"
              alt="logo"
              width={60}
              height={60}
              className="-mr-2"
            />
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
              Basal<span className="text-fuchsia-600">™</span>
            </h1>
          </div>
          <p className="text-white/40 text-xs md:text-sm max-w-md leading-relaxed uppercase tracking-tight">
            An intelligent architecture for document parsing,
            <br />
            machine learning integration,
            <br /> and real-time dashboarding.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-white/10"
        >
          {menuItems.map((menu) => (
            <motion.div
              key={menu.label}
              variants={item}
              className="group group/tooltip relative border-r border-b border-white/10 bg-black hover:bg-white/5 transition-colors"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  menu.external
                    ? window.open(menu.path, "_blank")
                    : router.push(menu.path);
                }}
                className="w-full p-4 border-b-2 border-transparent hover:border-fuchsia-600 flex flex-col items-start text-left gap-4 cursor-pointer"
              >
                <div className="p-2 bg-white/5 group-hover:rounded-4xl text-white/70 group-hover:text-fuchsia-500 group-hover:bg-fuchsia-500/10 transition-all duration-300">
                  <menu.icon size={24} weight="duotone" />
                </div>

                <div>
                  <h3 className="text-white font-bold uppercase text-sm tracking-widest group-hover:translate-x-1 transition-transform">
                    {menu.label}
                  </h3>
                  <p className="text-[10px] text-white/30 uppercase mt-1 tracking-tighter">
                    {menu.desc}
                  </p>
                </div>

                <ArrowRightIcon
                  className="absolute bottom-4 right-4 text-transparent group-hover:text-white transition-colors"
                  size={14}
                />
              </button>

              {/* Tooltip Injection */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 hidden md:block">
                <div className="bg-white text-black text-[10px] font-bold uppercase tracking-wider py-1 px-3 whitespace-nowrap shadow-xl border border-white/20 relative">
                  {menu.tooltip}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
