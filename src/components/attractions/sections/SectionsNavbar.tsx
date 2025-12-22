'use client';

import { useEffect, useState, useRef } from 'react';
import { AttractionPageResponse } from '@/types/attraction-page';

interface SectionsNavbarProps {
  data: AttractionPageResponse;
  activeSection?: string;
  onScrollToSection?: (sectionId: string) => void;
}

interface SectionItem {
  id: string;
  label: string;
  icon?: string;
}

export function SectionsNavbar({ data, activeSection, onScrollToSection }: SectionsNavbarProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [clickedSection, setClickedSection] = useState<string | null>(null);
  const lastScrollTime = useRef<number>(0);
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);

  // Define sections in order with icons
  const sections: SectionItem[] = [
    { id: 'best-times', label: 'Best Times', icon: '🕐' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'visitor-info', label: 'Visitor Info', icon: 'ℹ️' },
    { id: 'tips', label: 'Tips', icon: '💡' },
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'social-videos', label: 'Videos', icon: '🎥' },
    { id: 'nearby-attractions', label: 'Nearby', icon: '📍' },
    { id: 'audience-profiles', label: 'Audience', icon: '👥' },
  ].filter((section) => {
    // Filter out sections that don't have data
    if (section.id === 'best-times' && (!data.best_time || data.best_time.length === 0)) return false;
    if (section.id === 'reviews' && !data.cards.review) return false;
    if (section.id === 'visitor-info' && !data.visitor_info) return false;
    if (section.id === 'tips' && (!data.cards.tips || (data.cards.tips.safety.length === 0 && data.cards.tips.insider.length === 0))) return false;
    if (section.id === 'map' && !data.cards.map) return false;
    if (section.id === 'social-videos' && (!data.social_videos || data.social_videos.length === 0)) return false;
    if (section.id === 'nearby-attractions' && (!data.nearby_attractions || data.nearby_attractions.length === 0)) return false;
    if (section.id === 'audience-profiles' && (!data.audience_profiles || data.audience_profiles.length === 0)) return false;
    return true;
  });

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      // Throttle to run at most once every 16ms (roughly 60fps)
      if (now - lastScrollTime.current < 16) {
        return;
      }
      lastScrollTime.current = now;

      // Check if we've scrolled past the grid section
      const gridSection = document.getElementById('storyboard-grid');
      if (gridSection) {
        const gridBottom = gridSection.offsetTop + gridSection.offsetHeight;
        const scrolledPast = window.scrollY > gridBottom - 100; // Trigger slightly before
        setIsSticky(scrolledPast);

        // Trigger visibility animation
        if (scrolledPast && !isVisible) {
          setTimeout(() => setIsVisible(true), 100);
        } else if (!scrolledPast) {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  useEffect(() => {
    if (!isSticky || !tabsContainerRef.current) return;

    const container = tabsContainerRef.current;

    // Smoothly scroll tabs back to the start
    container.scrollTo({
      left: 0,
      behavior: 'smooth',
    });
  }, [isSticky]);


  const scrollToSection = (sectionId: string) => {
    // Immediately set the clicked section as active
    setClickedSection(sectionId);

    // Use the centralized scroll function if provided, otherwise fallback
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      // Fallback to original logic
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        // Account for both main header (64px) and sections navbar (~72px) when sticky
        const mainHeaderHeight = 64;
        const sectionsNavbarHeight = 72;
        const totalOffset = mainHeaderHeight + sectionsNavbarHeight + 16; // Add 16px padding

        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - totalOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }

    // Clear clicked section after scroll completes
    setTimeout(() => setClickedSection(null), 1000);
  };

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    if (event.key === 'ArrowLeft' && currentIndex > 0) {
      event.preventDefault();
      scrollToSection(sections[currentIndex - 1].id);
    } else if (event.key === 'ArrowRight' && currentIndex < sections.length - 1) {
      event.preventDefault();
      scrollToSection(sections[currentIndex + 1].id);
    } else if (event.key === 'Home') {
      event.preventDefault();
      scrollToSection(sections[0].id);
    } else if (event.key === 'End') {
      event.preventDefault();
      scrollToSection(sections[sections.length - 1].id);
    }
  };

  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
      <nav
        className={`w-full bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-md border-b transition-all duration-500 z-50 pointer-events-none ${
          isSticky 
            ? 'fixed top-16 left-0 right-0 shadow-lg border-gray-200/80 bg-white/95' 
            : 'relative border-gray-100'
        } ${
          isVisible || isSticky ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}
        id="sections-navbar"
      >
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 pointer-events-auto">
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-2 overflow-x-auto py-4 hide-scrollbar justify-start lg:justify-center px-2"
            role="tablist"
            aria-label="Section navigation"
          >
            {sections.map((section, index) => {
              // Prioritize clicked section, then fall back to scroll-based active section
              const isActive = clickedSection === section.id || (clickedSection === null && activeSection === section.id);
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`
                    group flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold
                    transition-all duration-300 whitespace-nowrap transform hover:scale-105 active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    ${
                      isActive
                        ? 'bg-white text-primary-600 border border-gray-200 shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary-200 hover:text-primary-600 shadow-sm hover:shadow-md'
                    }
                  `}
                  style={{
                    animation: isVisible ? `slideInUp 0.4s ease-out ${index * 0.05}s both` : 'none',
                  }}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`section-${section.id}`}
                  aria-label={`Scroll to ${section.label} section`}
                  tabIndex={isActive ? 0 : -1}
                >
                  {section.icon && (
                    <span className={`text-base transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} aria-hidden="true">
                      {section.icon}
                    </span>
                  )}
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

