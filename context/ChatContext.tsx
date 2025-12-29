"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatState {
  isOpen: boolean;
  sessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

interface ChatContextType {
  state: ChatState;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    sessionId: null,
    messages: [],
    isLoading: false,
    error: null,
  });

  const openChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const closeChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const toggleChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const clearChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sessionId: null,
      messages: [],
      error: null,
    }));
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sessionId: state.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantMessage: ChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      // Add empty assistant message that we'll update
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.sessionId && !state.sessionId) {
                setState((prev) => ({ ...prev, sessionId: data.sessionId }));
              }

              if (data.content) {
                assistantMessage = {
                  ...assistantMessage,
                  content: assistantMessage.content + data.content,
                };

                setState((prev) => ({
                  ...prev,
                  messages: prev.messages.map((m) =>
                    m.id === assistantMessage.id ? assistantMessage : m
                  ),
                }));
              }

              if (data.done) {
                setState((prev) => ({ ...prev, isLoading: false }));
              }
            } catch {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to send message. Please try again.",
      }));
    }
  }, [state.sessionId]);

  return (
    <ChatContext.Provider
      value={{
        state,
        openChat,
        closeChat,
        toggleChat,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
