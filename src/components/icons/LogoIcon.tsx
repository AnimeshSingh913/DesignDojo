import React from "react";

/** DesignDojo mark: a torii gate framing a system node. */
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className={className} aria-hidden="true">
      <path d="M1.5 4.2Q13 6.6 24.5 4.2L23.9 6.6Q13 8.8 2.1 6.6Z" fill="#354259" />
      <rect x="4" y="9.2" width="18" height="1.8" rx="0.6" fill="#354259" />
      <rect x="12" y="7.6" width="2" height="2" rx="0.4" fill="#354259" />
      <rect x="6" y="7" width="2.2" height="17" rx="0.8" fill="#354259" />
      <rect x="17.8" y="7" width="2.2" height="17" rx="0.8" fill="#354259" />
      <rect x="10.2" y="14.2" width="5.6" height="5.6" rx="1.4" fill="#C2DED1" stroke="#354259" strokeWidth="1.4" />
    </svg>
  );
}
