"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center text-slate-900 selection:bg-indigo-100">

      <section className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl text-end md:text-7xl font-bold tracking-tight mb-6">
            Compare==pa||erns<br />
            <span className="flex items-center gap-2 text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-sky-500">
              <Trash2 className='text-rose-500 scale-200'/> Remove ~Bias
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your datasets to our ML engine. We analyze linguistic nuances 
            and generate <span className="text-slate-900 font-extrabold italic underline">neutrality reports</span>{" "}
            to ensure your data is fair and balanced
          </p>

          <div className="flex justify-center">
            <motion.button
              onClick={() => router.push("/services")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 1.1 }}
              className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 cursor-pointer rounded-3xl font-bold transition-all hover:bg-indigo-600 shadow-xl shadow-slate-200"
            >
              Access Services
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}