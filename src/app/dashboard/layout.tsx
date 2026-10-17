'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopNav } from '@/components/dashboard/TopNav';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, openAuthModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      openAuthModal('login');
    }
  }, [user, loading, router, openAuthModal]);

  const pathname = usePathname();
  const isMentorPage = pathname.startsWith('/dashboard/mentor');

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden font-body text-primary selection:bg-accent/40">
      <TopNav />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className={`flex-1 relative ${isMentorPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className={`mx-auto w-full h-full ${isMentorPage ? '' : 'max-w-7xl p-4 sm:p-6 lg:p-8'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
