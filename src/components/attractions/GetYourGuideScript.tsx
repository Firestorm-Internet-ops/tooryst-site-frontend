'use client';

import { useEffect } from 'react';

export function GetYourGuideScript() {
  useEffect(() => {
    const loadScript = () => {
      // Load GetYourGuide widget script
      const script = document.createElement('script');
      script.src = 'https://widget.getyourguide.com/dist/pa.umd.production.min.js';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-gyg-partner-id', '9BAL9K3');
      document.head.appendChild(script);
    };

    // Defer script loading until browser is idle (after hydration)
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadScript, { timeout: 2000 });
    } else {
      // Fallback: delay by 2 seconds
      setTimeout(loadScript, 2000);
    }

    return () => {
      // Cleanup script on unmount
      const script = document.querySelector('script[data-gyg-partner-id="9BAL9K3"]');
      if (script?.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
