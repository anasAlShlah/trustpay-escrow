import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BackToTopButton } from './BackToTopButton';

describe('BackToTopButton Component', () => {
  const originalScrollTo = window.scrollTo;

  beforeEach(() => {
    window.scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
    vi.restoreAllMocks();
  });

  it('is hidden when scroll position is below threshold (default 400px)', () => {
    window.scrollY = 200;
    const { container } = render(<BackToTopButton />);
    expect(container.firstChild).toBeNull();
  });

  it('becomes visible when scroll position exceeds threshold', () => {
    render(<BackToTopButton threshold={400} />);

    expect(screen.queryByTestId('back-to-top-button')).not.toBeInTheDocument();

    act(() => {
      window.scrollY = 450;
      fireEvent.scroll(window);
    });

    expect(screen.getByTestId('back-to-top-button')).toBeInTheDocument();
  });

  it('smoothly scrolls to top on click', () => {
    render(<BackToTopButton threshold={300} />);

    act(() => {
      window.scrollY = 500;
      fireEvent.scroll(window);
    });

    const button = screen.getByTestId('back-to-top-button');
    fireEvent.click(button);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('hides again when scrolled back below threshold', () => {
    render(<BackToTopButton threshold={400} />);

    act(() => {
      window.scrollY = 600;
      fireEvent.scroll(window);
    });

    expect(screen.getByTestId('back-to-top-button')).toBeInTheDocument();

    act(() => {
      window.scrollY = 150;
      fireEvent.scroll(window);
    });

    expect(screen.queryByTestId('back-to-top-button')).not.toBeInTheDocument();
  });
});
