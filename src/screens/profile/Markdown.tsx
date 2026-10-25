import type { ReactNode } from 'react';

/**
 * Renders the small Markdown subset the legal texts use: `#` and `##` headings,
 * `-` lists and paragraphs, where single line breaks are kept (addresses).
 */
export function Markdown({ source }: { source: string }) {
  const blocks = source.trim().split(/\n\s*\n/);
  return (
    <>
      {blocks.map((block, index): ReactNode => {
        const lines = block.split('\n');
        if (block.startsWith('# ')) return <h1 key={index}>{block.slice(2)}</h1>;
        if (block.startsWith('## ')) return <h2 key={index}>{block.slice(3)}</h2>;
        if (lines.every((line) => line.startsWith('- '))) {
          return (
            <ul key={index}>
              {lines.map((line) => (
                <li key={line}>{line.slice(2)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
