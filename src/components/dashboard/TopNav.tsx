'use client';

import { LogoIcon } from '@/components/icons/LogoIcon';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function TopNav() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-[40] w-full bg-surface/80 backdrop-blur-xl border-b border-primary/10 px-6 py-3">
      <div className="flex items-center justify-between h-full">
        
        {/* Left - Logo */}
        <div className="flex items-center gap-[9px] font-heading font-extrabold text-[19px] text-primary w-64 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-[9px] hover:opacity-80 transition-opacity">
            <LogoIcon />
            DesignDojo
          </Link>
        </div>

        {/* Right - User Profile */}
        <div className="flex items-center justify-end gap-6 w-64 shrink-0">
          <div className="flex items-center gap-3">
            {/* <div className="h-8 w-8 rounded-full bg-accent/30 text-primary flex items-center justify-center font-bold text-sm border border-accent">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div> */}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-primary leading-none">
                Hi, {user?.name || 'User'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
