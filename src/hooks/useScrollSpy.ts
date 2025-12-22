import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScrollSpyReturn {
  activeSection: string | undefined;
  scrollToSection: (sectionId: string, offset?: number) => void;
}

export function useScrollSpy(sectionIds: string[], headerOffset: number = 156): UseScrollSpyReturn {
  const [activeSection, setActiveSection] = useState<string | undefined>(undefined);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateActiveSection = useCallback((entries: IntersectionObserverEntry[]) => {
    // Clear any pending debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce updates: 100ms
    timeoutRef.current = setTimeout(() => {
      // Find the section with the highest intersection ratio
      let maxRatio = 0;
      let mostVisibleSection: string | undefined = undefined;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          // Extract section id from element id (remove 'section-' prefix)
          const elementId = entry.target.id;
          if (elementId.startsWith('section-')) {
            mostVisibleSection = elementId.replace('section-', '');
          }
        }
      });

      // If no section is intersecting, keep the last active section
      if (mostVisibleSection === undefined && maxRatio === 0) {
        return;
      }

      setActiveSection(mostVisibleSection);
    }, 100);
  }, []);

  const scrollToSection = useCallback((sectionId: string, offset: number = headerOffset) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, [headerOffset]);

  useEffect(() => {
    // Create IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        updateActiveSection(entries);
      },
      {
        root: null, // viewport
        rootMargin: '-20% 0px -20% 0px', // Trigger when section is in middle 60% of viewport
        threshold: [0, 0.25, 0.5, 0.75, 1.0], // Multiple thresholds for better detection
      }
    );

    // Observe all sections
    sectionIds.forEach((sectionId) => {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (observerRef.current) {
        sectionIds.forEach((sectionId) => {
          const element = document.getElementById(`section-${sectionId}`);
          if (element) {
            observerRef.current?.unobserve(element);
          }
        });
        observerRef.current.disconnect();
      }
    };
  }, [sectionIds, updateActiveSection]);

  return { activeSection, scrollToSection };
}
