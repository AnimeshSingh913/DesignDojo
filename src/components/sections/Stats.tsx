import React from "react";
import { Reveal } from "../ui/Reveal";

export function Stats() {
  return (
    <section className="pt-[52px] pb-5">
      <div className="w-full max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 min-[820px]:grid-cols-4 gap-[18px]">
          <Reveal delay={0.1} className="bg-surface border border-primary/10 rounded-[14px] py-[22px] px-[20px] transition-all duration-250 ease-out hover:-translate-y-1 hover:shadow-soft">
            <div className="font-heading font-extrabold text-[26px] text-primary mb-1">2 disciplines</div>
            <div className="text-[13.5px] text-primary opacity-[0.72]">HLD + LLD in a single workspace</div>
          </Reveal>
          <Reveal delay={0.2} className="bg-surface border border-primary/10 rounded-[14px] py-[22px] px-[20px] transition-all duration-250 ease-out hover:-translate-y-1 hover:shadow-soft">
            <div className="font-heading font-extrabold text-[26px] text-primary mb-1">AI-reviewed</div>
            <div className="text-[13.5px] text-primary opacity-[0.72]">Every diagram scored &amp; explained</div>
          </Reveal>
          <Reveal delay={0.3} className="bg-surface border border-primary/10 rounded-[14px] py-[22px] px-[20px] transition-all duration-250 ease-out hover:-translate-y-1 hover:shadow-soft">
            <div className="font-heading font-extrabold text-[26px] text-primary mb-1">Adaptive</div>
            <div className="text-[13.5px] text-primary opacity-[0.72]">Mock interviews that follow up like a real panel</div>
          </Reveal>
          <Reveal delay={0.4} className="bg-surface border border-primary/10 rounded-[14px] py-[22px] px-[20px] transition-all duration-250 ease-out hover:-translate-y-1 hover:shadow-soft">
            <div className="font-heading font-extrabold text-[26px] text-primary mb-1">Zero</div>
            <div className="text-[13.5px] text-primary opacity-[0.72]">Memorization required to get started</div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
