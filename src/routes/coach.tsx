import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Logo } from "@/components/pennywise/Logo";
import { spendingSummary } from "@/lib/pennywise/calc";
import { getState, setState, usePenny, useHydrated } from "@/lib/pennywise/store";
import { GOAL_LABELS } from "@/lib/pennywise/types";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "AI Coach — PennyWise" },
      { name: "description", content: "Chat with a friendly AI money coach that knows your numbers and your level." },
      { property: "og:title", content: "Chat with your PennyWise coach" },
      { property: "og:description", content: "A friendly AI coach that explains money at your level." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CoachPage,
});

const STARTERS = [
  "Where is my money going?",
  "Should I pay off debt or save first?",
  "How do I build an emergency fund?",
  "What's one easy win this month?",
];

function CoachPage() {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return <CoachChat />;
}

function CoachChat() {
  const level = usePenny((s) => s.profile.level);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => {
          const s = getState();
          return {
            context: {
              level: s.profile.level,
              goal: GOAL_LABELS[s.profile.goal],
              currency: s.profile.currency,
              summary: spendingSummary(s.transactions, s.profile.currency),
            },
          };
        },
      }),
    [],
  );
  const { messages, sendMessage, status, stop } = useChat({
    id: "coach",
    messages: getState().chat,
    transport,
    onError: (e) => {
      let msg = e.message;
      try {
        msg = JSON.parse(e.message).error ?? msg;
      } catch {
        /* not json */
      }
      toast.error(msg || "The coach couldn't reply. Please try again.");
    },
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" || status === "error") setState((s) => ({ ...s, chat: messages }));
    if (status === "ready") textareaRef.current?.focus();
  }, [status, messages]);

  useEffect(() => textareaRef.current?.focus(), []);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text });
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-14rem)] min-h-[480px] max-w-3xl flex-col rounded-3xl bg-card shadow-soft">
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <Logo className="size-10" />
        <div>
          <p className="font-display text-lg font-semibold leading-tight">Penny, your coach</p>
          <p className="text-xs text-muted-foreground">Talking at {level} level · educational, not financial advice</p>
        </div>
      </div>
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="py-8 text-center">
              <h2 className="text-2xl font-semibold">Hi! What would you like to figure out?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pick a question or ask your own.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {STARTERS.map((q) => (
                  <button key={q} onClick={() => send(q)} className="rounded-full border bg-background px-4 py-2 text-sm transition-colors hover:border-primary hover:bg-secondary">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-user]:rounded-2xl">
                {m.parts.map((p, i) =>
                  p.type === "text" ? (
                    m.role === "assistant" ? <MessageResponse key={i}>{p.text}</MessageResponse> : <p key={i}>{p.text}</p>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && (
            <div className="flex gap-1.5 px-1 py-2" aria-label="Coach is typing">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="border-t p-3">
        <PromptInput onSubmit={({ text }) => send(text)}>
          <PromptInputTextarea ref={textareaRef} placeholder="Ask Penny anything about your money…" />
          <PromptInputFooter>
            <PromptInputTools>
              {messages.length > 0 && !busy && (
                <button type="button" className="px-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => send(STARTERS[0])}>
                  Where is my money going?
                </button>
              )}
            </PromptInputTools>
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
