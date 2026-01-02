/**
 * Accessibility Enhancement Utilities
 * Feature: frontend-quality-improvements, Task 3.3: Accessibility Enhancement Utilities
 * 
 * Comprehensive accessibility utilities including:
 * - ARIA attribute helpers and management
 * - Focus management and keyboard navigation
 * - Screen reader announcement system
 * - Color contrast and visual accessibility
 * - Semantic HTML helpers
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ARIA Attribute Helpers
 */

export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-pressed'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-required'?: boolean;
  'aria-readonly'?: boolean;
  'aria-multiline'?: boolean;
  'aria-multiselectable'?: boolean;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-level'?: number;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
  role?: string;
}

/**
 * Generate ARIA attributes for form fields
 */
export function createFormFieldAria(options: {
  id: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}): AriaAttributes {
  const { id, label, description, error, required, invalid, disabled, readonly } = options;
  
  const aria: AriaAttributes = {};
  
  if (label && !aria['aria-labelledby']) {
    aria['aria-labelledby'] = `${id}-label`;
  }
  
  const describedBy: string[] = [];
  if (description) {
    describedBy.push(`${id}-description`);
  }
  if (error) {
    describedBy.push(`${id}-error`);
  }
  if (describedBy.length > 0) {
    aria['aria-describedby'] = describedBy.join(' ');
  }
  
  if (required) {
    aria['aria-required'] = true;
  }
  
  if (invalid || error) {
    aria['aria-invalid'] = true;
  }
  
  if (disabled) {
    aria['aria-disabled'] = true;
  }
  
  if (readonly) {
    aria['aria-readonly'] = true;
  }
  
  return aria;
}

/**
 * Generate ARIA attributes for interactive elements
 */
export function createInteractiveAria(options: {
  expanded?: boolean;
  controls?: string;
  pressed?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  disabled?: boolean;
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  live?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
  busy?: boolean;
}): AriaAttributes {
  const aria: AriaAttributes = {};
  
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      const ariaKey = key === 'live' ? 'aria-live' : 
                     key === 'atomic' ? 'aria-atomic' :
                     key === 'busy' ? 'aria-busy' :
                     `aria-${key}` as keyof AriaAttributes;
      (aria as any)[ariaKey] = value;
    }
  });
  
  return aria;
}

/**
 * Generate ARIA attributes for navigation elements
 */
export function createNavigationAria(options: {
  level?: number;
  posinset?: number;
  setsize?: number;
  orientation?: 'horizontal' | 'vertical';
  sort?: 'none' | 'ascending' | 'descending' | 'other';
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
}): AriaAttributes {
  const aria: AriaAttributes = {};
  
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      const ariaKey = `aria-${key}` as keyof AriaAttributes;
      (aria as any)[ariaKey] = value;
    }
  });
  
  return aria;
}

/**
 * Focus Management Utilities
 */

export interface FocusableElement extends HTMLElement {
  focus(): void;
  blur(): void;
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): FocusableElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'iframe',
    'object',
    'embed',
    'area[href]',
    'summary',
  ].join(', ');
  
  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter((element) => {
      const el = element as HTMLElement;
      return (
        el.offsetWidth > 0 &&
        el.offsetHeight > 0 &&
        !el.hasAttribute('aria-hidden') &&
        window.getComputedStyle(el).visibility !== 'hidden'
      );
    }) as FocusableElement[];
}

/**
 * Focus trap for modal dialogs and dropdowns
 */
