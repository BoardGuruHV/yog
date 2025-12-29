"use client";

import { useEffect, useState } from "react";

interface ArticleContentProps {
  content: string;
}

// Simple markdown parser for basic formatting
function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mt-10 mb-6">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sage-600 hover:text-sage-800 underline">$1</a>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-sage-300 pl-4 py-2 my-6 text-gray-700 italic bg-sage-50 rounded-r-lg">$1</blockquote>');

  // Unordered lists
  html = html.replace(/^\s*[-*] (.*$)/gim, '<li class="ml-6 mb-2 list-disc text-gray-700">$1</li>');
  html = html.replace(/(<li[\s\S]*<\/li>)/, '<ul class="my-4">$1</ul>');

  // Numbered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-6 mb-2 list-decimal text-gray-700">$1</li>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="my-8 border-gray-200" />');

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">');

  // Wrap in paragraph
  html = '<p class="text-gray-700 leading-relaxed mb-4">' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p class="[^"]*"><\/p>/g, '');
  html = html.replace(/<p class="[^"]*">(<h[1-6])/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p class="[^"]*">(<blockquote)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
  html = html.replace(/<p class="[^"]*">(<ul)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p class="[^"]*">(<hr)/g, '$1');
  html = html.replace(/(\/><\/p>)/g, '/>');

  return html;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    setHtml(parseMarkdown(content));
  }, [content]);

  return (
    <div
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Reading progress indicator
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, scrollProgress));
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
      <div
        className="h-full bg-sage-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Table of contents generator
export function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    const matches = content.matchAll(/^(#{1,3}) (.+)$/gm);
    const items = Array.from(matches).map((match, index) => ({
      id: `heading-${index}`,
      text: match[2],
      level: match[1].length,
    }));
    setHeadings(items);
  }, [content]);

  if (headings.length < 3) return null;

  return (
    <nav className="bg-gray-50 rounded-xl p-5 mb-8">
      <h4 className="font-semibold text-gray-900 mb-3">In this article</h4>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}
          >
            <a
              href={`#${heading.id}`}
              className="text-sm text-gray-600 hover:text-sage-600 transition-colors"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
