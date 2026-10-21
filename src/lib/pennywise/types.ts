export const CATEGORIES = [
  "Groceries",
  "Transport",
  "Eating Out",
  "Rent",
  "Entertainment",
  "Subscriptions",
  "Utilities",
  "Health",
  "Savings",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type TxCategory = Category | "Income";

export type Level = "Beginner" | "Intermediate" | "Advanced";
export type Goal = "save" | "debt" | "emergency" | "invest" | "budget";
export type Currency = "ZAR" | "USD" | "EUR" | "GBP";

export const GOAL_LABELS: Record<Goal, string> = {
  save: "Save for something",
  debt: "Clear debt",
  emergency: "Build an emergency fund",
  invest: "Start investing",
  budget: "General budgeting",
};

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive = income, negative = expense
  category: TxCategory;
}

export interface Profile {
  onboarded: boolean;
  level: Level;
  goal: Goal;
  currency: Currency;
}

export function isCategory(v: unknown): v is Category {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}
