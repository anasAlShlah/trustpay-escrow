'use client';

import React, { useState } from 'react';

export interface CodeBlockProps {
  code: string;
  language?: 'json' | 'rust' | 'bash' | 'shell' | 'typescript' | 'javascript' | string;
  title?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = 'json',
  title,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  // Lightweight syntax highlighter producing styled token spans
  const highlightCode = (rawCode: string, lang: string): React.ReactNode => {
    const lines = rawCode.split('\n');

    return lines.map((line, lineIdx) => {
      const tokens: React.ReactNode[] = [];
      let current = line;
      let tokenIdx = 0;

      // Check for full line comments or shell comments
      if ((lang === 'bash' || lang === 'shell') && current.trim().startsWith('#')) {
        tokens.push(
          <span key={`comment-${lineIdx}-${tokenIdx++}`} className="text-slate-500 italic">
            {current}
          </span>
        );
        return renderLine(lineIdx, tokens);
      }

      if ((lang === 'rust' || lang === 'typescript' || lang === 'javascript') && current.trim().startsWith('//')) {
        tokens.push(
          <span key={`comment-${lineIdx}-${tokenIdx++}`} className="text-slate-500 italic">
            {current}
          </span>
        );
        return renderLine(lineIdx, tokens);
      }

      // Regex tokenization for keywords, strings, numbers, and symbols
      const regex = lang === 'json'
        ? /("(?:\\.|[^"\\])*"(?:\s*:)?)|(\b(?:true|false|null)\b)|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|([{}[\]:,])/g
        : lang === 'rust'
        ? /("(?:\\.|[^"\\])*")|(\b(?:fn|let|mut|pub|struct|enum|impl|use|match|if|else|return|async|await|self|true|false|None|Some|Ok|Err|type|const|where|in)\b)|(\b(?:u32|u64|i32|i64|String|str|bool|Vec|Option|Result|Address|Env|Symbol)\b)|(-?\b\d+(?:\.\d+)?\b)|(\/\/[^\n]*)/g
        : /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b(?:npm|npx|cargo|soroban|git|cd|curl|echo|export|run|test|build|install|clone)\b)|(--?[\w-]+)|(-?\b\d+\b)|(#[^\n]*)/g;

      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(current)) !== null) {
        if (match.index > lastIndex) {
          tokens.push(current.substring(lastIndex, match.index));
        }

        const matchText = match[0];

        if (lang === 'json') {
          if (matchText.endsWith(':')) {
            // JSON key
            tokens.push(
              <span key={`key-${lineIdx}-${tokenIdx++}`} className="text-cyan-400 font-medium">
                {matchText.slice(0, -1)}
              </span>
            );
            tokens.push(<span key={`col-${lineIdx}-${tokenIdx++}`} className="text-slate-400">:</span>);
          } else if (matchText.startsWith('"')) {
            // JSON string value
            tokens.push(
              <span key={`str-${lineIdx}-${tokenIdx++}`} className="text-emerald-300">
                {matchText}
              </span>
            );
          } else if (/^(true|false|null)$/.test(matchText)) {
            tokens.push(
              <span key={`bool-${lineIdx}-${tokenIdx++}`} className="text-amber-400 font-semibold">
                {matchText}
              </span>
            );
          } else if (!isNaN(Number(matchText))) {
            tokens.push(
              <span key={`num-${lineIdx}-${tokenIdx++}`} className="text-purple-400">
                {matchText}
              </span>
            );
          } else {
            tokens.push(<span key={`sym-${lineIdx}-${tokenIdx++}`} className="text-slate-400">{matchText}</span>);
          }
        } else if (lang === 'rust') {
          if (matchText.startsWith('"')) {
            tokens.push(<span key={`str-${lineIdx}-${tokenIdx++}`} className="text-emerald-300">{matchText}</span>);
          } else if (matchText.startsWith('//')) {
            tokens.push(<span key={`com-${lineIdx}-${tokenIdx++}`} className="text-slate-500 italic">{matchText}</span>);
          } else if (/^(fn|let|mut|pub|struct|enum|impl|use|match|if|else|return|async|await|self|true|false|type|const|where|in)$/.test(matchText)) {
            tokens.push(<span key={`kw-${lineIdx}-${tokenIdx++}`} className="text-indigo-400 font-semibold">{matchText}</span>);
          } else if (/^(u32|u64|i32|i64|String|str|bool|Vec|Option|Result|Address|Env|Symbol|None|Some|Ok|Err)$/.test(matchText)) {
            tokens.push(<span key={`type-${lineIdx}-${tokenIdx++}`} className="text-amber-400">{matchText}</span>);
          } else if (!isNaN(Number(matchText))) {
            tokens.push(<span key={`num-${lineIdx}-${tokenIdx++}`} className="text-purple-400">{matchText}</span>);
          } else {
            tokens.push(matchText);
          }
        } else {
          // Bash / shell
          if (matchText.startsWith('"') || matchText.startsWith("'")) {
            tokens.push(<span key={`str-${lineIdx}-${tokenIdx++}`} className="text-emerald-300">{matchText}</span>);
          } else if (matchText.startsWith('#')) {
            tokens.push(<span key={`com-${lineIdx}-${tokenIdx++}`} className="text-slate-500 italic">{matchText}</span>);
          } else if (/^--?[\w-]+$/.test(matchText)) {
            tokens.push(<span key={`flag-${lineIdx}-${tokenIdx++}`} className="text-cyan-400">{matchText}</span>);
          } else if (!isNaN(Number(matchText))) {
            tokens.push(<span key={`num-${lineIdx}-${tokenIdx++}`} className="text-purple-400">{matchText}</span>);
          } else {
            tokens.push(<span key={`cmd-${lineIdx}-${tokenIdx++}`} className="text-amber-400 font-semibold">{matchText}</span>);
          }
        }

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < current.length) {
        tokens.push(current.substring(lastIndex));
      }

      return renderLine(lineIdx, tokens.length > 0 ? tokens : ' ');
    });
  };

  const renderLine = (lineIdx: number, content: React.ReactNode) => (
    <div key={lineIdx} className="table-row">
      {showLineNumbers && (
        <span className="table-cell pr-4 text-right select-none text-slate-600 text-xs font-mono">
          {lineIdx + 1}
        </span>
      )}
      <span className="table-cell whitespace-pre font-mono text-xs text-slate-200">
        {content}
      </span>
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-xl my-3">
      {/* Code Block Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          {/* Mac-style window dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          {title && (
            <span className="text-slate-300 font-medium truncate max-w-xs">{title}</span>
          )}

          <span
            data-testid="language-tag"
            className="uppercase tracking-wider text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-400 border border-slate-700/60"
          >
            {language}
          </span>
        </div>

        {/* 1-Click Copy Code Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50'
          }`}
        >
          {copied ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5 text-emerald-400"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5 text-slate-400"
                aria-hidden="true"
              >
                <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12a1.5 1.5 0 0 1 .439 1.061V16.5A1.5 1.5 0 0 1 15.5 18h-7A1.5 1.5 0 0 1 7 16.5v-13Z" />
                <path d="M5.5 5A1.5 1.5 0 0 0 4 6.5v11A1.5 1.5 0 0 0 5.5 19h7a1.5 1.5 0 0 0 1.5-1.5V17H6.5A1.5 1.5 0 0 1 5 15.5V5h.5Z" />
              </svg>
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Container with horizontal scrolling */}
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono">
        <code className="table">{highlightCode(code, language.toLowerCase())}</code>
      </pre>
    </div>
  );
}

export default CodeBlock;
