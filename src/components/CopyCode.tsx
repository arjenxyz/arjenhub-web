import { useMemo, useState, type ReactNode } from 'react';

type TokenKind = 'comment' | 'string' | 'keyword' | 'key' | 'number' | 'tag' | 'plain';

const KEYWORDS = new Set([
  'const',
  'let',
  'var',
  'function',
  'await',
  'async',
  'return',
  'if',
  'else',
  'true',
  'false',
  'null',
  'undefined',
  'new',
  'typeof',
  'POST',
  'GET',
]);

function tokenizeLine(line: string): { kind: TokenKind; text: string }[] {
  const out: { kind: TokenKind; text: string }[] = [];
  let i = 0;

  while (i < line.length) {
    if (line.startsWith('//', i)) {
      out.push({ kind: 'comment', text: line.slice(i) });
      break;
    }
    if (line.startsWith('<!--', i)) {
      out.push({ kind: 'comment', text: line.slice(i) });
      break;
    }

    const ch = line[i];

    if (ch === '<' && /[/?a-zA-Z]/.test(line[i + 1] ?? '')) {
      let j = i + 1;
      while (j < line.length && line[j] !== '>' && line[j] !== ' ') j += 1;
      out.push({ kind: 'tag', text: line.slice(i, j) });
      i = j;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\') {
          j += 2;
          continue;
        }
        if (line[j] === ch) {
          j += 1;
          break;
        }
        j += 1;
      }
      out.push({ kind: 'string', text: line.slice(i, j) });
      i = j;
      continue;
    }

    if (/[A-Za-z_$]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_$.-]/.test(line[j])) j += 1;
      const word = line.slice(i, j);
      const nextIsColon = /^\s*:/.test(line.slice(j));
      if (nextIsColon && !KEYWORDS.has(word)) {
        out.push({ kind: 'key', text: word });
      } else if (KEYWORDS.has(word)) {
        out.push({ kind: 'keyword', text: word });
      } else {
        out.push({ kind: 'plain', text: word });
      }
      i = j;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[0-9.]/.test(line[j])) j += 1;
      out.push({ kind: 'number', text: line.slice(i, j) });
      i = j;
      continue;
    }

    out.push({ kind: 'plain', text: ch });
    i += 1;
  }

  return out;
}

function highlight(code: string): ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => (
    <span className="copy-code__line" key={lineIdx}>
      {tokenizeLine(line).map((tok, tokIdx) =>
        tok.kind === 'plain' ? (
          <span key={tokIdx}>{tok.text}</span>
        ) : (
          <span className={`tok tok--${tok.kind}`} key={tokIdx}>
            {tok.text}
          </span>
        ),
      )}
      {lineIdx < lines.length - 1 ? '\n' : null}
    </span>
  ));
}

export function CopyCode({
  code,
  label = 'Code',
}: {
  code: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const colored = useMemo(() => highlight(code), [code]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure className="copy-code">
      <figcaption className="copy-code__bar">
        <span className="copy-code__label">{label}</span>
        <button
          aria-label={copied ? 'Copied' : 'Copy code'}
          className={`copy-code__btn${copied ? ' is-copied' : ''}`}
          onClick={() => void onCopy()}
          type="button"
        >
          {copied ? (
            <>
              <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
                <path
                  d="M2.5 7.2 5.4 10l6.1-7"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
                <rect
                  height="8.5"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  width="8.5"
                  x="4"
                  y="4"
                />
                <path
                  d="M3 9.5H2.5A1.5 1.5 0 0 1 1 8V2.5A1.5 1.5 0 0 1 2.5 1H8A1.5 1.5 0 0 1 9.5 2.5V3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              Copy
            </>
          )}
        </button>
      </figcaption>
      <pre className="copy-code__pre">
        <code>{colored}</code>
      </pre>
    </figure>
  );
}
