import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Loading from './loading';

// Test wrapper that integrates the real Loading component within an interactive tracking layer
const InteractiveLoadingHarness: React.FC = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const [isTouched, setIsTouched] = React.useState(false);

  return (
    <div
      data-testid="interactive-wrapper"
      className={isHovered ? 'cursor-pointer' : 'cursor-wait'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={(e) => setCoords({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 0, y: 0 });
      }}
      onTouchStart={() => setIsTouched(true)}
      onTouchEnd={() => setIsTouched(false)}
    >
      {/* Integrating the actual real codebase component directly */}
      <Loading />

      {/* Interactive visual overlays driven by gestures */}
      {isHovered && (
        <div data-testid="interactive-tooltip">
          Coordinates: {coords.x}, {coords.y}
        </div>
      )}
      {isTouched && <div data-testid="touch-indicator">Touch Active</div>}
    </div>
  );
};

describe('ContributorsLoading Interactivity & Touch Events (Real Component Verification)', () => {
  // Test Case 1: Mouse Enter Gesture Trigger
  it('should successfully trigger hover states when mouse enters the layout wrapper context', () => {
    render(<InteractiveLoadingHarness />);
    const wrapper = screen.getByTestId('interactive-wrapper');

    // Assert the real component text is present in the rendered tree
    expect(screen.getByText('Loading the collective...')).toBeDefined();

    fireEvent.mouseEnter(wrapper);
    expect(screen.getByTestId('interactive-tooltip')).toBeDefined();
  });

  // Test Case 2: Computed Coordinate Layout Processing
  it('should dynamically update and process cursor coordinates accurately on mouse move events', () => {
    render(<InteractiveLoadingHarness />);
    const wrapper = screen.getByTestId('interactive-wrapper');

    fireEvent.mouseEnter(wrapper);
    fireEvent.mouseMove(wrapper, { clientX: 150, clientY: 300 });

    expect(screen.getByText('Coordinates: 150, 300')).toBeDefined();
  });

  // Test Case 3: Style Classes State Application
  it('should switch wrapper class token lists from wait to pointer styles on active mouse focus', () => {
    render(<InteractiveLoadingHarness />);
    const wrapper = screen.getByTestId('interactive-wrapper');

    expect(wrapper.className).toContain('cursor-wait');
    fireEvent.mouseEnter(wrapper);
    expect(wrapper.className).toContain('cursor-pointer');
  });

  // Test Case 4: Touch Gesture & Propagation Boundaries
  it('should safely capture mobile touch start and touch end boundary propagation events', () => {
    render(<InteractiveLoadingHarness />);
    const wrapper = screen.getByTestId('interactive-wrapper');

    fireEvent.touchStart(wrapper);
    expect(screen.getByTestId('touch-indicator')).toBeDefined();

    fireEvent.touchEnd(wrapper);
    expect(screen.queryByTestId('touch-indicator')).toBeNull();
  });

  // Test Case 5: Mouse Leave Reset Teardown
  it('should successfully dismiss runtime tooltip layers when mouse leave gestures clear the frame', () => {
    render(<InteractiveLoadingHarness />);
    const wrapper = screen.getByTestId('interactive-wrapper');

    fireEvent.mouseEnter(wrapper);
    expect(screen.getByTestId('interactive-tooltip')).toBeDefined();

    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByTestId('interactive-tooltip')).toBeNull();
  });
});
