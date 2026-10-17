'use client';

import React, { useState } from 'react';
import { Reveal } from '../ui/Reveal';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    question: 'What is DesignDojo?',
    answer:
      'DesignDojo is an advanced AI-powered system design copilot. It is designed to help software engineers, architects, and students master High-Level Design (HLD) and Low-Level Design (LLD) practice for production systems and technical interviews.',
  },
  {
    question: 'How does DesignDojo help with HLD (High-Level Design) Practice?',
    answer:
      'With DesignDojo’s HLD practice workspace, you can design scalable microservices and distributed architectures. The AI system stress-tests your design with real-time traffic and failure simulations, detects single points of failure (SPOFs), recommends caching and database strategies, and generates Terraform infrastructure as code.',
  },
  {
    question: 'How can I practice LLD (Low-Level Design) and Machine Coding?',
    answer:
      'DesignDojo offers an interactive LLD practice suite that includes UML class diagrams, sequence diagrams, and design pattern recommendations. The AI analyzes your object-oriented design against SOLID principles and generates clean, production-ready code in multiple languages.',
  },
  {
    question: 'Why is DesignDojo the best platform for System Design practitioners and interview prep?',
    answer:
      'Unlike static articles or video courses, DesignDojo allows system design practitioners to actively build, defend, and validate architectures. Its AI Design Mentor conducts realistic mock system design interviews with adaptive questions and in-depth performance scorecards.',
  },
  {
    question: 'Can I generate full system architectures using AI prompts?',
    answer:
      'Yes! DesignDojo includes an AI Design Generator that converts natural language requirements (e.g., "Design a globally distributed URL shortener" or "Design Uber backend") into complete High-Level and Low-Level architecture diagrams with comprehensive technical documentation in seconds.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 border-t border-primary/10 relative">
      <div className="w-full max-w-4xl mx-auto px-8">
        <div className="text-center mb-12">
          <Reveal delay={0.1}>
            <span className="inline-flex items-center gap-2 font-code text-[12px] font-semibold tracking-[0.08em] uppercase text-primary bg-accent/60 px-3.5 py-1.5 rounded-full mb-3">
              Frequently Asked Questions
            </span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="text-[clamp(28px,4vw,42px)] font-extrabold font-heading text-primary tracking-tight">
              Master System Design, HLD &amp; LLD Practice
            </h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-[16px] text-primary/75 max-w-[600px] mx-auto mt-3">
              Everything you need to know about DesignDojo, practicing distributed architectures, and preparing for top-tier software design interviews.
            </p>
          </Reveal>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Reveal key={idx} delay={0.1 + idx * 0.05}>
                <div className="border border-primary/15 rounded-2xl bg-surface/80 overflow-hidden transition-all duration-200 shadow-sm hover:border-primary/30">
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-[17px] text-primary-ink hover:text-primary transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-primary/60 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-5 pt-1 text-[15px] text-primary/80 leading-relaxed border-t border-primary/5">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
