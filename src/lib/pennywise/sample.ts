import type { Transaction } from "./types";

// [day offset, description, amount]. Month 1 = Aug 2026, Month 2 = Sep 2026.
const MONTH: [number, string, number][] = [
  [1, "SALARY ACME HOLDINGS PTY", 24500],
  [1, "DEBIT ORDER RENT PROPERTY MGMT", -7800],
  [2, "POS PURCHASE WOOLWORTHS 4432", -642.5],
  [3, "UBER TRIP HELP.UBER.COM", -86.4],
  [3, "NETFLIX.COM SUBSCRIPTION", -199],
  [4, "CITY POWER PREPAID ELEC", -650],
  [5, "POS PURCHASE CHECKERS HYPER", -1123.8],
  [6, "NANDOS ROSEBANK", -245],
  [7, "ENGEN FUEL GARAGE 221", -720],
  [8, "SPOTIFY P0A1B2", -69.99],
  [9, "DISCHEM PHARMACY SANDTON", -312.6],
  [10, "TRANSFER TO TFSA SAVINGS", -1500],
  [11, "UBER EATS ORDER", -189.9],
  [12, "STER KINEKOR CINEMA", -260],
  [13, "POS PURCHASE PICK N PAY", -854.3],
  [14, "VODACOM AIRTIME DEBIT", -399],
  [15, "MUGG AND BEAN MELROSE", -178],
  [17, "GAUTRAIN CARD TOP UP", -300],
  [18, "POS PURCHASE WOOLWORTHS 4432", -512.2],
  [19, "TAKEALOT.COM ONLINE", -449],
  [20, "FREELANCE PAYMENT DESIGN JOB", 3200],
  [21, "VIRGIN ACTIVE GYM", -545],
  [22, "KFC DRIVE THRU", -112.5],
  [24, "POS PURCHASE CHECKERS HYPER", -967.4],
  [25, "CITY OF JHB WATER RATES", -420],
  [26, "SHOWMAX SUBSCRIPTION", -99],
  [27, "BOLT RIDE", -64],
  [28, "OCEAN BASKET RESTAURANT", -386],
  [29, "COMPUTICKET EVENT", -350],
  [30, "ENGEN FUEL GARAGE 221", -650],
];

function build(year: number, month: number, scale: number, prefix: string): Transaction[] {
  return MONTH.map(([day, description, amount], i) => {
    const vary = amount > 0 || /RENT|NETFLIX|SPOTIFY|SHOWMAX|GYM|TFSA|AIRTIME/.test(description) ? 1 : scale + (i % 3) * 0.04;
    return {
      id: `${prefix}-${i}`,
      date: `${year}-${String(month).padStart(2, "0")}-${String(Math.min(day, 30)).padStart(2, "0")}`,
      description,
      amount: Math.round(amount * vary * 100) / 100,
      category: amount > 0 ? "Income" : "Other",
    } satisfies Transaction;
  });
}

/** ~60 realistic transactions across two months, uncategorized so the AI can categorize them. */
export function sampleTransactions(): Transaction[] {
  return [...build(2026, 8, 1, "s1"), ...build(2026, 9, 1.08, "s2")];
}
