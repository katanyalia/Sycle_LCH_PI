"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function FormattedText({ text }) {
  return (
    <div className="formatted-text text-sm leading-7 text-[#493D49]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-4 text-lg font-bold text-[#8E3E5E]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-4 text-base font-bold text-[#8E3E5E]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-3 font-bold text-[#8E3E5E]">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-[#332A35]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-[#D99AB2] pl-3 italic text-[#765866]">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B84E73] underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {text || ""}
      </ReactMarkdown>
    </div>
  );
}