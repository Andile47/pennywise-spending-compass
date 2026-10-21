import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage, type UIMessage } from "ai";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } from "./run-id.ts";

const BASE_URL = "https://ai.gateway.lovable.dev/v1";
export const MODEL = "openai/gpt-6-astra";

export function createCall(request: Request, messages: ModelMessage[], instructions: string, effort: "low" | "medium" = "medium") {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured (missing key).");
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses(MODEL),
    instructions,
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: effort,
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return {
    result,
    streamResponse: (originalMessages?: UIMessage[]) =>
      withLovableAiGatewayRunIdHeader(result.toUIMessageStreamResponse({ ...(originalMessages ? { originalMessages } : {}), sendReasoning: true }), runIdFetch),
  };
}

export function errorResponse(err: unknown) {
  const e = err as { statusCode?: number; status?: number; message?: string; responseBody?: string };
  const status = e?.statusCode ?? e?.status ?? 500;
  let message = e?.message ?? "Something went wrong.";
  if (status === 429) message = "PennyWise is a little busy right now. Please try again in a moment.";
  if (status === 402) message = "AI credits have run out for this workspace. Top up to keep using AI features.";
  return Response.json({ error: message }, { status });
}
