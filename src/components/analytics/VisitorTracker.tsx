'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function VisitorTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid re-tracking the same page repeatedly in quick succession
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    try {
      let visitorId = localStorage.getItem('designdojo_visitor_id');
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
        localStorage.setItem('designdojo_visitor_id', visitorId);
      }

      // Send beacon or fetch in non-blocking way
      const payload = JSON.stringify({
        visitorId,
        path: pathname || '/',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      });

      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/visit', new Blob([payload], { type: 'application/json' }));
      } else {
        fetch('/api/analytics/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        }).catch(() => {});
      }
    } catch {
      // Ignore client tracking failures silently
    }
  }, [pathname]);

  return null;
}
