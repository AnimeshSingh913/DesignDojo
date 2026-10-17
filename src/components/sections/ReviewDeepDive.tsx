"use client";

import React, { useEffect, useRef } from "react";
import { Reveal } from "../ui/Reveal";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      animate(count, value, { duration: 1.5, ease: [0.21, 0.87, 0.12, 1.0] });
    }
  }, [count, isInView, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function ReviewDeepDive() {
  return (
    <section id="practice" className="scroll-mt-28 py-[60px] bg-primary-ink/5">
      <div className="w-full max-w-7xl mx-auto px-8">
        <div className="max-w-[640px] mb-[64px] mx-auto text-center">
          <Reveal delay={0.1}>
            <span className="inline-flex items-center gap-2 font-code text-[12.5px] font-medium tracking-[0.08em] uppercase text-primary bg-accent px-[14px] py-[7px] pl-[10px] rounded-full mb-[18px]">
              <span className="w-1.5 h-1.5 rounded-full bg-warn shrink-0"></span>AI ARCHITECTURE REVIEW
            </span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="text-[clamp(28px,3.6vw,40px)] font-extrabold mb-4 font-heading text-primary tracking-[-0.02em] leading-[1.1]">Every design gets a second opinion</h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-[17px] opacity-80 text-primary">
              DesignDojo doesn&apos;t just render your diagram — it interrogates it. Scalability, resilience,
              and cost, scored and explained in plain language.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.4} className="bg-surface rounded-[28px] border border-primary/10 shadow-lift p-[48px] grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          <div>
            <span className="block font-code text-[13px] text-primary opacity-60 uppercase tracking-[0.05em] mb-6">{`// review summary — checkout-service.hld`}</span>
            <div className="flex items-center gap-8 mb-10">
              <div className="relative w-[96px] h-[96px]">
                <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90 origin-center">
                  <circle cx="48" cy="48" r="42" stroke="#CDC2AE" strokeWidth="9" fill="none" />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="#354259"
                    strokeWidth="9"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="264"
                    initial={{ strokeDashoffset: 264 }}
                    whileInView={{ strokeDashoffset: 46 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 1.5, ease: [0.21, 0.87, 0.12, 1.0], delay: 0.4 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-heading font-extrabold text-[28px] text-primary">
                  <AnimatedNumber value={87} />
                </div>
              </div>
              <div>
                <h4 className="text-[20px] font-extrabold mb-1.5 font-heading text-primary tracking-[-0.02em] leading-[1.1]">Strong, with one risk</h4>
                <p className="text-[15px] opacity-75">
                  Solid separation of concerns. One unmitigated failure point drags the score down.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-[22px] rounded-2xl bg-warn/10 border border-warn/20 mb-4">
              <div className="w-[30px] h-[30px] rounded-full bg-warn text-surface flex items-center justify-center font-bold text-[16px] shrink-0 font-code">!</div>
              <div>
                <strong className="block text-[15.5px] font-semibold mb-1 text-primary">Single point of failure</strong>
                <span className="text-[14.5px] opacity-80 leading-relaxed block">
                  Your primary database has no replica — a crash takes the whole write path down.
                </span>
              </div>
            </div>
            <div className="flex gap-4 p-[22px] rounded-2xl bg-accent-deep/10 border border-accent-deep/20 mb-4">
              <div className="w-[30px] h-[30px] rounded-full bg-accent-deep text-surface flex items-center justify-center font-bold text-[16px] shrink-0 font-code">+</div>
              <div>
                <strong className="block text-[15.5px] font-semibold mb-1 text-primary">Add a caching layer</strong>
                <span className="text-[14.5px] opacity-80 leading-relaxed block">Read traffic on the product catalog is 40x write traffic — cache it.</span>
              </div>
            </div>
            <div className="flex gap-4 p-[22px] rounded-2xl bg-accent-deep/10 border border-accent-deep/20 mb-4">
              <div className="w-[30px] h-[30px] rounded-full bg-accent-deep text-surface flex items-center justify-center font-bold text-[16px] shrink-0 font-code">+</div>
              <div>
                <strong className="block text-[15.5px] font-semibold mb-1 text-primary">Rate-limit the public API</strong>
                <span className="text-[14.5px] opacity-80 leading-relaxed block">Nothing currently protects checkout from a traffic spike or abuse.</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 lg:border-l lg:border-primary/10 lg:pl-12">
            <h4 className="text-[18px] font-extrabold mb-8 font-heading text-primary tracking-[-0.02em] leading-[1.1]">Simulated load</h4>
            
            <div className="mb-6">
              <div className="flex justify-between text-[13.5px] font-medium opacity-85 mb-2">
                <span>Scalability</span>
                <span className="flex"><AnimatedNumber value={82} />%</span>
              </div>
              <div className="h-[6px] bg-[#CDC2AE] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "82%" }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1.5, ease: [0.21, 0.87, 0.12, 1.0], delay: 0.5 }}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-[13.5px] font-medium opacity-85 mb-2">
                <span>Fault tolerance</span>
                <span className="flex"><AnimatedNumber value={58} />%</span>
              </div>
              <div className="h-[6px] bg-[#CDC2AE] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-warn rounded-full"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "58%" }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1.5, ease: [0.21, 0.87, 0.12, 1.0], delay: 0.6 }}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-[13.5px] font-medium opacity-85 mb-2">
                <span>Cost efficiency</span>
                <span className="flex"><AnimatedNumber value={91} />%</span>
              </div>
              <div className="h-[6px] bg-[#CDC2AE] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "91%" }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1.5, ease: [0.21, 0.87, 0.12, 1.0], delay: 0.7 }}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-[13.5px] font-medium opacity-85 mb-2">
                <span>Latency under load</span>
                <span className="flex"><AnimatedNumber value={75} />%</span>
              </div>
              <div className="h-[6px] bg-[#CDC2AE] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "75%" }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1.5, ease: [0.21, 0.87, 0.12, 1.0], delay: 0.8 }}
                />
              </div>
            </div>
            
          </div>
        </Reveal>
      </div>
    </section>
  );
}