export class FocusTrap {
  private container: HTMLElement;
  private focusableElements: FocusableElement[];
  private firstFocusable: FocusableElement | null = null;
  private lastFocusable: FocusableElement | null = null;
  private previouslyFocused: HTMLElement | null = null;
  private isActive = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.focusableElements = [];
    this.updateFocusableElements();
  }

  private updateFocusableElements(): void {
    this.focusableElements = getFocusableElements(this.container);
    this.firstFocusable = this.focusableElements[0] || null;
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    this.updateFocusableElements();

    if (this.focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  };

  activate(): void {
    if (this.isActive) return;

    this.previouslyFocused = document.activeElement as HTMLElement;
    this.updateFocusableElements();
    
    if (this.firstFocusable) {
      this.firstFocusable.focus();
    }

    document.addEventListener('keydown', this.handleKeyDown);
    this.isActive = true;
  }

  deactivate(): void {
    if (!this.isActive) return;

    document.removeEventListener('keydown', this.handleKeyDown);
    
    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
    }

    this.isActive = false;
  }

  destroy(): void {
    this.deactivate();
  }
}

/**
 * React hook for focus trap
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!focusTrapRef.current) {
      focusTrapRef.current = new FocusTrap(containerRef.current);
    }

    if (isActive) {
      focusTrapRef.current.activate();
    } else {
      focusTrapRef.current.deactivate();
    }

    return () => {
      focusTrapRef.current?.destroy();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * React hook for focus management
 */
export function useFocusManagement() {
  const focusElement = useCallback((element: HTMLElement | null, options?: FocusOptions) => {
    if (element) {
      element.focus(options);
    }
  }, []);

  const focusById = useCallback((id: string, options?: FocusOptions) => {
    const element = document.getElementById(id);
    focusElement(element, options);
  }, [focusElement]);

  const focusFirst = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, []);

  const focusLast = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, []);

  return {
    focusElement,
    focusById,
    focusFirst,
    focusLast,
  };
}

/**
 * Keyboard Navigation Utilities
 */

export interface KeyboardNavigationOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  wrap?: boolean;
  homeEndKeys?: boolean;
  typeahead?: boolean;
  onNavigate?: (element: HTMLElement, direction: string) => void;
}

/**
 * React hook for keyboard navigation
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    orientation = 'both',
    wrap = true,
    homeEndKeys = true,
    typeahead = false,
    onNavigate,
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const typeaheadRef = useRef<string>('');
  const typeaheadTimeoutRef = useRef<NodeJS.Timeout>();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
    
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    let handled = false;

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          nextIndex = currentIndex + 1;
          if (nextIndex >= focusableElements.length) {
            nextIndex = wrap ? 0 : focusableElements.length - 1;
          }
          handled = true;
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = wrap ? focusableElements.length - 1 : 0;
          }
          handled = true;
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          nextIndex = currentIndex + 1;
          if (nextIndex >= focusableElements.length) {
            nextIndex = wrap ? 0 : focusableElements.length - 1;
          }
          handled = true;
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = wrap ? focusableElements.length - 1 : 0;
          }
          handled = true;
        }
        break;

      case 'Home':
        if (homeEndKeys) {
          nextIndex = 0;
          handled = true;
        }
        break;

      case 'End':
        if (homeEndKeys) {
          nextIndex = focusableElements.length - 1;
          handled = true;
        }
        break;

      default:
        if (typeahead && event.key.length === 1) {
          // Clear previous timeout
          if (typeaheadTimeoutRef.current) {
            clearTimeout(typeaheadTimeoutRef.current);
          }

          // Add to typeahead string
          typeaheadRef.current += event.key.toLowerCase();

          // Find matching element
          const matchingIndex = focusableElements.findIndex((el, index) => {
            if (index <= currentIndex) return false;
            const text = el.textContent?.toLowerCase() || '';
            return text.startsWith(typeaheadRef.current);
          });

          if (matchingIndex !== -1) {
            nextIndex = matchingIndex;
            handled = true;
          }

          // Clear typeahead after delay
          typeaheadTimeoutRef.current = setTimeout(() => {
            typeaheadRef.current = '';
          }, 1000);
        }
        break;
    }

    if (handled && nextIndex !== currentIndex) {
      event.preventDefault();
      const nextElement = focusableElements[nextIndex];
      nextElement.focus();
      onNavigate?.(nextElement, event.key);
    }
  }, [orientation, wrap, homeEndKeys, typeahead, onNavigate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (typeaheadTimeoutRef.current) {
        clearTimeout(typeaheadTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  return containerRef;
}

/**
 * Screen Reader Announcement System
 */

