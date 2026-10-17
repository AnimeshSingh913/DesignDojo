'use client';

import React from "react";
import { Reveal } from "../ui/Reveal";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function Hero() {
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
    <section className="pt-[120px] pb-20 relative">
      <div className="w-full max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16 items-center">
          <div className="max-w-[640px]">
            <Reveal delay={0.1}>
              <span className="inline-flex items-center gap-2 font-code text-[12.5px] font-medium tracking-[0.08em] uppercase text-primary bg-accent px-[14px] py-[7px] pl-[10px] rounded-full mb-[22px]">
                <span className="w-1.5 h-1.5 rounded-full bg-warn shrink-0"></span>AI SYSTEM DESIGN COPILOT
              </span>
            </Reveal>
            <Reveal delay={0.2}>
              <h1 className="text-[clamp(34px,5.4vw,56px)] font-extrabold mb-[26px] font-heading text-primary tracking-[-0.02em] leading-[1.15]">
                Design Systems.<br />
                <span className="relative whitespace-nowrap">
                  Defend Every Decision.
                  <svg
                    viewBox="0 0 220 16"
                    preserveAspectRatio="none"
                    className="absolute -left-[2%] -bottom-[4px] w-[104%] h-[16px]"
                  >
                    <path
                      d="M2 10 C 40 2, 80 14, 110 7 S 180 2, 218 9"
                      stroke="#C2DED1"
                      strokeWidth="7"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-[18.5px] text-primary opacity-[0.82] max-w-[500px] mb-[40px] leading-[1.6]">
                DesignDojo is the AI copilot that explains the <em>why </em> behind every
                architectural decision — through live design reviews, traffic &amp;
                failure simulations, and interviews that adapt to you.
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="flex items-center gap-4 flex-wrap mb-5">
                <button
                  onClick={handleStart}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 font-heading font-semibold whitespace-nowrap transition-all duration-250 ease-[cubic-bezier(.2,.8,.2,1)] border-[1.5px] border-transparent text-surface bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_-10px_rgba(53,66,89,0.55)] hover:-translate-y-[2px] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_30px_-10px_rgba(53,66,89,0.6)] px-[28px] py-[16px] text-[15.5px] rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
                >
                  Start Designing Free
                </button>
              </div>
            </Reveal>
            <Reveal delay={0.5}>
              <p className="text-[13px] text-primary opacity-60 font-code">
                {`// no credit card required — built for engineers`}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.4} direction="left" className="relative bg-surface border border-primary/10 rounded-[18px] shadow-lift p-0 overflow-hidden">
            <div className="flex items-center gap-2 py-[14px] px-[18px] border-b border-primary/10">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D98282]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E3C97D]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-accent-deep"></span>
              <span className="ml-[10px] font-code text-[12px] text-primary opacity-55">url-shortener-v2.designdojo</span>
            </div>
            <div className="relative min-h-[400px] bg-surface bg-[radial-gradient(var(--color-muted)_1.2px,transparent_1.2px)] bg-[size:24px_24px]">
              <svg viewBox="80 30 780 400" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full block">
                <defs>
                  <filter id="sketchy" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.018"
                      numOctaves="2"
                      seed="7"
                      result="n"
                    />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
                  </filter>
                </defs>
                <g filter="url(#sketchy)">
                  <path className="flow-line" d="M200,136 L200,180" />
                  <path className="flow-line" d="M200,226 L200,270" />
                  <path className="flow-line" d="M300,293 L360,243" />
                  <path className="flow-line" d="M300,293 L360,343" />
                  <path className="flow-line" d="M480,243 L540,243" />
                  <path className="flow-line" d="M480,343 L540,343" />
                  <path className="flow-line" d="M660,243 L720,293" />
                  <path className="flow-line" d="M660,343 L720,293" />

                  <rect className="node-box" x="140" y="90" width="120" height="46" rx="12" />
                  <text className="node-label" x="170" y="118">
                    Client
                  </text>

                  <rect className="node-box accented" x="140" y="180" width="120" height="46" rx="12" />
                  <text className="node-label" x="155" y="208">
                    Load Bal.
                  </text>

                  <rect className="node-box" x="140" y="270" width="160" height="46" rx="12" />
                  <text className="node-label" x="158" y="298">
                    API Gateway
                  </text>

                  <rect className="node-box" x="360" y="220" width="120" height="46" rx="12" />
                  <text className="node-label" x="378" y="248">
                    Service A
                  </text>

                  <rect className="node-box" x="360" y="320" width="120" height="46" rx="12" />
                  <text className="node-label" x="378" y="348">
                    Service B
                  </text>

                  <rect className="node-box accented" x="540" y="220" width="120" height="46" rx="12" />
                  <text className="node-label" x="568" y="248">
                    Cache
                  </text>

                  <rect className="node-box warn" x="540" y="320" width="120" height="46" rx="12" />
                  <text className="node-label" x="562" y="348">
                    Database
                  </text>

                  <rect className="node-box" x="720" y="270" width="90" height="46" rx="12" />
                  <text className="node-label" x="736" y="298">
                    Metrics
                  </text>
                </g>
              </svg>
              <div className="absolute bg-primary text-surface border-[1.5px] border-primary rounded-xl px-[13px] py-[9px] font-code text-[12px] font-medium shadow-soft flex items-center gap-[7px] top-6 right-6 ">◆ Architecture Score 87/100</div>
              <div className="absolute bg-surface text-warn border-[1.5px] border-warn rounded-xl px-[13px] py-[9px] font-code text-[12px] font-medium shadow-soft flex items-center gap-[7px] bottom-6 left-6 ">⚠ Single point of failure</div>
              <div className="absolute bg-surface text-primary-ink border-[1.5px] border-primary rounded-xl px-[13px] py-[9px] font-code text-[12px] font-medium shadow-soft flex items-center gap-[7px] bottom-6 right-6 ">+ Suggest: add read replica</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
