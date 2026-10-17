import React from "react";
import { Reveal } from "../ui/Reveal";
import { AnimatedNumber } from "../ui/AnimatedNumber";

export function MockInterviews() {
  return (
    <section id="interview" className="scroll-mt-28 py-[60px]">
      <div className="w-full max-w-7xl mx-auto px-8">
        <div className="max-w-[640px] mb-[64px] mx-auto text-center">
          <Reveal delay={0.1}>
            <span className="inline-flex items-center gap-2 font-code text-[12.5px] font-medium tracking-[0.08em] uppercase text-primary bg-accent px-[14px] py-[7px] pl-[10px] rounded-full mb-[18px]">
              <span className="w-1.5 h-1.5 rounded-full bg-warn shrink-0"></span>MOCK INTERVIEWS
            </span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="text-[clamp(28px,3.6vw,40px)] font-extrabold mb-4 font-heading text-primary tracking-[-0.02em] leading-[1.1]">An interviewer that actually listens to your answer</h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-[17px] opacity-80 text-primary">
              DesignDojo&apos;s mock interviews gather requirements, then branch — your last answer decides
              the next question, just like a real panel would.
            </p>
          </Reveal>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-16 items-center mt-14">
          <div className="bg-surface border border-primary/10 rounded-[24px] p-8 flex flex-col gap-4 shadow-soft">
            <Reveal delay={0.3} direction="right" className="max-w-[85%] px-5 py-[14px] rounded-2xl text-[14.5px] leading-relaxed bg-[#354259]/5 self-start rounded-bl-sm">
              <span className="block font-heading font-bold text-[11.5px] opacity-60 mb-1">DesignDojo</span>Let&apos;s design a URL shortener. What scale are we
              targeting?
            </Reveal>
            <Reveal delay={0.4} direction="left" className="max-w-[85%] px-5 py-[14px] rounded-2xl text-[14.5px] leading-relaxed bg-primary text-surface self-end rounded-br-sm">Around 100M new URLs a month.</Reveal>
            <Reveal delay={0.5} direction="right" className="max-w-[85%] px-5 py-[14px] rounded-2xl text-[14.5px] leading-relaxed bg-[#354259]/5 self-start rounded-bl-sm">
              <span className="block font-heading font-bold text-[11.5px] opacity-60 mb-1">DesignDojo</span>Good — that&apos;s write-light, read-heavy. How would
              you generate short codes at that volume without collisions?
            </Reveal>
            <Reveal delay={0.6} direction="left" className="max-w-[85%] px-5 py-[14px] rounded-2xl text-[14.5px] leading-relaxed bg-primary text-surface self-end rounded-br-sm">
              Base62 encoding on an auto-incrementing ID, sharded across counters.
            </Reveal>
            <Reveal delay={0.7} direction="right" className="max-w-[85%] px-5 py-[14px] rounded-2xl text-[14.5px] leading-relaxed bg-[#354259]/5 self-start rounded-bl-sm">
              <span className="block font-heading font-bold text-[11.5px] opacity-60 mb-1">DesignDojo</span>Nice. Now — what happens to a redirect if your
              cache node goes down mid-request?
            </Reveal>
          </div>
          <div className="flex flex-col justify-center">
            <Reveal delay={0.3}>
              <h3 className="text-[24px] mb-3.5 font-extrabold font-heading text-primary tracking-[-0.02em] leading-[1.1]">
                A feedback report you can act on
              </h3>
            </Reveal>
            <Reveal delay={0.4}>
              <p className="opacity-75 text-[15.5px] mb-[22px]">
                Every mock interview ends with a breakdown of how you reasoned, not just what you
                drew — so you know exactly what to practice next.
              </p>
            </Reveal>
            <Reveal delay={0.5}>
              <div className="mb-6">
                <div className="flex justify-between text-[13.5px] font-medium opacity-85 mb-2">
                  <span>Requirement gathering</span>
                  <span className="flex items-center gap-1.5">Strong <span className="opacity-60 font-code text-[12px]">(<AnimatedNumber value={88} />%)</span></span>
                </div>
                <div className="h-[6px] bg-[#CDC2AE] rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ width: "88%" }}></div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.6}>
              <div className="mb-6">
                <div className="flex justify-between text-[13.5px] font-medium opacity-85 mb-2">
                  <span>Trade-off reasoning</span>
                  <span className="flex items-center gap-1.5">Good <span className="opacity-60 font-code text-[12px]">(<AnimatedNumber value={74} />%)</span></span>
                </div>
                <div className="h-[6px] bg-[#CDC2AE] rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ width: "74%" }}></div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.7}>
              <div className="mb-6">
                <div className="flex justify-between text-[13.5px] font-medium opacity-85 mb-2">
                  <span>Diagram completeness</span>
                  <span className="flex items-center gap-1.5">Needs work <span className="opacity-60 font-code text-[12px]">(<AnimatedNumber value={42} />%)</span></span>
                </div>
                <div className="h-[6px] bg-[#CDC2AE] rounded-full overflow-hidden">
                  <div className="h-full bg-warn rounded-full transition-all duration-1000 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ width: "42%" }}></div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
