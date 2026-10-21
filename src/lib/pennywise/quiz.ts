import type { Level } from "./types";

export const QUIZ = [
  { q: "If you put money in a savings account that pays interest, what happens over time?", options: ["It shrinks", "It grows a little extra", "It stays exactly the same"], answer: 1 },
  { q: "What is an emergency fund?", options: ["Money set aside for surprise costs", "A loan from the bank", "A type of insurance"], answer: 0 },
  { q: "In the 50/30/20 rule, what is the 20% for?", options: ["Rent", "Fun", "Savings and paying off debt"], answer: 2 },
  { q: "Which usually costs more in total: paying only the minimum on a credit card, or paying it off in full?", options: ["Paying the minimum", "Paying in full", "They cost the same"], answer: 0 },
  { q: "With prices rising 6% a year and savings earning 4%, what happens to what your savings can buy?", options: ["It increases", "It decreases", "It stays the same"], answer: 1 },
] as const;

export function levelFromScore(score: number): Level {
  if (score <= 2) return "Beginner";
  if (score <= 4) return "Intermediate";
  return "Advanced";
}
