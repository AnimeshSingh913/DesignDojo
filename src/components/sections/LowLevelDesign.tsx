import React from "react";
import { Reveal } from "../ui/Reveal";

export function LowLevelDesign() {
  return (
    <section id="design" className="scroll-mt-28">
      <div className="w-full max-w-7xl mx-auto px-8">
        <div className="my-[40px] grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 font-code text-[12.5px] font-medium tracking-[0.08em] uppercase text-primary bg-accent px-[14px] py-[7px] pl-[10px] rounded-full mb-[18px]">
              <span className="w-1.5 h-1.5 rounded-full bg-warn shrink-0"></span>LOW-LEVEL DESIGN
            </span>
            <h2 className="text-[32px] my-[18px] mb-[14px] font-extrabold font-heading text-primary tracking-[-0.02em] leading-[1.1]">
              Good architecture <br />
              still needs good classes
            </h2>
            <p className="opacity-75 text-[16px] max-w-[440px] mb-[22px]">
              DesignDojo reviews your class, sequence, and state diagrams against SOLID principles
              and flags where a design pattern would clean things up.
            </p>
            <div className="flex gap-2.5 mb-6 cursor-default">
              <div className="group relative w-[38px] h-[38px] rounded-[10px] bg-primary border border-primary flex items-center justify-center font-heading font-extrabold text-[16px] text-surface transition-all duration-250 hover:-translate-y-1.5 hover:shadow-soft hover:scale-105 z-20">
                S
                <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 bg-primary text-surface text-[12px] px-3 py-1.5 rounded-lg shadow-lift pointer-events-none whitespace-nowrap -translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10">Single Responsibility</div>
              </div>
              <div className="group relative w-[38px] h-[38px] rounded-[10px] bg-surface border border-primary/15 flex items-center justify-center font-heading font-extrabold text-[16px] text-primary transition-all duration-250 hover:-translate-y-1.5 hover:shadow-soft hover:scale-105 hover:border-primary/40 hover:bg-white z-20">
                O
                <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 bg-primary text-surface text-[12px] px-3 py-1.5 rounded-lg shadow-lift pointer-events-none whitespace-nowrap -translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10">Open-Closed</div>
              </div>
              <div className="group relative w-[38px] h-[38px] rounded-[10px] bg-surface border border-primary/15 flex items-center justify-center font-heading font-extrabold text-[16px] text-primary transition-all duration-250 hover:-translate-y-1.5 hover:shadow-soft hover:scale-105 hover:border-primary/40 hover:bg-white z-20">
                L
                <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 bg-primary text-surface text-[12px] px-3 py-1.5 rounded-lg shadow-lift pointer-events-none whitespace-nowrap -translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10">Liskov Substitution</div>
              </div>
              <div className="group relative w-[38px] h-[38px] rounded-[10px] bg-surface border border-primary/15 flex items-center justify-center font-heading font-extrabold text-[16px] text-primary transition-all duration-250 hover:-translate-y-1.5 hover:shadow-soft hover:scale-105 hover:border-primary/40 hover:bg-white z-20">
                I
                <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 bg-primary text-surface text-[12px] px-3 py-1.5 rounded-lg shadow-lift pointer-events-none whitespace-nowrap -translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10">Interface Segregation</div>
              </div>
              <div className="group relative w-[38px] h-[38px] rounded-[10px] bg-surface border border-primary/15 flex items-center justify-center font-heading font-extrabold text-[16px] text-primary transition-all duration-250 hover:-translate-y-1.5 hover:shadow-soft hover:scale-105 hover:border-primary/40 hover:bg-white z-20">
                D
                <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 bg-primary text-surface text-[12px] px-3 py-1.5 rounded-lg shadow-lift pointer-events-none whitespace-nowrap -translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10">Dependency Inversion</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 bg-[#C2DED1]/30 text-primary px-4 py-2 rounded-[10px] text-[14px] font-medium transition-all duration-250 hover:-translate-y-1 hover:shadow-soft hover:bg-[#C2DED1]/50 cursor-default">✦ Suggested: Strategy Pattern for PaymentStrategy</span>
          </Reveal>
          <Reveal className="bg-bg border border-primary/10 rounded-[16px] py-4 px-8 flex items-center justify-center">
            <svg viewBox="0 0 380 240" className="w-full">
              <g filter="url(#sketchy)">
                <path className="flow-line" d="M100,120 L280,120" strokeDasharray="5,5" />
                <path className="flow-line" d="M190,85 L190,120" strokeDasharray="5,5" />
                <path className="flow-line" d="M100,120 L100,160" strokeDasharray="5,5" />
                <path className="flow-line" d="M280,120 L280,160" strokeDasharray="5,5" />

                <rect className="node-box" x="110" y="30" width="160" height="55" rx="8" />
                <text className="node-label text-[12px]" x="133" y="52">«interface»</text>
                <text className="node-label text-[14px] font-bold" x="133" y="72">PaymentStrategy</text>
                
                <rect className="node-box accented" x="30" y="160" width="140" height="50" rx="8" />
                <text className="node-label text-[14px]" x="45" y="180">CardPayment</text>
                <text className="node-label text-[14px]" x="45" y="198">+ pay(amount)</text>

                <rect className="node-box accented" x="210" y="160" width="140" height="50" rx="8" />
                <text className="node-label text-[14px]" x="225" y="180">UPIPayment</text>
                <text className="node-label text-[14px]" x="225" y="198">+ pay(amount)</text>
              </g>
            </svg>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