export interface AnnouncementOptions {
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
  delay?: number;
}

class ScreenReaderAnnouncer {
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;

  constructor() {
    this.createLiveRegions();
  }

  private createLiveRegions(): void {
    // Create polite live region
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.setAttribute('aria-relevant', 'text');
    this.politeRegion.className = 'sr-only';
    this.politeRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

    // Create assertive live region
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.setAttribute('aria-relevant', 'text');
    this.assertiveRegion.className = 'sr-only';
    this.assertiveRegion.style.cssText = this.politeRegion.style.cssText;

    // Add to document
    document.body.appendChild(this.politeRegion);
    document.body.appendChild(this.assertiveRegion);
  }

  announce(message: string, options: AnnouncementOptions = {}): void {
    const { priority = 'polite', atomic = true, delay = 0 } = options;
    
    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
    
    if (!region) return;

    // Set atomic attribute if specified
    if (atomic !== undefined) {
      region.setAttribute('aria-atomic', atomic.toString());
    }

    const announceMessage = () => {
      // Clear previous message
      region.textContent = '';
      
      // Use setTimeout to ensure screen readers pick up the change
      setTimeout(() => {
        region.textContent = message;
      }, 10);
    };

    if (delay > 0) {
      setTimeout(announceMessage, delay);
    } else {
      announceMessage();
    }
  }

  destroy(): void {
    if (this.politeRegion) {
      document.body.removeChild(this.politeRegion);
      this.politeRegion = null;
    }
    if (this.assertiveRegion) {
      document.body.removeChild(this.assertiveRegion);
      this.assertiveRegion = null;
    }
  }
}

// Global announcer instance
let globalAnnouncer: ScreenReaderAnnouncer | null = null;

/**
 * Get or create global screen reader announcer
 */
function getAnnouncer(): ScreenReaderAnnouncer {
  if (!globalAnnouncer) {
    globalAnnouncer = new ScreenReaderAnnouncer();
  }
  return globalAnnouncer;
}

/**
 * Reset the global announcer (for testing)
 */
export function resetAnnouncer(): void {
  if (globalAnnouncer) {
    globalAnnouncer.destroy();
    globalAnnouncer = null;
  }
}

/**
 * Announce message to screen readers
 */
export function announce(message: string, options?: AnnouncementOptions): void {
  if (typeof window === 'undefined') return;

  const announcer = getAnnouncer();
  announcer.announce(message, options);
}

/**
 * React hook for screen reader announcements
 */
export function useAnnouncer() {
  const announceMessage = useCallback((message: string, options?: AnnouncementOptions) => {
    announce(message, options);
  }, []);

  const announcePolite = useCallback((message: string) => {
    announceMessage(message, { priority: 'polite' });
  }, [announceMessage]);

  const announceAssertive = useCallback((message: string) => {
    announceMessage(message, { priority: 'assertive' });
  }, [announceMessage]);

  return {
    announce: announceMessage,
    announcePolite,
    announceAssertive,
  };
}

/**
 * Color Contrast and Visual Accessibility Utilities
 */

/**
 * Calculate relative luminance of a color
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Parse hex colors and expand 3-char format to 6-char
  let hex1 = color1.replace('#', '');
  let hex2 = color2.replace('#', '');

  // Expand 3-character hex to 6-character
  if (hex1.length === 3) {
    hex1 = hex1[0] + hex1[0] + hex1[1] + hex1[1] + hex1[2] + hex1[2];
  }
  if (hex2.length === 3) {
    hex2 = hex2[0] + hex2[0] + hex2[1] + hex2[1] + hex2[2] + hex2[2];
  }

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  // Handle invalid colors
  if (isNaN(r1) || isNaN(g1) || isNaN(b1) || isNaN(r2) || isNaN(g2) || isNaN(b2)) {
    return 1; // Return minimum contrast ratio for invalid colors
  }

  const lum1 = getRelativeLuminance(r1, g1, b1);
  const lum2 = getRelativeLuminance(r2, g2, b2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG contrast requirements
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  } else {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
}

/**
 * Semantic HTML Helpers
 */

