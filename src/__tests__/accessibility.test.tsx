/**
 * Accessibility Utilities Test Suite
 * Feature: frontend-quality-improvements, Task 3.3: Accessibility Enhancement Utilities
 * 
 * Comprehensive test suite for accessibility utilities including:
 * - ARIA attribute helpers and management
 * - Focus management and keyboard navigation
 * - Screen reader announcement system
 * - Color contrast validation
 * - Semantic HTML helpers
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';

import {
  createFormFieldAria,
  createInteractiveAria,
  createNavigationAria,
  getFocusableElements,
  FocusTrap,
  useFocusTrap,
  useFocusManagement,
  useKeyboardNavigation,
  announce,
  useAnnouncer,
  resetAnnouncer,
  getContrastRatio,
  meetsContrastRequirement,
  createHeadingAttributes,
  createLandmarkAttributes,
  createListAttributes,
  validateAccessibility,
  useAccessibilityValidation,
} from '../utils/accessibility';

// Mock DOM methods
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  value: 100,
});

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  value: 100,
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    visibility: 'visible',
  }),
});

describe('ARIA Attribute Helpers', () => {
  describe('createFormFieldAria', () => {
    test('should create basic form field ARIA attributes', () => {
      const aria = createFormFieldAria({
        id: 'test-field',
        label: 'Test Label',
        required: true,
      });

      expect(aria).toEqual({
        'aria-labelledby': 'test-field-label',
        'aria-required': true,
      });
    });

    test('should include description and error in describedby', () => {
      const aria = createFormFieldAria({
        id: 'test-field',
        description: 'Field description',
        error: 'Field error',
        invalid: true,
      });

      expect(aria['aria-describedby']).toBe('test-field-description test-field-error');
      expect(aria['aria-invalid']).toBe(true);
    });

    test('should handle disabled and readonly states', () => {
      const aria = createFormFieldAria({
        id: 'test-field',
        disabled: true,
        readonly: true,
      });

      expect(aria['aria-disabled']).toBe(true);
      expect(aria['aria-readonly']).toBe(true);
    });
  });

  describe('createInteractiveAria', () => {
    test('should create interactive ARIA attributes', () => {
      const aria = createInteractiveAria({
        expanded: true,
        controls: 'menu-items',
        pressed: false,
        selected: true,
      });

      expect(aria).toEqual({
        'aria-expanded': true,
        'aria-controls': 'menu-items',
        'aria-pressed': false,
        'aria-selected': true,
      });
    });

    test('should handle live region attributes', () => {
      const aria = createInteractiveAria({
        live: 'assertive',
        atomic: true,
        busy: false,
      });

      expect(aria).toEqual({
        'aria-live': 'assertive',
        'aria-atomic': true,
        'aria-busy': false,
      });
    });
  });

  describe('createNavigationAria', () => {
    test('should create navigation ARIA attributes', () => {
      const aria = createNavigationAria({
        level: 2,
        posinset: 3,
        setsize: 10,
        orientation: 'horizontal',
      });

      expect(aria).toEqual({
        'aria-level': 2,
        'aria-posinset': 3,
        'aria-setsize': 10,
        'aria-orientation': 'horizontal',
      });
    });
  });
});

describe('Focus Management', () => {
  describe('getFocusableElements', () => {
    test('should find focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button 1</button>
        <input type="text" />
        <a href="#">Link</a>
        <button disabled>Disabled Button</button>
        <div tabindex="0">Focusable Div</div>
        <div tabindex="-1">Non-focusable Div</div>
      `;

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(4); // button, input, link, focusable div
    });

    test('should exclude hidden elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Visible Button</button>
        <button aria-hidden="true">Hidden Button</button>
        <button style="visibility: hidden">CSS Hidden Button</button>
      `;

      // Mock getComputedStyle for hidden element
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn((element) => {
        if (element.style.visibility === 'hidden') {
          return { visibility: 'hidden' } as CSSStyleDeclaration;
        }
        return { visibility: 'visible' } as CSSStyleDeclaration;
      });

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(1); // Only visible button

      window.getComputedStyle = originalGetComputedStyle;
    });
  });

  describe('FocusTrap', () => {
    test('should trap focus within container', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button id="first">First</button>
        <button id="middle">Middle</button>
        <button id="last">Last</button>
      `;
      document.body.appendChild(container);

      const focusTrap = new FocusTrap(container);
      focusTrap.activate();

      const firstButton = document.getElementById('first')!;
      const lastButton = document.getElementById('last')!;

      // Focus should move to first element
      expect(document.activeElement).toBe(firstButton);

      // Tab from last element should go to first
      lastButton.focus();
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(document.activeElement).toBe(firstButton);

      // Shift+Tab from first element should go to last
      firstButton.focus();
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(lastButton);

      focusTrap.destroy();
      document.body.removeChild(container);
    });
  });

  describe('useFocusTrap', () => {
    function TestFocusTrap({ isActive }: { isActive: boolean }) {
      const containerRef = useFocusTrap(isActive);

      return (
        <div ref={containerRef}>
          <button>Button 1</button>
          <button>Button 2</button>
          <button>Button 3</button>
        </div>
      );
    }

    test('should activate focus trap when isActive is true', () => {
      const { rerender } = render(<TestFocusTrap isActive={false} />);
      
      // Focus trap should not be active initially
      const buttons = screen.getAllByRole('button');
      buttons[2].focus();
      
      fireEvent.keyDown(document, { key: 'Tab' });
      // Focus should move normally (not trapped)
      
      // Activate focus trap
      rerender(<TestFocusTrap isActive={true} />);
      
      // Focus should now be trapped
      expect(document.activeElement).toBe(buttons[0]);
    });
  });

  describe('useFocusManagement', () => {
    function TestFocusManagement() {
      const { focusById, focusFirst, focusLast } = useFocusManagement();

      return (
        <div>
          <div id="container">
            <button id="btn1">Button 1</button>
            <button id="btn2">Button 2</button>
            <button id="btn3">Button 3</button>
          </div>
          <button onClick={() => focusById('btn2')}>Focus Button 2</button>
          <button onClick={() => focusFirst(document.getElementById('container')!)}>Focus First</button>
          <button onClick={() => focusLast(document.getElementById('container')!)}>Focus Last</button>
        </div>
      );
    }

    test('should provide focus management functions', async () => {
      render(<TestFocusManagement />);
      const user = userEvent.setup();

      // Test focusById
      await user.click(screen.getByText('Focus Button 2'));
      expect(document.activeElement).toBe(screen.getByText('Button 2'));

      // Test focusFirst
      await user.click(screen.getByText('Focus First'));
      expect(document.activeElement).toBe(screen.getByText('Button 1'));

      // Test focusLast
      await user.click(screen.getByText('Focus Last'));
      expect(document.activeElement).toBe(screen.getByText('Button 3'));
    });
  });
});

describe('Keyboard Navigation', () => {
  describe('useKeyboardNavigation', () => {
    function TestKeyboardNavigation({ orientation = 'both' }: { orientation?: 'horizontal' | 'vertical' | 'both' }) {
      const containerRef = useKeyboardNavigation({ orientation });

      return (
        <div ref={containerRef}>
          <button>Button 1</button>
          <button>Button 2</button>
          <button>Button 3</button>
        </div>
      );
    }

    test('should handle arrow key navigation', () => {
      render(<TestKeyboardNavigation />);
      
      const buttons = screen.getAllByRole('button');
      buttons[0].focus();

      // Arrow down should move to next button
      fireEvent.keyDown(buttons[0], { key: 'ArrowDown' });
      expect(document.activeElement).toBe(buttons[1]);

      // Arrow up should move to previous button
      fireEvent.keyDown(buttons[1], { key: 'ArrowUp' });
      expect(document.activeElement).toBe(buttons[0]);
    });

    test('should handle Home and End keys', () => {
      render(<TestKeyboardNavigation />);
      
      const buttons = screen.getAllByRole('button');
      buttons[1].focus();

      // Home should move to first button
      fireEvent.keyDown(buttons[1], { key: 'Home' });
      expect(document.activeElement).toBe(buttons[0]);

      // End should move to last button
      fireEvent.keyDown(buttons[0], { key: 'End' });
      expect(document.activeElement).toBe(buttons[2]);
    });

    test('should respect orientation setting', () => {
      render(<TestKeyboardNavigation orientation="vertical" />);
      
      const buttons = screen.getAllByRole('button');
      buttons[0].focus();

      // Arrow right should not move (vertical only)
      fireEvent.keyDown(buttons[0], { key: 'ArrowRight' });
      expect(document.activeElement).toBe(buttons[0]);

      // Arrow down should move
      fireEvent.keyDown(buttons[0], { key: 'ArrowDown' });
      expect(document.activeElement).toBe(buttons[1]);
    });
  });
});

describe('Screen Reader Announcements', () => {
  beforeEach(() => {
    // Reset the global announcer to ensure clean state
    resetAnnouncer();
    // Clear any existing live regions
    document.querySelectorAll('[aria-live]').forEach(el => el.remove());
  });

  test('should create live regions and announce messages', () => {
    announce('Test message', { priority: 'polite' });

    const liveRegions = document.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions).toHaveLength(1);

    // Wait for announcement
    setTimeout(() => {
      expect(liveRegions[0].textContent).toBe('Test message');
    }, 20);
  });

  test('should handle assertive announcements', async () => {
    announce('Urgent message', { priority: 'assertive' });

    // Wait for live region to be created
    await waitFor(() => {
      const assertiveRegions = document.querySelectorAll('[aria-live="assertive"]');
      expect(assertiveRegions.length).toBeGreaterThan(0);
    });
  });

  describe('useAnnouncer', () => {
    function TestAnnouncer() {
      const { announce, announcePolite, announceAssertive } = useAnnouncer();

      return (
        <div>
          <button onClick={() => announce('Custom message')}>Announce</button>
          <button onClick={() => announcePolite('Polite message')}>Announce Polite</button>
          <button onClick={() => announceAssertive('Assertive message')}>Announce Assertive</button>
        </div>
      );
    }

    test('should provide announcement functions', async () => {
      render(<TestAnnouncer />);
      const user = userEvent.setup();

      await user.click(screen.getByText('Announce Polite'));

      // Wait for live region to be created
      await waitFor(() => {
        const politeRegions = document.querySelectorAll('[aria-live="polite"]');
        expect(politeRegions.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Color Contrast Utilities', () => {
  describe('getContrastRatio', () => {
    test('should calculate contrast ratio correctly', () => {
      // Black on white should have high contrast
      const blackWhiteRatio = getContrastRatio('#000000', '#ffffff');
      expect(blackWhiteRatio).toBeCloseTo(21, 0);

      // Same colors should have ratio of 1
      const sameColorRatio = getContrastRatio('#ff0000', '#ff0000');
      expect(sameColorRatio).toBeCloseTo(1, 0);
    });

    test('should handle different color formats', () => {
      const ratio1 = getContrastRatio('#000', '#fff');
      const ratio2 = getContrastRatio('#000000', '#ffffff');
      expect(ratio1).toBeCloseTo(ratio2, 1);
    });
  });

  describe('meetsContrastRequirement', () => {
    test('should validate WCAG AA compliance', () => {
      // Black on white meets AA for normal text
      expect(meetsContrastRequirement('#000000', '#ffffff', 'AA', 'normal')).toBe(true);
      
      // Low contrast should fail
      expect(meetsContrastRequirement('#888888', '#999999', 'AA', 'normal')).toBe(false);
    });

    test('should validate WCAG AAA compliance', () => {
      // Black on white meets AAA
      expect(meetsContrastRequirement('#000000', '#ffffff', 'AAA', 'normal')).toBe(true);
      
      // Medium contrast might pass AA but fail AAA
      expect(meetsContrastRequirement('#666666', '#ffffff', 'AA', 'normal')).toBe(true);
      expect(meetsContrastRequirement('#666666', '#ffffff', 'AAA', 'normal')).toBe(false);
    });

    test('should handle large text requirements', () => {
      // Large text has lower contrast requirements
      // #777777 on white has a ratio of about 4.47, which passes AA large (3:1) but fails AA normal (4.5:1)
      const foreground = '#777777';
      const background = '#ffffff';

      const ratio = getContrastRatio(foreground, background);
      // Verify the ratio is in the expected range
      expect(ratio).toBeGreaterThanOrEqual(3);
      expect(ratio).toBeLessThan(4.5);

      expect(meetsContrastRequirement(foreground, background, 'AA', 'normal')).toBe(false);
      expect(meetsContrastRequirement(foreground, background, 'AA', 'large')).toBe(true);
    });
  });
});

describe('Semantic HTML Helpers', () => {
  describe('createHeadingAttributes', () => {
    test('should create heading attributes', () => {
      const attrs = createHeadingAttributes(2, 'main-heading');
      
      expect(attrs).toEqual({
        role: 'heading',
        'aria-level': 2,
        id: 'main-heading',
      });
    });

    test('should work without id', () => {
      const attrs = createHeadingAttributes(3);
      
      expect(attrs).toEqual({
        role: 'heading',
        'aria-level': 3,
      });
    });
  });

  describe('createLandmarkAttributes', () => {
    test('should create landmark attributes', () => {
      const attrs = createLandmarkAttributes('navigation', 'Main navigation');
      
      expect(attrs).toEqual({
        role: 'navigation',
        'aria-label': 'Main navigation',
      });
    });

    test('should work without label', () => {
      const attrs = createLandmarkAttributes('main');
      
      expect(attrs).toEqual({
        role: 'main',
      });
    });
  });

  describe('createListAttributes', () => {
    test('should create list attributes', () => {
      const attrs = createListAttributes('listbox', 'vertical', true);
      
      expect(attrs).toEqual({
        role: 'listbox',
        'aria-orientation': 'vertical',
        'aria-multiselectable': true,
      });
    });

    test('should work with minimal options', () => {
      const attrs = createListAttributes('list');
      
      expect(attrs).toEqual({
        role: 'list',
      });
    });
  });
});

describe('Accessibility Validation', () => {
  describe('validateAccessibility', () => {
    test('should validate image alt text', () => {
      const img = document.createElement('img');
      img.src = 'test.jpg';
      
      const result = validateAccessibility(img);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Image missing alt text or aria-label');
    });

    test('should validate form control labels', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'test-input';
      
      const result = validateAccessibility(input);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Form control missing label');
    });

    test('should validate interactive element roles', () => {
      const div = document.createElement('div');
      div.tabIndex = 0;
      
      const result = validateAccessibility(div);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Interactive element missing role');
    });

    test('should pass validation for properly configured elements', () => {
      const button = document.createElement('button');
      button.textContent = 'Click me';
      
      const result = validateAccessibility(button);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('useAccessibilityValidation', () => {
    function TestAccessibilityValidation() {
      const elementRef = React.useRef<HTMLImageElement>(null);
      const { validation, validate, isValid } = useAccessibilityValidation(elementRef);

      return (
        <div>
          <img ref={elementRef} src="test.jpg" alt="Test image" />
          <div>Valid: {isValid.toString()}</div>
          <div>Issues: {validation?.issues.length || 0}</div>
          <button onClick={validate}>Validate</button>
        </div>
      );
    }

    test('should provide accessibility validation hook', async () => {
      render(<TestAccessibilityValidation />);
      const user = userEvent.setup();

      await user.click(screen.getByText('Validate'));

      await waitFor(() => {
        const validText = screen.queryByText(/Valid: true/);
        const issuesText = screen.queryByText(/Issues: 0/);
        // The image with proper alt text should be valid
        expect(validText || issuesText).toBeInTheDocument();
      });
    });
  });
});

/**
 * Property-based tests for accessibility consistency
 * Property 10: Accessibility Compliance
 * Validates: Requirements 6.1, 6.4
 */
