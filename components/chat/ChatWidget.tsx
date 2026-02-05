"use client";

import { useChat } from "@/context/ChatContext";
import { MessageCircle, X, Trash2, Sparkles } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useEffect, useRef } from "react";

export default function ChatWidget() {
  const { state, toggleChat, closeChat, clearChat, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          state.isOpen
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-sage-600 hover:bg-sage-700 hover:scale-110"
        }`}
        aria-label={state.isOpen ? "Close chat" : "Open yoga assistant"}
      >
        {state.isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Modal */}
      {state.isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-sage-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-sage-600 to-sage-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Yoga Assistant</h3>
                <p className="text-xs text-sage-200">Ask me anything about yoga</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {state.messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-1.5 hover:bg-sage-500 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeChat}
                className="p-1.5 hover:bg-sage-500 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96 min-h-64 bg-gray-50">
            {state.messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-3">🧘</div>
                <p className="font-medium">Welcome to Yoga Assistant!</p>
                <p className="text-sm mt-2">
                  Ask me about poses, create programs, or get yoga advice.
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-400">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "How do I do Warrior pose?",
                      "Poses for back pain",
                      "Morning yoga routine",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="text-xs px-3 py-1.5 bg-white border border-sage-200 rounded-full hover:bg-sage-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {state.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {state.isLoading && state.messages[state.messages.length - 1]?.role === "user" && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-sage-400 rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-sage-400 rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Message */}
          {state.error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          {/* Input */}
          <ChatInput />
        </div>
      )}
    </>
  );
}
