"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up"
}: RevealProps) {
  const getInitial = () => {
    switch (direction) {
      case "up": return { opacity: 0, y: 25 };
      case "down": return { opacity: 0, y: -25 };
      case "left": return { opacity: 0, x: 30 };
      case "right": return { opacity: 0, x: -30 };
      case "none": return { opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.7, 
        delay: delay, 
        ease: [0.21, 0.87, 0.12, 1.0] // Very smooth snappy ease
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
