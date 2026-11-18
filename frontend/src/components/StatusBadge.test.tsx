import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge Component', () => {
  it('renders pending review status with amber pulse indicator dot', () => {
    render(<StatusBadge status="submitted" />);

    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Pending Review');
    expect(badge).toHaveClass('text-amber-400');

    const dot = screen.getByTestId('status-badge-dot');
    expect(dot).toHaveClass('w-1.5'); // 6px width
    expect(dot).toHaveClass('h-1.5'); // 6px height
    expect(dot).toHaveClass('bg-amber-400');
    expect(dot).toHaveClass('motion-safe:animate-pulse');
  });

  it('disables animation when disableAnimation is true (prefers-reduced-motion)', () => {
    render(<StatusBadge status="pending_review" disableAnimation={true} />);

    const dot = screen.getByTestId('status-badge-dot');
    expect(dot).not.toHaveClass('motion-safe:animate-pulse');
  });

  it('renders approved status in emerald without pulse animation', () => {
    render(<StatusBadge status="approved" />);

    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Approved');
    expect(badge).toHaveClass('text-emerald-400');

    const dot = screen.getByTestId('status-badge-dot');
    expect(dot).toHaveClass('bg-emerald-400');
    expect(dot).not.toHaveClass('motion-safe:animate-pulse');
  });

  it('renders revision requested status in rose without pulse animation', () => {
    render(<StatusBadge status="revision_requested" />);

    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Revision Requested');
    expect(badge).toHaveClass('text-rose-400');

    const dot = screen.getByTestId('status-badge-dot');
    expect(dot).toHaveClass('bg-rose-400');
    expect(dot).not.toHaveClass('motion-safe:animate-pulse');
  });
});
