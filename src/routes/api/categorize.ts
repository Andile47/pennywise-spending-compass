import { createFileRoute } from "@tanstack/react-router";
import { createCall, errorResponse } from "@/server/ai/gateway";
import { CATEGORIZE_INSTRUCTIONS } from "@/server/ai/prompts";
import { CATEGORIES } from "@/lib/pennywise/types";

export const Route = createFileRoute("/api/categorize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { descriptions?: unknown };
          const list = Array.isArray(body.descriptions) ? body.descriptions.map((d) => String(d).slice(0, 200)).slice(0, 100) : [];
          if (list.length === 0) return Response.json({ error: "No descriptions provided." }, { status: 400 });
          const input = list.map((d, i) => `${i + 1}: ${d}`).join("\n");
          const call = createCall(request, [{ role: "user", content: input }], CATEGORIZE_INSTRUCTIONS, "low");
          const text = await call.result.text;
          const categories: string[] = list.map(() => "Other");
          for (const line of text.split("\n")) {
            const m = line.match(/^\s*(\d+)\s*[:.)-]\s*(.+?)\s*$/);
            if (!m) continue;
            const idx = Number(m[1]) - 1;
            const cat = CATEGORIES.find((c) => c.toLowerCase() === m[2].toLowerCase());
            if (idx >= 0 && idx < list.length && cat) categories[idx] = cat;
          }
          return Response.json({ categories });
        } catch (err) {
          return errorResponse(err);
        }
      },
    },
  },
});
