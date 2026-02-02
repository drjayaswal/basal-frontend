"use client";

import { ArrowRight, Cog, UserCog2, Binary, ShieldCheck, Cpu, Fingerprint, VectorSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/animated-button";
import { motion } from "framer-motion";

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-white font-mono">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} 
      />
      <section className="relative z-10 max-w-5xl mx-auto text-center px-6 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-black tracking-tighter mb-10 leading-[0.9]"
        >
          DECOUPLED <span className="text-indigo-600">ANALYSIS</span> <br /> 
          UNBIASED <span className="text-teal-600">INTELLIGENCE</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto text-sm md:text-md text-white/40 leading-relaxed mb-20 font-sans"
        >
          Our neural engine handles complex vector embeddings and semantic parsing as 
          background tasks<br/> Upload your datasets and let the backend bridge the gap between 
          talent and requirements while you manage the workflow.
        </motion.p>
        <div className="flex flex-wrap items-center justify-center bg-black w-fit mx-auto py-[6.9px]">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <AnimatedButton
              label="Services" 
              onClick={() => router.push("/services")} 
              Icon={ArrowRight} 
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <AnimatedButton 
              label="Settings" 
              onClick={() => router.push("/settings")} 
              Icon={Cog} 
              rotateIcon 
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <AnimatedButton 
              label="Developers" 
              onClick={() => router.push("/developers")} 
              Icon={UserCog2} 
            />
          </motion.div>
        </div>

        <div className="mt-22 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-10">
          <div className="flex flex-col items-center space-y-2">
            <VectorSquare className="w-5 h-5 text-indigo-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/90">Vectorized Semantics</h4>
            <p className="text-[9px] text-white/60 px-4 italic">Processing contextual metadata through high-dimensional space</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Cpu className="w-5 h-5 text-emerald-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/90">Async Processing</h4>
            <p className="text-[9px] text-white/60 px-4 italic">Heavy NLP tasks are offloaded to background workers for zero-latency UI</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Binary className="w-5 h-5 text-fuchsia-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/90">Automated Scoring</h4>
            <p className="text-[9px] text-white/60 px-4 italic">Standardized matching algorithms remove human variability from the funnel</p>
          </div>
        </div>
      </section>
    </div>
  );
}