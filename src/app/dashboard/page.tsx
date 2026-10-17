'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Component, 
  GitMerge, 
  Mic, 
  PenTool,
  Plus,
  ArrowUpRight,
  FolderOpen
} from 'lucide-react';
import Link from 'next/link';

const CARDS = [
  {
    title: 'Blank Canvas',
    description: 'Open a free workspace to design anything from scratch.',
    icon: PenTool,
    href: '/dashboard/canvas',
    buttonText: 'Open Canvas',
    color: 'text-slate-700',
    bgColor: 'bg-slate-200/60',
    badge: 'Recommended'
  },
  {
    title: 'LLD Practice',
    description: 'Practice object-oriented system design with UML diagrams.',
    icon: GitMerge,
    href: '/dashboard/lld',
    buttonText: 'Start Practice',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    title: 'HLD Practice',
    description: 'Practice real-world High Level Design questions.',
    icon: Component,
    href: '/dashboard/hld',
    buttonText: 'Start Practice',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    title: 'AI Design Generator',
    description: 'Generate complete HLD and LLD designs using natural language.',
    icon: Sparkles,
    href: '/dashboard/ai-generator',
    buttonText: 'Start Designing',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    title: 'AI Design Mentor',
    description: 'Get guidance and prepare for system design interviews with your AI Mentor.',
    icon: Mic,
    href: '/dashboard/mentor',
    buttonText: 'Open Mentor',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  }
];

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 pb-8 max-w-[1200px] mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[20px] bg-surface border border-primary/10 p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-[30%] h-full bg-gradient-to-l from-accent/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <motion.h1 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading font-extrabold text-[28px] sm:text-[32px] text-primary-ink mb-2 tracking-tight"
          >
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[15px] text-primary/70 font-medium"
          >
            Continue building scalable systems and preparing for your next big interview.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0 mt-2 lg:mt-0"
        >
          <Link
            href="/dashboard/ai-generator"
            className="inline-flex items-center justify-center gap-2 font-heading font-semibold transition-all duration-250 border-[1.5px] border-primary/15 text-primary bg-bg hover:bg-primary/5 px-[16px] py-[10px] text-[13px] rounded-xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary cursor-pointer shadow-sm hover:shadow"
          >
            <Sparkles size={16} />
            Start with AI
          </Link>
          <Link
            href="/dashboard/canvas"
            className="inline-flex items-center justify-center gap-2 font-heading font-semibold transition-all duration-250 border-[1.5px] border-transparent text-surface bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_14px_-6px_rgba(53,66,89,0.4)] hover:-translate-y-[1px] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_20px_-6px_rgba(53,66,89,0.5)] px-[18px] py-[10px] text-[13px] rounded-xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary cursor-pointer"
          >
            <PenTool size={16} />
            Open Canvas
          </Link>
        </motion.div>
      </section>

      {/* Feature Cards Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CARDS.map((card, idx) => {
            const Icon = card.icon;
            const isFeatured = card.badge;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={isFeatured ? "md:col-span-2 lg:col-span-1" : ""}
              >
                <Link 
                  href={card.href}
                  className={`group relative flex flex-col h-full bg-surface border ${isFeatured ? 'border-primary/20 ring-1 ring-primary/5' : 'border-primary/10'} hover:border-primary/30 rounded-[16px] p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.06)] hover:-translate-y-[2px] transition-all duration-300`}
                >
                  {isFeatured && (
                    <span className="absolute top-4 right-4 bg-primary/10 text-primary-ink text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {card.badge}
                    </span>
                  )}
                  
                  <div className={`w-10 h-10 rounded-[12px] ${card.bgColor} ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} />
                  </div>
                  
                  <h3 className="font-heading font-bold text-[17px] text-primary-ink mb-1.5 pr-8">
                    {card.title}
                  </h3>
                  <p className="text-[13px] text-primary/70 mb-6 leading-relaxed flex-1">
                    {card.description}
                  </p>
                  
                  <div className="flex items-center text-[13px] font-bold text-primary group-hover:text-primary-ink transition-colors mt-auto">
                    {card.buttonText}
                    <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
