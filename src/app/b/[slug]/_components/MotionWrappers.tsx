"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

/**
 * Wrapper para animação do Logo na entrada
 */
export function AnimatedLogo({ children }: { children: ReactNode }) {
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="w-24 h-24 mx-auto mb-8 rounded-3xl border-2 border-primary/30 p-1 bg-black/50 overflow-hidden backdrop-blur-md shadow-[0_0_50px_rgba(212,175,55,0.2)]"
    >
      {children}
    </motion.div>
  );
}

/**
 * Wrapper para os cards de profissionais com efeito Hover
 */
export function AnimatedBarberCard({ children }: { children: ReactNode }) {
  return (
    <motion.div 
      whileHover={{ y: -5, borderColor: "rgba(212,175,55,0.5)" }}
      transition={{ type: "spring", stiffness: 300 }}
      className="min-w-[220px] bg-[#070707] border border-[#1a1a1a] p-5 rounded-[2rem] flex flex-col items-center snap-center transition-all group shadow-xl"
    >
      {children}
    </motion.div>
  );
}
