import type { ReactNode } from "react";

function inlineFormat(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-secondary dark:bg-slate-800">{part.slice(1, -1)}</code>;
    }
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function isTableDivider(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function parseCells(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function Table({ lines }: { lines: string[] }) {
  const headers = parseCells(lines[0]);
  const rows = lines.slice(2).map(parseCells);
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-border-theme">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/70">
          <tr>{headers.map((cell, index) => <th key={index} className="whitespace-nowrap px-4 py-3 font-bold">{inlineFormat(cell)}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border-theme">
          {rows.map((row, rowIndex) => <tr key={rowIndex} className="transition hover:bg-hover-theme">{headers.map((_, index) => <td key={index} className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">{inlineFormat(row[index] || "-")}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

export default function MarkdownContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }

    if (line.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const tableLines = [line, lines[index + 1]];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) { tableLines.push(lines[index]); index += 1; }
      blocks.push(<Table key={`table-${index}`} lines={tableLines} />);
      continue;
    }

    if (/^#{1,3}\s/.test(line)) {
      const [, marks, text] = line.match(/^(#{1,3})\s+(.*)$/) || [];
      const Heading = marks?.length === 1 ? "h2" : "h3";
      blocks.push(<Heading key={index} className="mb-2 mt-4 text-base font-bold text-foreground first:mt-0">{inlineFormat(text)}</Heading>);
      index += 1;
      continue;
    }

    if (/^[-*]\s/.test(line) || /^\d+\.\s/.test(line)) {
      const ordered = /^\d+\.\s/.test(line);
      const items: string[] = [];
      while (index < lines.length && (ordered ? /^\d+\.\s/.test(lines[index]) : /^[-*]\s/.test(lines[index]))) {
        items.push(lines[index].replace(ordered ? /^\d+\.\s/ : /^[-*]\s/, ""));
        index += 1;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={index} className={`${ordered ? "list-decimal" : "list-disc"} my-3 space-y-1 pl-5 text-slate-600 dark:text-slate-300`}>{items.map((item, itemIndex) => <li key={itemIndex}>{inlineFormat(item)}</li>)}</List>);
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^#{1,3}\s|^[-*]\s|^\d+\.\s/.test(lines[index])) { paragraph.push(lines[index]); index += 1; }
    blocks.push(<p key={index} className="my-3 whitespace-pre-wrap leading-7 text-slate-600 dark:text-slate-300">{inlineFormat(paragraph.join("\n"))}</p>);
  }

  return <div className="text-[15px]">{blocks}</div>;
}