import { describe, expect, it } from "vitest";
import { budget503020, spendingByCategory, totals } from "./calc";
import type { Transaction } from "./types";

const tx = (amount: number, category: Transaction["category"]): Transaction => ({
  id: Math.random().toString(),
  date: "2026-08-01",
  description: "x",
  amount,
  category,
});

const data = [tx(10000, "Income"), tx(-4000, "Rent"), tx(-1000, "Eating Out"), tx(-2000, "Savings")];

describe("calc", () => {
  it("excludes savings transfers from spending", () => {
    expect(totals(data).spending).toBe(5000);
  });
  it("savings rate is (income - spending) / income", () => {
    expect(totals(data).savingsRate).toBeCloseTo(0.5);
  });
  it("50/30/20 targets come from income", () => {
    expect(budget503020(data).map((b) => b.target)).toEqual([5000, 3000, 2000]);
  });
  it("biggest category first", () => {
    expect(spendingByCategory(data)[0].category).toBe("Rent");
  });
});
