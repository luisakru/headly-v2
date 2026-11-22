import type { ReactNode } from 'react';

/**
 * Renders the small Markdown subset the legal and knowledge texts use: `#` and `##` headings,
 * `-` and `1.` lists, `[text](https://…)` links, `**bold**` and paragraphs, where single line breaks are kept (addresses).
 * A block `![alt](name)` shows the SVG `figures[name]`.
 */
export function Markdown({
  source,
  figures = {},
}: {
  source: string;
  figures?: Record<string, string>;
}) {
  const blocks = source.trim().split(/\n\s*\n/);
  return (
    <>
      {blocks.map((block, index): ReactNode => {
        const lines = block.split('\n');
        if (block.startsWith('# ')) return <h1 key={index}>{block.slice(2)}</h1>;
        if (block.startsWith('## ')) return <h2 key={index}>{block.slice(3)}</h2>;
        const [, alt, figure] = /^!\[([^\]]*)\]\(([\w-]+)\)$/.exec(block) ?? [];
        if (figure !== undefined) {
          return (
            <figure
              key={index}
              role="img"
              aria-label={alt}
              dangerouslySetInnerHTML={{ __html: figures[figure] ?? '' }}
            />
          );
        }
        if (lines.every((line) => /^\d+\. /.test(line))) {
          return (
            <ol key={index}>
              {lines.map((line) => (
                <li key={line}>{inline(line.replace(/^\d+\. /, ''))}</li>
              ))}
            </ol>
          );
        }
        if (lines.every((line) => line.startsWith('- '))) {
          return (
            <ul key={index}>
              {lines.map((line) => (
                <li key={line}>{inline(line.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {inline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

const INLINE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*\*([^*]+)\*\*/g;

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    parts.push(text.slice(last, match.index));
    parts.push(
      match[3] !== undefined ? (
        <strong key={match.index}>{match[3]}</strong>
      ) : (
        <a key={match.index} href={match[2]} target="_blank" rel="noreferrer">
          {match[1]}
        </a>
      ),
    );
    last = match.index + match[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}
