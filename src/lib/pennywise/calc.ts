import type { Category, Currency, Transaction } from "./types";

export const NEEDS: Category[] = ["Rent", "Groceries", "Transport", "Utilities", "Health"];
export const WANTS: Category[] = ["Eating Out", "Entertainment", "Subscriptions", "Other"];

const round2 = (n: number) => Math.round(n * 100) / 100;

export function totals(txs: Transaction[]) {
  let income = 0;
  let spending = 0;
  let savingsTransfers = 0;
  for (const t of txs) {
    if (t.amount > 0) income += t.amount;
    else if (t.category === "Savings") savingsTransfers += -t.amount;
    else spending += -t.amount;
  }
  const saved = income - spending;
  const savingsRate = income > 0 ? saved / income : 0;
  return {
    income: round2(income),
    spending: round2(spending),
    savingsTransfers: round2(savingsTransfers),
    saved: round2(saved),
    savingsRate,
  };
}

export function spendingByCategory(txs: Transaction[]) {
  const map = new Map<Category, number>();
  for (const t of txs) {
    if (t.amount >= 0 || t.category === "Income" || t.category === "Savings") continue;
    map.set(t.category, (map.get(t.category) ?? 0) + -t.amount);
  }
  return [...map.entries()]
    .map(([category, value]) => ({ category, value: round2(value) }))
    .sort((a, b) => b.value - a.value);
}

/** Spending per ISO week (week starting Monday). */
export function spendingOverTime(txs: Transaction[]) {
  const map = new Map<string, number>();
  for (const t of txs) {
    if (t.amount >= 0 || t.category === "Savings") continue;
    const d = new Date(t.date + "T00:00:00Z");
    const day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day);
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + -t.amount);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, value]) => ({ week, value: round2(value) }));
}

/** 50/30/20 targets based on income vs actual needs / wants / savings. */
export function budget503020(txs: Transaction[]) {
  const { income, spending } = totals(txs);
  const byCat = spendingByCategory(txs);
  const sum = (cats: Category[]) =>
    round2(byCat.filter((c) => cats.includes(c.category)).reduce((s, c) => s + c.value, 0));
  const needs = sum(NEEDS);
  const wants = sum(WANTS);
  const savings = round2(Math.max(0, income - spending));
  return [
    { key: "Needs", pct: 50, target: round2(income * 0.5), actual: needs },
    { key: "Wants", pct: 30, target: round2(income * 0.3), actual: wants },
    { key: "Savings", pct: 20, target: round2(income * 0.2), actual: savings },
  ];
}

export function formatMoney(n: number, currency: Currency) {
  const locale = currency === "ZAR" ? "en-ZA" : currency === "GBP" ? "en-GB" : currency === "EUR" ? "de-DE" : "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

/** Plain-text summary passed to the AI (numbers computed here, not by the model). */
export function spendingSummary(txs: Transaction[], currency: Currency) {
  if (txs.length === 0) return "The user has not added any transactions yet.";
  const t = totals(txs);
  const cats = spendingByCategory(txs);
  const dates = txs.map((x) => x.date).sort();
  const lines = [
    `Period: ${dates[0]} to ${dates[dates.length - 1]} (${txs.length} transactions)`,
    `Total income: ${formatMoney(t.income, currency)}`,
    `Total spending (excluding savings transfers): ${formatMoney(t.spending, currency)}`,
    `Moved to savings: ${formatMoney(t.savingsTransfers, currency)}`,
    `Savings rate: ${(t.savingsRate * 100).toFixed(1)}%`,
    `Spending by category: ${cats.map((c) => `${c.category} ${formatMoney(c.value, currency)}`).join(", ")}`,
    `50/30/20 check: ${budget503020(txs)
      .map((b) => `${b.key} target ${formatMoney(b.target, currency)} vs actual ${formatMoney(b.actual, currency)}`)
      .join("; ")}`,
  ];
  return lines.join("\n");
}
