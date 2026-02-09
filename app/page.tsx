"use client";

import {
  UserCog2,
  FilePen,
  User2,
  Binary,
  MessageCircle,
  Wrench,
  FileCheck,
  Github,
  Command,
  Box,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/animated-button";
import { motion } from "framer-motion";

export default function Main() {
  const router = useRouter();

  // Animation variants for the container
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  const menuItems = [
    { label: "Services", path: "/services", icon: Wrench },
    { label: "Profile", path: "/profile", icon: User2 },
    { label: "Developers", path: "/developers", icon: UserCog2 },
    { label: "Feedback", path: "/feedback", icon: FilePen },
    { label: "Ingest", path: "/ingest", icon: Binary },
    { label: "Resolve", path: "/feedbacks", icon: FileCheck },
    { label: "Conversations", path: "/conversations", icon: MessageCircle },
    { 
        label: "Contribution", 
        path: "https://github.com/drjayaswal/basal-docker.git", 
        icon: Github, 
        external: true 
    },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-mono selection:bg-pink-500 selection:text-white">
      <section className="relative z-10 w-full max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <div className="flex items-center gap-3">
            <Box className="text-pink-600" size={32} />
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-[0.3em] text-white">
              Basal™
            </h1>
          </div>
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 overflow-hidden border border-white/15 mt-5"
        >
          {menuItems.map((menu) => (
            <motion.div key={menu.label} variants={item} className="bg-black">
              <AnimatedButton
                label={menu.label}
                onClick={() => 
                  menu.external 
                    ? window.open(menu.path, "_blank") 
                    : router.push(menu.path)
                }
                Icon={menu.icon}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}