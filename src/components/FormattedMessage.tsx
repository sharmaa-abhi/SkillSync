"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface FormattedMessageProps {
  content: string;
  isTutor?: boolean;
}

export default function FormattedMessage({ content, isTutor = false }: FormattedMessageProps) {
  // If student, render regular styled text
  if (!isTutor) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  // Split lines to process markdown structures
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";

  lines.forEach((line, lineIndex) => {
    // Check for code block delimiters
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        const codeText = codeBuffer.join("\n");
        elements.push(
          <CodeBlockDisplay key={`code-${lineIndex}`} code={codeText} language={codeLang} />
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = "";
      } else {
        // Start of code block
        inCodeBlock = true;
        codeLang = line.trim().replace(/^```/, "").trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    const trimmed = line.trim();

    // Empty line creates spacing
    if (!trimmed) {
      elements.push(<div key={`sp-${lineIndex}`} className="h-2" />);
      return;
    }

    // Horizontal rule
    if (trimmed === "---" || trimmed === "***") {
      elements.push(
        <hr key={`hr-${lineIndex}`} className="my-3 border-t border-slate-200" />
      );
      return;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4 key={`h3-${lineIndex}`} className="text-sm font-bold text-slate-900 mt-2.5 mb-1 flex items-center gap-1.5">
          {renderInlineMathAndFormatting(trimmed.replace(/^###\s+/, ""))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h3 key={`h2-${lineIndex}`} className="text-base font-bold text-slate-900 mt-3 mb-1.5">
          {renderInlineMathAndFormatting(trimmed.replace(/^##\s+/, ""))}
        </h3>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      elements.push(
        <div
          key={`quote-${lineIndex}`}
          className="my-2 pl-3 py-1.5 border-l-3 border-indigo-500 bg-indigo-50/50 rounded-r-lg text-slate-700 text-xs sm:text-sm font-medium italic"
        >
          {renderInlineMathAndFormatting(trimmed.replace(/^>\s+/, ""))}
        </div>
      );
      return;
    }

    // Numbered list item
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const text = numberedMatch[2];
      elements.push(
        <div key={`num-${lineIndex}`} className="flex items-start gap-2.5 my-1 text-xs sm:text-sm leading-relaxed">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center mt-0.5">
            {num}
          </span>
          <span className="flex-1 text-slate-800">{renderInlineMathAndFormatting(text)}</span>
        </div>
      );
      return;
    }

    // Bullet points
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <div key={`bullet-${lineIndex}`} className="flex items-start gap-2 my-1 text-xs sm:text-sm leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
          <span className="flex-1 text-slate-800">{renderInlineMathAndFormatting(trimmed.substring(2))}</span>
        </div>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${lineIndex}`} className="my-1 text-xs sm:text-sm leading-relaxed text-slate-800">
        {renderInlineMathAndFormatting(line)}
      </p>
    );
  });

  return <div className="space-y-0.5">{elements}</div>;
}

function CodeBlockDisplay({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 text-slate-100 text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700 text-[11px] text-slate-400">
        <span className="font-mono uppercase">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-3 font-mono overflow-x-auto whitespace-pre text-[12px] leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

/**
 * Parses inline math ($...$ or $$...$$), bold (**...**), italics (*...*), and code (`...`)
 */
function renderInlineMathAndFormatting(text: string): React.ReactNode[] {
  // Regex to match math: $...$ or inline code: `...` or bold: **...** or italic: *...*
  const pattern = /(\$\$[\s\S]+?\$\$|\$[^$\n]+\$|`[^`\n]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Block math $$...$$
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const formula = part.slice(2, -2).trim();
      return (
        <span
          key={index}
          className="my-1.5 block py-1.5 px-3 bg-indigo-50/90 text-indigo-950 font-serif rounded-lg border border-indigo-200/80 text-center tracking-wide font-semibold shadow-xs"
        >
          {formula}
        </span>
      );
    }

    // Inline math $...$
    if (part.startsWith("$") && part.endsWith("$")) {
      const formula = part.slice(1, -1).trim();
      return (
        <span
          key={index}
          className="inline-flex items-center mx-1 px-1.5 py-0.5 bg-indigo-50/80 text-indigo-900 font-serif font-semibold text-[13px] rounded border border-indigo-200/70 shadow-2xs"
        >
          {formula}
        </span>
      );
    }

    // Inline code `...`
    if (part.startsWith("`") && part.endsWith("`")) {
      const codeSnippet = part.slice(1, -1);
      return (
        <code
          key={index}
          className="mx-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono text-[11px] rounded border border-slate-200 font-semibold"
        >
          {codeSnippet}
        </code>
      );
    }

    // Bold **...**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic *...*
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
