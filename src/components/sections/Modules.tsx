"use client";

import React, { useState } from "react";
import { Reveal } from "../ui/Reveal";
import { motion, AnimatePresence } from "framer-motion";
import { LearnDiagram, PracticeDiagram, DesignDiagram, InterviewDiagram } from "./ModuleDiagrams";

// Module Data Array
const MODULES_DATA = [
  {
    id: "learn",
    label: "01 · Learn",
    title: "Explore real systems, not slides",
    description: "Browse AI-generated HLD diagrams of real-world systems, open any component to see why it exists, compare the technology choices, and trace how the architecture evolved as scale demanded it.",
    bullets: [
      "Case studies of popular systems",
      "Component-by-component explanations",
      "Technology trade-off comparisons",
      "Architecture evolution timelines",
    ],
    Illustration: LearnDiagram,
  },
  {
    id: "practice",
    label: "02 · Practice",
    title: "Build it. Break it. Fix it.",
    description: "Drag and drop your own HLD, then let DesignDojo stress-test it: scalability analysis, single-point-of-failure detection, traffic and failure simulation — with a score and concrete next steps.",
    bullets: [
      "Drag-and-drop HLD builder",
      "AI architecture review & score",
      "Traffic & failure simulation",
      "SPOF detection & optimization suggestions",
    ],
    Illustration: PracticeDiagram,
  },
  {
    id: "design",
    label: "03 · Design",
    title: "From boxes to classes",
    description: "Move from high-level boxes to low-level design in the same workspace — class, sequence, activity, state, and ER diagrams — reviewed by AI for SOLID violations and missing design patterns, with code generation to make it real.",
    bullets: [
      "Full UML workspace",
      "AI LLD review & SOLID analysis",
      "Design pattern suggestions",
      "Code generation",
    ],
    Illustration: DesignDiagram,
  },
  {
    id: "interview",
    label: "04 · Interview",
    title: "Practice the room, not just the answer",
    description: "Sit a mock system design interview with an AI that gathers requirements, asks adaptive follow-ups based on your choices, and hands you a feedback report you can actually act on.",
    bullets: [
      "AI mock interviews",
      "Adaptive requirement gathering",
      "Structured AI feedback reports",
      "Progress tracking over time",
    ],
    Illustration: InterviewDiagram,
  }
];

interface ModuleCardProps {
  title: string;
  description: string;
  bullets: string[];
  Illustration: React.FC;
}

function ModuleCard({ title, description, bullets, Illustration }: ModuleCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center bg-surface border border-primary/10 rounded-[24px] p-8 md:p-[46px]">
      <div>
        <h3 className="text-[28px] font-extrabold mb-4 font-heading text-primary tracking-[-0.02em] leading-[1.1]">{title}</h3>
        <p className="opacity-80 text-[16px] mb-8 leading-[1.7]">
          {description}
        </p>
        <ul className="flex flex-col gap-3 list-none">
          {bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-center gap-3 text-[15px] font-medium">
              <span className="text-accent-deep font-extrabold">✓</span>
              {bullet}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-bg border border-primary/10 rounded-2xl p-8 flex items-center justify-center">
        <Illustration />
      </div>
    </div>
  );
}

export function Modules() {
  const [activeTab, setActiveTab] = useState(MODULES_DATA[0].id);

  const activeModule = MODULES_DATA.find(m => m.id === activeTab) || MODULES_DATA[0];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % MODULES_DATA.length;
      setActiveTab(MODULES_DATA[nextIndex].id);
      document.getElementById(`tab-${MODULES_DATA[nextIndex].id}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + MODULES_DATA.length) % MODULES_DATA.length;
      setActiveTab(MODULES_DATA[prevIndex].id);
      document.getElementById(`tab-${MODULES_DATA[prevIndex].id}`)?.focus();
    }
  };

  return (
    <section id="learn" className="scroll-mt-28 py-[60px]">
      <div className="w-full max-w-7xl mx-auto px-8">
        <Reveal className="max-w-[640px] mb-[64px]">
          <span className="inline-flex items-center gap-2 font-code text-[12.5px] font-medium tracking-[0.08em] uppercase text-primary bg-accent px-[14px] py-[7px] pl-[10px] rounded-full mb-[18px]">
            <span className="w-1.5 h-1.5 rounded-full bg-warn shrink-0"></span>ONE WORKSPACE, FOUR MODULES
          </span>
          <h2 className="text-[clamp(28px,3.6vw,40px)] font-extrabold mb-4 font-heading text-primary tracking-[-0.02em] leading-[1.1]">Everything between &quot;I know the theory&quot; and &quot;I can defend the design&quot;</h2>
          <p className="text-[17px] opacity-80 text-primary">
            Move through the same loop real engineering teams use — learn the pattern, build it,
            review it, defend it.
          </p>
        </Reveal>

        <div 
          className="flex gap-3 mb-[48px] overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" 
          role="tablist"
          aria-label="Platform modules"
        >
          {MODULES_DATA.map((mod, index) => {
            const isActive = activeTab === mod.id;
            return (
              <button
                key={mod.id}
                role="tab"
                id={`tab-${mod.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${mod.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(mod.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`py-3 px-6 rounded-xl font-heading font-semibold text-[14.5px] whitespace-nowrap transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary border hover:scale-[1.02] ${
                  isActive 
                    ? "bg-primary text-surface border-primary shadow-[0_6px_16px_rgba(53,66,89,0.25)]" 
                    : "bg-surface border-primary/10 text-primary hover:bg-primary/5 shadow-sm"
                }`}
              >
                {mod.label}
              </button>
            );
          })}
        </div>

        <div className="relative min-h-[460px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule.id}
              role="tabpanel"
              id={`panel-${activeModule.id}`}
              aria-labelledby={`tab-${activeModule.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <ModuleCard 
                title={activeModule.title}
                description={activeModule.description}
                bullets={activeModule.bullets}
                Illustration={activeModule.Illustration}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
