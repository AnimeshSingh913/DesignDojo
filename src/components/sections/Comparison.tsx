import React from "react";
import { Reveal } from "../ui/Reveal";

export function Comparison() {
  return (
    <section className="py-[60px]">
      <div className="w-full max-w-7xl mx-auto px-8">
        <div className="max-w-[640px] mb-[64px]">
          <Reveal delay={0.1}>
            <span className="inline-flex items-center gap-2 font-code text-[12.5px] font-medium tracking-[0.08em] uppercase text-primary bg-accent px-[14px] py-[7px] pl-[10px] rounded-full mb-[18px]">
              <span className="w-1.5 h-1.5 rounded-full bg-warn shrink-0"></span>THE PROBLEM
            </span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="text-[clamp(28px,3.6vw,40px)] font-extrabold mb-4 font-heading text-primary tracking-[-0.02em] leading-[1.1]">Most people memorize architectures. Almost no one is taught to design them.</h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-[17px] opacity-80 text-primary">
              System design courses hand you finished diagrams. DesignDojo hands you the reasoning —
              then lets you prove it under pressure.
            </p>
          </Reveal>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Reveal direction="left" delay={0.3} className="p-[40px] rounded-[24px] bg-[#CDC2AE]/50 border border-primary/10">
            <h3 className="text-[22px] font-extrabold mb-6 font-heading text-primary tracking-[-0.02em] leading-[1.1]">The old way</h3>
            <ul className="flex flex-col gap-4 list-none">
              <li className="flex gap-3 text-[15px] opacity-85">
                <span className="font-extrabold font-heading -mt-[2px] text-warn">×</span>Watching hour-long diagram walkthroughs
              </li>
              <li className="flex gap-3 text-[15px] opacity-85">
                <span className="font-extrabold font-heading -mt-[2px] text-warn">×</span>Copying reference architectures you don&apos;t fully understand
              </li>
              <li className="flex gap-3 text-[15px] opacity-85">
                <span className="font-extrabold font-heading -mt-[2px] text-warn">×</span>Guessing what the interviewer wants to hear
              </li>
              <li className="flex gap-3 text-[15px] opacity-85">
                <span className="font-extrabold font-heading -mt-[2px] text-warn">×</span>Memorizing buzzwords — sharding, CAP theorem, CDNs — without context
              </li>
            </ul>
          </Reveal>
          <Reveal direction="right" delay={0.4} className="p-[40px] rounded-[24px] bg-primary text-surface shadow-lift">
            <h3 className="text-[22px] font-extrabold mb-6 font-heading text-accent tracking-[-0.02em] leading-[1.1]">The DesignDojo way</h3>
            <ul className="flex flex-col gap-4 list-none">
              <li className="flex gap-3 text-[15px] opacity-85">
                <span className="font-extrabold font-heading -mt-[2px] text-accent">✓</span>Ask &quot;why this and not that&quot; and get a reasoned answer
              </li>
              <li className="flex gap-3 text-[15px] opacity-85">
                <span className="font-extrabold font-heading -mt-[2px] text-accent">✓</span>Build the architecture yourself, block by block
              </li>
              <li className="flex gap-3 text-[15px] opacity-85">
                <span className="font-extrabold font-heading -mt-[2px] text-accent">✓</span>Get an AI critique of every trade-off you make
              </li>
              <li className="flex gap-3 text-[15px] opacity-85">
                <span className="font-extrabold font-heading -mt-[2px] text-accent">✓</span>Simulate real traffic and failure to see the consequences
              </li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
