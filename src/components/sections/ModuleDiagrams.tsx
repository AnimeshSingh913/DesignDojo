import React from "react";

export function LearnDiagram() {
  return (
    <svg viewBox="0 0 380 240" className="w-full">
      <g filter="url(#sketchy)">
        <path className="flow-line" d="M70,50 L70,150" />
        <path className="flow-line" d="M70,150 L70,190" />
        <path className="flow-line" d="M70,50 L295,70" />
        <path className="flow-line" d="M70,150 L295,170" />
        <rect className="node-box" x="10" y="30" width="120" height="40" rx="10" />
        <text className="node-label text-[14px]" x="28" y="55">v1: Monolith</text>
        <rect className="node-box accented" x="230" y="50" width="130" height="40" rx="10" />
        <text className="node-label text-[14px]" x="248" y="75">Read Cache</text>
        <rect className="node-box" x="10" y="130" width="120" height="40" rx="10" />
        <text className="node-label text-[14px]" x="16" y="155">v2: Microservices</text>
        <rect className="node-box accented" x="230" y="150" width="130" height="40" rx="10" />
        <text className="node-label text-[14px]" x="248" y="175">Message Queue</text>
      </g>
    </svg>
  );
}

export function PracticeDiagram() {
  return (
    <svg viewBox="0 0 380 240" className="w-full">
      <g filter="url(#sketchy)">
        <path className="flow-line" d="M90,50 L90,125" />
        <path className="flow-line" d="M90,125 L255,200" />
        <path className="flow-line" d="M90,125 L90,200" />
        <rect className="node-box" x="30" y="30" width="120" height="40" rx="10" />
        <text className="node-label text-[14px]" x="52" y="55">Gateway</text>
        <rect className="node-box warn" x="30" y="105" width="120" height="40" rx="10" />
        <text className="node-label text-[14px]" x="52" y="130">Single DB</text>
        <rect className="node-box accented" x="180" y="180" width="150" height="40" rx="10" />
        <text className="node-label text-[14px]" x="196" y="205">+ Read Replica</text>
        <rect className="node-box" x="30" y="180" width="120" height="40" rx="10" />
        <text className="node-label text-[14px]" x="60" y="205">Cache</text>
      </g>
    </svg>
  );
}

export function DesignDiagram() {
  return (
    <svg viewBox="0 0 380 240" className="w-full">
      <g filter="url(#sketchy)">
        <path className="flow-line" d="M120,55 L120,155" />
        <path className="flow-line" d="M120,55 L290,55" />
        <rect className="node-box" x="40" y="30" width="160" height="50" rx="8" />
        <text className="node-label text-[14px]" x="55" y="50">«interface»</text>
        <text className="node-label text-[14px]" x="55" y="68">PaymentStrategy</text>
        <rect className="node-box accented" x="40" y="130" width="160" height="50" rx="8" />
        <text className="node-label text-[14px]" x="60" y="150">CardPayment</text>
        <text className="node-label text-[14px]" x="60" y="168">+pay()</text>
        <rect className="node-box" x="230" y="30" width="120" height="50" rx="8" />
        <text className="node-label text-[14px]" x="252" y="50">Checkout</text>
        <text className="node-label text-[14px]" x="252" y="68">+process()</text>
      </g>
    </svg>
  );
}

export function InterviewDiagram() {
  return (
    <svg viewBox="0 0 380 240" className="w-full">
      <g filter="url(#sketchy)">
        <rect className="node-box" x="20" y="20" width="220" height="44" rx="12" />
        <text className="node-label text-[14px]" x="34" y="47">&quot;What&apos;s the read/write ratio?&quot;</text>
        <rect className="node-box accented" x="140" y="90" width="220" height="44" rx="12" />
        <text className="node-label text-[14px]" x="154" y="117">&quot;Roughly 100:1, read-heavy&quot;</text>
        <rect className="node-box" x="20" y="160" width="240" height="44" rx="12" />
        <text className="node-label text-[14px]" x="34" y="187">&quot;Then let&apos;s talk caching...&quot;</text>
      </g>
    </svg>
  );
}
