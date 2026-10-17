'use client';

import React, { useState } from "react";
import { LogoIcon } from "../icons/LogoIcon";
import { FeedbackModal } from "../ui/FeedbackModal";
import { siteConfig } from "@/lib/site";

const footerLink =
  "text-[14px] opacity-70 hover:opacity-100 hover:translate-x-1 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary focus-visible:rounded-md";

export function Footer() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
    <footer className="pt-16 pb-8 border-t border-primary/10">
      <div className="w-full max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 max-[820px]:grid-cols-2 min-[821px]:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 mb-14">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-[9px] font-heading font-extrabold text-[19px] text-primary mb-4">
              <LogoIcon />
              DesignDojo
            </div>

            <p className="text-[14px] opacity-65 leading-7 max-w-[290px]">
              The AI copilot for mastering system design—from first principles
              to production-ready architectures.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h5 className="font-heading text-[13px] uppercase tracking-[0.08em] mb-4 text-primary font-bold">
              Platform
            </h5>

            <ul className="flex flex-col gap-3">
              <li>
                <a href="/dashboard" className={footerLink}>
                  Learn
                </a>
              </li>

              <li>
                <a href="/dashboard/ai-generator" className={footerLink}>
                  Practice
                </a>
              </li>

              <li>
                <a href="/dashboard/canvas" className={footerLink}>
                  Design
                </a>
              </li>

              <li>
                <a href="/dashboard/mentor" className={footerLink}>
                  Interview
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5 className="font-heading text-[13px] uppercase tracking-[0.08em] mb-4 text-primary font-bold">
              Resources
            </h5>

            <ul className="flex flex-col gap-3">
              <li>
                <a href="https://github.com/donnemartin/system-design-primer" target="_blank" rel="noopener noreferrer" className={footerLink}>
                  Documentation
                </a>
              </li>

              <li>
                <a href="http://highscalability.com/" target="_blank" rel="noopener noreferrer" className={footerLink}>
                  Case Studies
                </a>
              </li>

              <li>
                <a href="https://roadmap.sh/system-design" target="_blank" rel="noopener noreferrer" className={footerLink}>
                  Roadmap
                </a>
              </li>

              <li>
                <a href="https://blog.bytebytego.com/" target="_blank" rel="noopener noreferrer" className={footerLink}>
                  System Design Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h5 className="font-heading text-[13px] uppercase tracking-[0.08em] mb-4 text-primary font-bold">
              Connect
            </h5>

            <ul className="flex flex-col gap-3">
              {siteConfig.author.github && (
                <li>
                  <a href={siteConfig.author.github} target="_blank" rel="noopener noreferrer" className={footerLink}>
                    GitHub
                  </a>
                </li>
              )}

              {siteConfig.author.linkedin && (
                <li>
                  <a href={siteConfig.author.linkedin} target="_blank" rel="noopener noreferrer" className={footerLink}>
                    LinkedIn
                  </a>
                </li>
              )}

              {siteConfig.author.email && (
                <li>
                  <a href={`mailto:${siteConfig.author.email}`} className={footerLink}>
                    Contact
                  </a>
                </li>
              )}

              <li>
                <button 
                  onClick={() => setIsFeedbackOpen(true)} 
                  className={footerLink}
                >
                  Feedback
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] opacity-60">
          <span>© {new Date().getFullYear()} {siteConfig.name}. Built by {siteConfig.author.name}.</span>

          <span className="font-code tracking-wide">
            designed for engineers, by engineers
          </span>
        </div>
      </div>
    </footer>
    <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}