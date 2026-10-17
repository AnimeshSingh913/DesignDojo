"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogoIcon } from "../icons/LogoIcon";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { user, loading, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <header className="sticky top-0 z-[100] bg-[#ECE5C7]/82 backdrop-blur-[14px] backdrop-saturate-150 border-b border-[#354259]/10">
      <nav className="flex items-center justify-between py-4 px-8 max-w-7xl mx-auto">
        <a href="#top" className="flex items-center gap-[9px] font-heading font-extrabold text-[19px] text-primary focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary focus-visible:rounded-md">
          <LogoIcon />
          DesignDojo
        </a>
        <div className="hidden min-[900px]:flex items-center gap-[34px] text-[14.5px] font-medium text-primary">
          <a href="#learn" className="relative opacity-[0.82] transition-opacity duration-200 hover:opacity-100 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[6px] after:h-[2px] after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary focus-visible:rounded-md">Learn</a>
          <a href="#practice" className="relative opacity-[0.82] transition-opacity duration-200 hover:opacity-100 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[6px] after:h-[2px] after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary focus-visible:rounded-md">Practice</a>
          <a href="#design" className="relative opacity-[0.82] transition-opacity duration-200 hover:opacity-100 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[6px] after:h-[2px] after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary focus-visible:rounded-md">Design</a>
          <a href="#interview" className="relative opacity-[0.82] transition-opacity duration-200 hover:opacity-100 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[6px] after:h-[2px] after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary focus-visible:rounded-md">Interview</a>
        </div>
        <div className="flex items-center gap-[18px]">
          {loading ? (
            <div className="h-[38px] w-[80px] rounded-[10px] bg-primary/10 animate-pulse border border-primary/5" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-ink transition-colors cursor-pointer"
              >
                Hi, {user.name.split(' ')[0]}
                <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 mt-2 w-44 bg-surface rounded-xl shadow-lift border border-primary/10 py-1.5 overflow-hidden z-50"
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-[13.5px] font-medium text-primary hover:bg-primary/5 transition-colors"
                    >
                      Dashboard
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-[13.5px] font-semibold text-accent-deep hover:bg-accent/20 transition-colors"
                      >
                        Admin Control ⚡
                      </Link>
                    )}
                    <div className="h-px bg-primary/10 my-1" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-[13.5px] font-medium text-warn hover:bg-warn/10 transition-colors cursor-pointer"
                    >
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="cursor-pointer inline-flex items-center justify-center gap-2 font-heading font-semibold whitespace-nowrap transition-all duration-250 ease-[cubic-bezier(.2,.8,.2,1)] border-[1.5px] border-transparent text-surface bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_-10px_rgba(53,66,89,0.55)] hover:-translate-y-[2px] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_30px_-10px_rgba(53,66,89,0.6)] px-[18px] py-[10px] text-[13.5px] rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
            >
              Log in
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
