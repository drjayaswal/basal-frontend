"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CircleNotchIcon } from "@phosphor-icons/react";

const Loading = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-9999 bg-black flex flex-col items-center justify-center">
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', 
          backgroundSize: '30px 30px' 
        }} 
      />

      <div className="relative flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <CircleNotchIcon className="w-8 h-8 text-white animate-spin" strokeWidth={1.5} />
        </motion.div>
      </div>
    </div>
  );
}
export default Loading