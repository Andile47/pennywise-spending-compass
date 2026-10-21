import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createCall, errorResponse } from "@/server/ai/gateway";
import { coachInstructions } from "@/server/ai/prompts";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            messages?: UIMessage[];
            context?: { level?: string; goal?: string; currency?: string; summary?: string };
          };
          if (!Array.isArray(body.messages) || body.messages.length === 0)
            return Response.json({ error: "No messages provided." }, { status: 400 });
          const c = body.context ?? {};
          const level = LEVELS.find((l) => l === c.level) ?? "Beginner";
          const instructions = coachInstructions({
            level,
            goal: String(c.goal ?? "General budgeting").slice(0, 100),
            currency: String(c.currency ?? "ZAR").slice(0, 5),
            summary: String(c.summary ?? "No data yet.").slice(0, 4000),
          });
          const messages = body.messages.slice(-40);
          const call = createCall(request, await convertToModelMessages(messages), instructions);
          return await call.streamResponse(messages);
        } catch (err) {
          return errorResponse(err);
        }
      },
    },
  },
});