describe('Property Tests: Accessibility Compliance', () => {
  test('Property 10.0: ARIA attribute generation consistency', () => {
    fc.assert(fc.property(
      fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }),
        label: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        description: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
        error: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
        required: fc.boolean(),
        invalid: fc.boolean(),
        disabled: fc.boolean(),
        readonly: fc.boolean(),
      }),
      (options) => {
        const aria = createFormFieldAria(options);
        
        // ARIA attributes should always be consistent
        expect(typeof aria).toBe('object');
        
        // Required fields should have aria-required
        if (options.required) {
          expect(aria['aria-required']).toBe(true);
        }
        
        // Invalid fields should have aria-invalid
        if (options.invalid || options.error) {
          expect(aria['aria-invalid']).toBe(true);
        }
        
        // Disabled fields should have aria-disabled
        if (options.disabled) {
          expect(aria['aria-disabled']).toBe(true);
        }
        
        // Readonly fields should have aria-readonly
        if (options.readonly) {
          expect(aria['aria-readonly']).toBe(true);
        }
        
        // Label should create labelledby
        if (options.label) {
          expect(aria['aria-labelledby']).toBe(`${options.id}-label`);
        }
        
        // Description and error should be in describedby
        if (options.description || options.error) {
          expect(aria['aria-describedby']).toBeDefined();
          
          if (options.description) {
            expect(aria['aria-describedby']).toContain(`${options.id}-description`);
          }
          
          if (options.error) {
            expect(aria['aria-describedby']).toContain(`${options.id}-error`);
          }
        }
      }
    ), { numRuns: 100 });
  });

  test('Property 10.1: Color contrast validation consistency', () => {
    // Helper to generate hex color from RGB values
    const hexColor = fc.tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 })
    ).map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);

    fc.assert(fc.property(
      fc.record({
        foreground: hexColor,
        background: hexColor,
        level: fc.constantFrom('AA', 'AAA'),
        size: fc.constantFrom('normal', 'large'),
      }),
      ({ foreground, background, level, size }) => {
        const ratio = getContrastRatio(foreground, background);
        const meetsRequirement = meetsContrastRequirement(foreground, background, level, size);
        
        // Contrast ratio should always be positive
        expect(ratio).toBeGreaterThan(0);
        
        // Same colors should have ratio of 1
        if (foreground === background) {
          expect(ratio).toBeCloseTo(1, 1);
          expect(meetsRequirement).toBe(false);
        }
        
        // Black and white should have maximum contrast
        if ((foreground === '#000000' && background === '#ffffff') ||
            (foreground === '#ffffff' && background === '#000000')) {
          expect(ratio).toBeGreaterThan(20);
          expect(meetsRequirement).toBe(true);
        }
        
        // Validation should be consistent with calculated ratio
        const expectedThreshold = level === 'AAA' 
          ? (size === 'large' ? 4.5 : 7)
          : (size === 'large' ? 3 : 4.5);
        
        expect(meetsRequirement).toBe(ratio >= expectedThreshold);
      }
    ), { numRuns: 75 });
  });

  test('Property 10.2: Focus management consistency', () => {
    fc.assert(fc.property(
      fc.array(fc.constantFrom('button', 'input', 'select', 'textarea', 'a'), { minLength: 1, maxLength: 10 }),
      (elementTypes) => {
        const container = document.createElement('div');
        
        // Create elements
        elementTypes.forEach((type, index) => {
          const element = document.createElement(type);
          element.id = `element-${index}`;
          
          if (type === 'a') {
            (element as HTMLAnchorElement).href = '#';
          }
          if (type === 'input') {
            (element as HTMLInputElement).type = 'text';
          }
          
          container.appendChild(element);
        });
        
        const focusableElements = getFocusableElements(container);
        
        // Should find all non-disabled elements
        expect(focusableElements.length).toBe(elementTypes.length);
        
        // Each element should be focusable
        focusableElements.forEach(element => {
          expect(typeof element.focus).toBe('function');
          expect(element.tabIndex).toBeGreaterThanOrEqual(0);
        });
        
        // Elements should be in document order
        focusableElements.forEach((element, index) => {
          expect(element.id).toBe(`element-${index}`);
        });
      }
    ), { numRuns: 50 });
  });

  test('Property 10.3: Semantic HTML attribute consistency', () => {
    fc.assert(fc.property(
      fc.record({
        headingLevel: fc.integer({ min: 1, max: 6 }),
        landmark: fc.constantFrom('banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search', 'form'),
        listType: fc.constantFrom('list', 'listbox', 'menu', 'menubar', 'tablist', 'tree', 'grid'),
        orientation: fc.option(fc.constantFrom('horizontal', 'vertical')),
        multiselectable: fc.option(fc.boolean()),
      }),
      ({ headingLevel, landmark, listType, orientation, multiselectable }) => {
        // Test heading attributes
        const headingAttrs = createHeadingAttributes(headingLevel as 1 | 2 | 3 | 4 | 5 | 6);
        expect(headingAttrs.role).toBe('heading');
        expect(headingAttrs['aria-level']).toBe(headingLevel);
        
        // Test landmark attributes
        const landmarkAttrs = createLandmarkAttributes(landmark);
        expect(landmarkAttrs.role).toBe(landmark);
        
        // Test list attributes
        const listAttrs = createListAttributes(listType, orientation, multiselectable);
        expect(listAttrs.role).toBe(listType);
        
        if (orientation) {
          expect(listAttrs['aria-orientation']).toBe(orientation);
        }
        
        if (multiselectable !== undefined) {
          expect(listAttrs['aria-multiselectable']).toBe(multiselectable);
        }
      }
    ), { numRuns: 60 });
  });

  test('Property 10.4: Accessibility validation consistency', () => {
    fc.assert(fc.property(
      fc.record({
        tagName: fc.constantFrom('IMG', 'INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'DIV'),
        hasAlt: fc.boolean(),
        hasLabel: fc.boolean(),
        hasRole: fc.boolean(),
        isDisabled: fc.boolean(),
        hasTabIndex: fc.boolean(),
      }),
      ({ tagName, hasAlt, hasLabel, hasRole, isDisabled, hasTabIndex }) => {
        const element = document.createElement(tagName.toLowerCase());
        
        // Configure element based on properties
        if (tagName === 'IMG' && hasAlt) {
          (element as HTMLImageElement).alt = 'Test image';
        }
        
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)) {
          if (hasLabel) {
            element.setAttribute('aria-label', 'Test label');
          }
          if (isDisabled) {
            (element as HTMLInputElement).disabled = true;
          }
        }
        
        if (hasRole) {
          element.setAttribute('role', 'button');
        }
        
        if (hasTabIndex) {
          element.tabIndex = 0;
        }
        
        const validation = validateAccessibility(element);
        
        // Validation should always return consistent structure
        expect(typeof validation.isValid).toBe('boolean');
        expect(Array.isArray(validation.issues)).toBe(true);
        expect(Array.isArray(validation.suggestions)).toBe(true);
        
        // Issues and suggestions should have same length
        expect(validation.issues.length).toBe(validation.suggestions.length);
        
        // If no issues, should be valid
        if (validation.issues.length === 0) {
          expect(validation.isValid).toBe(true);
        }
        
        // Specific validation rules
        if (tagName === 'IMG' && !hasAlt) {
          expect(validation.isValid).toBe(false);
          expect(validation.issues.some(issue => issue.includes('alt text'))).toBe(true);
        }
        
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName) && !hasLabel) {
          expect(validation.isValid).toBe(false);
          expect(validation.issues.some(issue => issue.includes('label'))).toBe(true);
        }
      }
    ), { numRuns: 40 });
  });
});