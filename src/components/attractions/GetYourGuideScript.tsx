'use client';

import { useEffect } from 'react';

export function GetYourGuideScript() {
  useEffect(() => {
    // Load GetYourGuide widget script
    const script = document.createElement('script');
    script.src = 'https://widget.getyourguide.com/dist/pa.umd.production.min.js';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-gyg-partner-id', '9BAL9K3');
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
