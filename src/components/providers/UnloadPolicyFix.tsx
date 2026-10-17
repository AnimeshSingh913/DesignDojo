'use client';

if (typeof window !== 'undefined' && !(window as any).__unloadPatched) {
  (window as any).__unloadPatched = true;
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  window.addEventListener = function (type: string, listener: any, options?: any) {
    if (type === 'unload') {
      // Modern browsers deprecate 'unload' in favor of 'pagehide'.
      // Redirecting to 'pagehide' eliminates the browser permissions policy violation warning.
      return originalAddEventListener.call(this, 'pagehide', listener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  window.removeEventListener = function (type: string, listener: any, options?: any) {
    if (type === 'unload') {
      return originalRemoveEventListener.call(this, 'pagehide', listener, options);
    }
    return originalRemoveEventListener.call(this, type, listener, options);
  };
}

export function UnloadPolicyFix() {
  return null;
}