/**
 * Generate semantic heading attributes
 */
export function createHeadingAttributes(level: 1 | 2 | 3 | 4 | 5 | 6, id?: string): {
  role: string;
  'aria-level': number;
  id?: string;
} {
  return {
    role: 'heading',
    'aria-level': level,
    ...(id && { id }),
  };
}

/**
 * Generate landmark attributes
 */
export function createLandmarkAttributes(
  landmark: 'banner' | 'navigation' | 'main' | 'complementary' | 'contentinfo' | 'search' | 'form',
  label?: string
): {
  role: string;
  'aria-label'?: string;
} {
  return {
    role: landmark,
    ...(label && { 'aria-label': label }),
  };
}

/**
 * Generate list attributes
 */
export function createListAttributes(
  type: 'list' | 'listbox' | 'menu' | 'menubar' | 'tablist' | 'tree' | 'grid',
  orientation?: 'horizontal' | 'vertical',
  multiselectable?: boolean
): AriaAttributes {
  const attributes: AriaAttributes = {
    role: type,
  };
  
  if (orientation) {
    attributes['aria-orientation'] = orientation;
  }
  
  if (multiselectable !== undefined) {
    attributes['aria-multiselectable'] = multiselectable;
  }
  
  return attributes;
}

/**
 * Accessibility Testing Utilities
 */

/**
 * Check if element has proper accessibility attributes
 */
export function validateAccessibility(element: HTMLElement): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check for missing alt text on images
  if (element.tagName === 'IMG') {
    const img = element as HTMLImageElement;
    if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
      issues.push('Image missing alt text or aria-label');
      suggestions.push('Add alt attribute or aria-label to describe the image');
    }
  }
  
  // Check for missing labels on form controls
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
    const hasLabel = element.getAttribute('aria-label') ||
                    element.getAttribute('aria-labelledby') ||
                    document.querySelector(`label[for="${element.id}"]`);
    
    if (!hasLabel) {
      issues.push('Form control missing label');
      suggestions.push('Add aria-label, aria-labelledby, or associate with a label element');
    }
  }
  
  // Check for missing roles on interactive elements
  if (element.getAttribute('tabindex') === '0' && !element.getAttribute('role')) {
    const interactiveRoles = ['button', 'link', 'menuitem', 'tab', 'option'];
    if (!interactiveRoles.includes(element.tagName.toLowerCase())) {
      issues.push('Interactive element missing role');
      suggestions.push('Add appropriate role attribute (button, link, etc.)');
    }
  }
  
  // Check for proper heading hierarchy
  if (element.tagName.match(/^H[1-6]$/)) {
    const level = parseInt(element.tagName.charAt(1));
    const previousHeading = element.previousElementSibling?.closest('h1, h2, h3, h4, h5, h6');
    
    if (previousHeading) {
      const previousLevel = parseInt(previousHeading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push('Heading hierarchy skips levels');
        suggestions.push('Use sequential heading levels (h1, h2, h3, etc.)');
      }
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * React hook for accessibility validation
 */
export function useAccessibilityValidation(elementRef: React.RefObject<HTMLElement>) {
  const [validation, setValidation] = useState<ReturnType<typeof validateAccessibility> | null>(null);
  
  const validate = useCallback(() => {
    if (elementRef.current) {
      const result = validateAccessibility(elementRef.current);
      setValidation(result);
      return result;
    }
    return null;
  }, [elementRef]);
  
  useEffect(() => {
    validate();
  }, [validate]);
  
  return {
    validation,
    validate,
    isValid: validation?.isValid ?? true,
    issues: validation?.issues ?? [],
    suggestions: validation?.suggestions ?? [],
  };
}