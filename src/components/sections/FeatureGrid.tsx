import React from "react";
import { Reveal } from "../ui/Reveal";
import { Sparkles, MousePointer2, Activity, GraduationCap, Layers, Terminal } from "lucide-react";

export function FeatureGrid() {
  return (
    <section className="py-[60px]">
      <div className="w-full max-w-7xl mx-auto px-8">
        <Reveal className="max-w-[640px] mb-14 mx-auto text-center">
          <span className="inline-flex items-center gap-2 font-code text-[12.5px] font-medium tracking-[0.08em] uppercase text-primary bg-accent px-[14px] py-[7px] pl-[10px] rounded-full mb-[18px]">
            <span className="w-1.5 h-1.5 rounded-full bg-warn shrink-0"></span>WHY DESIGNDOJO
          </span>
          <h2 className="text-[clamp(28px,3.6vw,40px)] font-extrabold mb-4 font-heading text-primary tracking-[-0.02em] leading-[1.1]">
            Built for engineers who design systems.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 max-[900px]:grid-cols-2 min-[900px]:grid-cols-3 gap-5">
          <Reveal delay={0.1} className="bg-surface border border-primary/10 rounded-[14px] py-[28px] px-[24px] transition-all duration-250 ease-out hover:-translate-y-[5px] hover:shadow-soft hover:border-primary/20">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-accent text-primary flex items-center justify-center mb-[18px]"><Sparkles size={18} strokeWidth={2.5} /></div>
            <h4 className="text-[16.5px] font-heading text-primary tracking-[-0.02em] leading-[1.1] mb-2 font-bold">1. Blank Canvas Whiteboard</h4>
            <p className="text-[14px] opacity-72">A distraction-free, lightning-fast Excalidraw whiteboard for raw, unopinionated sketching and brainstorming.</p>
          </Reveal>
          <Reveal delay={0.2} className="bg-surface border border-primary/10 rounded-[14px] py-[28px] px-[24px] transition-all duration-250 ease-out hover:-translate-y-[5px] hover:shadow-soft hover:border-primary/20">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-accent text-primary flex items-center justify-center mb-[18px]"><Layers size={18} strokeWidth={2.5} /></div>
            <h4 className="text-[16.5px] font-heading text-primary tracking-[-0.02em] leading-[1.1] mb-2 font-bold">2. HLD Architecture Workspace</h4>
            <p className="text-[14px] opacity-72">Drag and drop 50+ industry-standard cloud components. The AI actively detects bottlenecks and SPOFs in your design.</p>
          </Reveal>
          <Reveal delay={0.3} className="bg-surface border border-primary/10 rounded-[14px] py-[28px] px-[24px] transition-all duration-250 ease-out hover:-translate-y-[5px] hover:shadow-soft hover:border-primary/20">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-accent text-primary flex items-center justify-center mb-[18px]"><Activity size={18} strokeWidth={2.5} /></div>
            <h4 className="text-[16.5px] font-heading text-primary tracking-[-0.02em] leading-[1.1] mb-2 font-bold">3. LLD & UML Workspace</h4>
            <p className="text-[14px] opacity-72">Design classes, interfaces, and methods. The AST engine understands inheritance and grades your SOLID principles.</p>
          </Reveal>
          <Reveal delay={0.4} className="bg-surface border border-primary/10 rounded-[14px] py-[28px] px-[24px] transition-all duration-250 ease-out hover:-translate-y-[5px] hover:shadow-soft hover:border-primary/20">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-accent text-primary flex items-center justify-center mb-[18px]"><GraduationCap size={18} strokeWidth={2.5} /></div>
            <h4 className="text-[16.5px] font-heading text-primary tracking-[-0.02em] leading-[1.1] mb-2 font-bold">4. AI Design Mentor</h4>
            <p className="text-[14px] opacity-72">Your personal Principal Engineer living in the sidebar. Context-aware streaming chat and granular evaluation scoring.</p>
          </Reveal>
          <Reveal delay={0.5} className="bg-surface border border-primary/10 rounded-[14px] py-[28px] px-[24px] transition-all duration-250 ease-out hover:-translate-y-[5px] hover:shadow-soft hover:border-primary/20">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-accent text-primary flex items-center justify-center mb-[18px]"><Sparkles size={18} strokeWidth={2.5} /></div>
            <h4 className="text-[16.5px] font-heading text-primary tracking-[-0.02em] leading-[1.1] mb-2 font-bold flex items-center gap-2">5. AI Design Generator</h4>
            <p className="text-[14px] opacity-72">Describe a system in plain English and watch DesignDojo construct the complete HLD and LLD diagrams instantly.</p>
          </Reveal>
          <Reveal delay={0.6} className="bg-surface border border-primary/10 rounded-[14px] py-[28px] px-[24px] transition-all duration-250 ease-out hover:-translate-y-[5px] hover:shadow-soft hover:border-primary/20">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-accent text-primary flex items-center justify-center mb-[18px]"><Terminal size={18} strokeWidth={2.5} /></div>
            <h4 className="text-[16.5px] font-heading text-primary tracking-[-0.02em] leading-[1.1] mb-2 font-bold">+ Boilerplate Code Gen</h4>
            <p className="text-[14px] opacity-72">Don&apos;t just draw it, build it. Convert your visual LLDs directly into working boilerplate code for your next project.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
