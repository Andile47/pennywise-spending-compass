import { isCategory, type Transaction } from "./types";
import { getState, setState } from "./store";

/** Sends uncategorized expense descriptions to the AI and stores the results. */
export async function categorizeWithAI(ids?: string[]) {
  const txs = getState().transactions.filter(
    (t) => t.amount < 0 && (ids ? ids.includes(t.id) : t.category === "Other"),
  );
  if (txs.length === 0) return 0;
  const result = new Map<string, Transaction["category"]>();
  for (let i = 0; i < txs.length; i += 60) {
    const chunk = txs.slice(i, i + 60);
    const res = await fetch("/api/categorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descriptions: chunk.map((t) => t.description) }),
    });
    const data = (await res.json().catch(() => ({}))) as { categories?: unknown[]; error?: string };
    if (!res.ok || !Array.isArray(data.categories)) throw new Error(data.error ?? "Couldn't categorize right now.");
    chunk.forEach((t, j) => {
      const c = data.categories![j];
      if (isCategory(c)) result.set(t.id, c);
    });
  }
  setState((s) => ({
    ...s,
    transactions: s.transactions.map((t) => (result.has(t.id) ? { ...t, category: result.get(t.id)! } : t)),
  }));
  return result.size;
}
