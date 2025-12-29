"use client";

import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { useChat } from "@/context/ChatContext";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const { sendMessage, state } = useChat();

  const handleSubmit = async () => {
    if (!input.trim() || state.isLoading) return;

    const message = input;
    setInput("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 p-3 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about yoga poses, techniques..."
          className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-400 max-h-32"
          rows={1}
          disabled={state.isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || state.isLoading}
          className="p-2.5 bg-sage-600 text-white rounded-xl hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Powered by AI. Responses are for guidance only.
      </p>
    </div>
  );
}
