"use client";

import { User, Sparkles } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Simple markdown-like formatting
  const formatContent = (content: string) => {
    // Bold text
    let formatted = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Bullet points
    formatted = formatted.replace(/^- (.+)$/gm, "<li>$1</li>");
    // Wrap consecutive list items in ul
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, "<ul class='list-disc pl-4 my-2'>$&</ul>");
    // Line breaks
    formatted = formatted.replace(/\n/g, "<br />");
    return formatted;
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-sage-100 text-sage-600" : "bg-linear-to-br from-sage-500 to-yoga-500 text-white"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? "bg-sage-600 text-white rounded-tr-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-xs"
        }`}
      >
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div
            className="text-sm prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />
        )}
      </div>
    </div>
  );
}
