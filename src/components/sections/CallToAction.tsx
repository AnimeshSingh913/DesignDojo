'use client';

import React from "react";
import { Reveal } from "../ui/Reveal";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function CallToAction() {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push('/dashboard');
    } else {
      openAuthModal('login');
    }
  };

  return (
    <section className="py-[60px]">
      <div className="w-full max-w-7xl mx-auto px-8">
        <div className="bg-primary rounded-[28px] py-[70px] px-[56px] text-center relative overflow-hidden">
          <Reveal delay={0.1}>
            <h2 className="text-surface text-[clamp(28px,4vw,42px)] mb-4 font-heading font-extrabold tracking-[-0.02em] leading-[1.1]">
              Your next architecture review<br />
              is one drawing away.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-accent opacity-90 text-[16.5px] mb-8">
              Join engineers and students learning system design by doing it, not memorizing it.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex gap-4 justify-center flex-wrap">
              <button 
                onClick={handleStart}
                className="cursor-pointer inline-flex items-center justify-center gap-2 font-heading font-semibold whitespace-nowrap transition-all duration-250 ease-[cubic-bezier(.2,.8,.2,1)] border-[1.5px] border-transparent px-[24px] py-[14px] text-[15px] rounded-[12px] text-primary-ink bg-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_-10px_rgba(53,66,89,0.55)] hover:-translate-y-[2px] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_30px_-10px_rgba(53,66,89,0.6)] hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              >
                Start designing free
              </button>
              <a
                href="#top"
                className="inline-flex items-center justify-center gap-2 font-heading font-semibold whitespace-nowrap transition-all duration-250 ease-[cubic-bezier(.2,.8,.2,1)] border-[1.5px] border-accent text-accent bg-transparent hover:bg-primary hover:text-surface hover:-translate-y-[2px] px-[24px] py-[14px] text-[15px] rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              >
                Explore the modules
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
