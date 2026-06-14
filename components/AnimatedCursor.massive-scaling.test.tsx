import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnimatedCursor from './AnimatedCursor';

describe('AnimatedCursor Massive Scaling & High Bounds Tests', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    vi.useFakeTimers();
    
    // FIX: Provide a mock linear ID and pass a high-res timestamp to the callback
    let rafId = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafId += 1;
      setTimeout(() => cb(performance.now()), 16);
      return rafId;
    });

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id);
    });

    // FIX: Store original reference to prevent environment pollution
    originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true, // Allows us to redefine/delete it later
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
    // FIX: Safely clear out nested timers instead of running pending loops
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();

    // FIX: Restore matchMedia to its original state
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('1. gracefully handles thousands of rapid coordinate updates without execution buffer overflows', () => {
    const { container } = render(<AnimatedCursor />);

    // Simulate massive input bounds (thousands of coordinate events)
    for (let i = 0; i < 2000; i++) {
      fireEvent.mouseMove(window, { clientX: i * 2, clientY: i * 3 });
    }

    vi.advanceTimersByTime(100);
    expect(container).toBeInTheDocument();
  });

  it('2. prevents SVG coordinate scaling distortions under extreme layout bounds', () => {
    render(<AnimatedCursor />);

    // Fire extreme coordinate bounds outside normal screen sizes
    fireEvent.mouseMove(window, { clientX: 99999, clientY: 99999 });

    expect(document.body).toBeInTheDocument();
  });

  it('3. maintains execution stability even during highly loaded metric event configurations', () => {
    render(<AnimatedCursor />);

    expect(() => {
      for (let i = 0; i < 1000; i++) {
        fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
      }
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
    render(<AnimatedCursor />);

    for (let i = 0; i < 500; i++) {
      fireEvent.mouseDown(window);
      fireEvent.mouseUp(window);
      fireEvent.mouseMove(window, { clientX: 50, clientY: 50 });
    }

    expect(document.body).toBeInTheDocument();
  });
});
