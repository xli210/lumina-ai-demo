import Link from "next/link";

/**
 * The small Markdown subset the guides are written in: ## headings, paragraphs, - and 1. lists,
 * | tables, **bold**, [label](url) links and a line that is only ![alt](/image.jpg).
 * Shared by the English blog (app/blog/[slug]) and the Chinese guides (app/zh-CN/guides).
 */

/**
 * Inline markup: **bold** and [label](url). The renderer used to strip both,
 * which meant a post could not link to anything: no internal links, so no
 * route for a reader or a crawler from a guide to the product it describes.
 * Site paths use next/link; anything else opens as an ordinary external link.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let n = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      out.push(
        <strong key={`${keyPrefix}-b${n++}`} className="font-semibold text-foreground">
          {match[1]}
        </strong>
      );
    } else {
      const href = match[3];
      const cls = "font-medium text-primary underline-offset-4 hover:underline";
      out.push(
        href.startsWith("/") ? (
          <Link key={`${keyPrefix}-l${n++}`} href={href} className={cls}>
            {match[2]}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-l${n++}`}
            href={href}
            className={cls}
            target="_blank"
            rel="noopener noreferrer"
          >
            {match[2]}
          </a>
        )
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableKey = 0;

  function flushTable() {
    if (tableRows.length < 2) return;
    const headers = tableRows[0];
    const body = tableRows.slice(2);
    elements.push(
      <div key={`table-${tableKey++}`} className="my-6 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="border-b border-border px-3 py-2 text-left font-semibold text-foreground">
                  {h.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border-b border-border/50 px-3 py-2 text-muted-foreground">
                    {renderInline(cell.trim(), `c${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("|")) {
      inTable = true;
      const cells = line.split("|").filter(Boolean);
      tableRows.push(cells);
      continue;
    }
    if (inTable) {
      flushTable();
      inTable = false;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/);
    if (image) {
      elements.push(
        <figure key={i} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image[2]} alt={image[1]} loading="lazy" className="w-full rounded-xl border border-border/60" />
          {image[1] && <figcaption className="mt-2 text-xs text-muted-foreground">{image[1]}</figcaption>}
        </figure>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="mt-10 mb-4 text-xl font-bold text-foreground sm:text-2xl">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("- **")) {
      const match = line.match(/^- \*\*(.*?)\*\*:?\s*(.*)/);
      if (match) {
        elements.push(
          <li key={i} className="ml-4 mb-2 text-sm text-muted-foreground list-disc">
            <strong className="text-foreground">{match[1]}</strong>
            {match[2] ? <>: {renderInline(match[2], `li${i}`)}</> : null}
          </li>
        );
      }
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="ml-4 mb-2 text-sm text-muted-foreground list-disc">
          {renderInline(line.slice(2), `li${i}`)}
        </li>
      );
    } else if (line.match(/^\d+\. /)) {
      const text = line.replace(/^\d+\.\s*/, "");
      elements.push(
        <li key={i} className="ml-4 mb-2 text-sm text-muted-foreground list-decimal">
          {renderInline(text, `ol${i}`)}
        </li>
      );
    } else if (line.trim() === "") {
      continue;
    } else {
      elements.push(
        <p key={i} className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {renderInline(line, `p${i}`)}
        </p>
      );
    }
  }
  if (inTable) flushTable();
  return elements;
}
