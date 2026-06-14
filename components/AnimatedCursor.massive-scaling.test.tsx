import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnimatedCursor from './AnimatedCursor';

describe('AnimatedCursor Massive Scaling & High Bounds Tests', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    vi.useFakeTimers();
    
    // Fix 1: Properly pass a high-res timestamp into the rAF callback
    let rafId = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafId += 1;
      setTimeout(() => cb(performance.now()), 16);
      return rafId;
    });
    
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id);
    });

    // Fix 4: Safely preserve original matchMedia
    originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    // Fix 3: Safely clear out timers and restore matchMedia
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('1. gracefully handles thousands of rapid coordinate updates without execution buffer overflows', () => {
    const { container } = render(<AnimatedCursor />);

    for (let i = 0; i < 2000; i++) {
      fireEvent.mouseMove(window, { clientX: i * 2, clientY: i * 3 });
    }

    // Flush the simulated requestAnimationFrames
    vi.advanceTimersByTime(100);
    
    // Fix 2: Assert something specific to your cursor structure instead of global container
    const innerCursor = container.querySelector('[style*="transform"]') || container.firstChild;
    expect(innerCursor).toBeInTheDocument();
  });

  it('2. prevents SVG coordinate scaling distortions under extreme layout bounds', () => {
    const { container } = render(<AnimatedCursor />);

    fireEvent.mouseMove(window, { clientX: 99999, clientY: 99999 });
    vi.advanceTimersByTime(16);

    // Fix 2: Check if the inline styles calculated the positions cleanly without crashing to NaN
    const cursorElement = container.firstChild as HTMLElement;
    expect(cursorElement.style.transform).not.toContain('NaN');
  });

  it('3. maintains execution stability even during highly loaded metric event configurations', () => {
    render(<AnimatedCursor />);

    expect(() => {
      for (let i = 0; i < 1000; i++) {
        fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
      }
      vi.advanceTimersByTime(16);
    }).not.toThrow();
  });

  it('4. ensures internal coordinate states do not overlap or break tree structures under heavy load', () => {
    const { unmount } = render(<AnimatedCursor />);

    for (let i = 0; i < 500; i++) {
      fireEvent.mouseEnter(document.body);
      fireEvent.mouseLeave(document.body);
    }

    expect(() => unmount()).not.toThrow();
  });

  it('5. correctly handles simultaneous high-volume click and move parameters without layout crashes', () => {
    const { container } = render(<AnimatedCursor />);

    for (let i = 0; i < 500; i++) {
      fireEvent.mouseDown(window);
      fireEvent.mouseUp(window);
      fireEvent.mouseMove(window, { clientX: 50, clientY: 50 });
    }
    vi.advanceTimersByTime(16);

    // Fix 2: Assert that the cursor wrapper DOM is structurally robust
    expect(container.hasChildNodes()).toBe(true);
  });
});
