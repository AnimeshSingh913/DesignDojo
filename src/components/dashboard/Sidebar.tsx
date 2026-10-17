'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Component, 
  GitMerge, 
  Bot, 
  PenTool,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const BASE_NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true
  },
  {
    title: 'Blank Canvas',
    href: '/dashboard/canvas',
    icon: PenTool,
    exact: false
  },
  {
    title: 'LLD Practice',
    href: '/dashboard/lld',
    icon: GitMerge,
    exact: false
  },
  {
    title: 'HLD Practice',
    href: '/dashboard/hld',
    icon: Component,
    exact: false
  },
  {
    title: 'AI Design Generator',
    href: '/dashboard/ai-generator',
    icon: Sparkles,
    exact: false
  },
  {
    title: 'AI Design Mentor',
    href: '/dashboard/mentor',
    icon: Bot,
    exact: false
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    ...BASE_NAV_ITEMS,
    ...(user?.role === 'admin'
      ? [
          {
            title: 'Admin Control',
            href: '/dashboard/admin',
            icon: ShieldCheck,
            exact: false,
          },
        ]
      : []),
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="relative flex flex-col bg-surface border-r border-primary/10 shrink-0 h-full z-10"
    >
      {/* Vertical Strip Toggle Handle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-14 w-4 flex items-center justify-center bg-surface hover:bg-primary/5 border-l border-y border-primary/50 rounded-l-md transition-colors cursor-pointer z-50 group"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="text-primary/50 group-hover:text-primary/70 transition-colors" />
        ) : (
          <ChevronLeft size={14} className="text-primary/50 group-hover:text-primary/70 transition-colors" />
        )}
      </button>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2 no-scrollbar">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer overflow-hidden
                ${isActive 
                  ? 'bg-primary/5 text-primary-ink font-semibold' 
                  : 'text-primary/70 hover:bg-bg hover:text-primary font-medium'}
              `}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} size={20} />
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden text-sm"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-primary/10 flex flex-col gap-2">
        <button 
          onClick={logout}
          className={`flex items-center gap-3 p-3 rounded-xl text-warn hover:bg-warn/10 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
          title="Log out"
        >
          <LogOut size={20} className="shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Log Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
