import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock Component', () => {
  const sampleRust = `pub fn initialize(env: Env, admin: Address) {
    admin.require_auth();
}`;

  const sampleJson = `{
  "milestone_index": 0,
  "amount": 500,
  "completed": true
}`;

  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders language tag badge and code contents', () => {
    render(<CodeBlock code={sampleRust} language="rust" title="Soroban Contract" />);

    expect(screen.getByText('Soroban Contract')).toBeInTheDocument();
    expect(screen.getByTestId('language-tag')).toHaveTextContent('rust');
    expect(screen.getByText('admin.require_auth();')).toBeInTheDocument();
  });

  it('renders JSON code snippet with formatted tokens', () => {
    render(<CodeBlock code={sampleJson} language="json" />);

    expect(screen.getByTestId('language-tag')).toHaveTextContent('json');
    expect(screen.getByText('"milestone_index"')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('copies exact code text to clipboard on button click and shows Copied state', async () => {
    render(<CodeBlock code={sampleRust} language="rust" />);

    const copyBtn = screen.getByRole('button', { name: /copy code/i });
    expect(copyBtn).toHaveTextContent('Copy Code');

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(sampleRust);
    expect(screen.getByText('Copied!')).toBeInTheDocument();

    // Reverts after 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Copy Code')).toBeInTheDocument();
  });

  it('renders line numbers when showLineNumbers is true', () => {
    render(<CodeBlock code={sampleRust} language="rust" showLineNumbers={true} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
