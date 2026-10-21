import { createFileRoute } from "@tanstack/react-router";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ArrowDownRight, ArrowUpRight, PiggyBank, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { EmptyData } from "@/components/pennywise/EmptyData";
import { budget503020, formatMoney, spendingByCategory, spendingOverTime, totals } from "@/lib/pennywise/calc";
import { usePenny, useHydrated } from "@/lib/pennywise/store";
import { GOAL_LABELS } from "@/lib/pennywise/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PennyWise" },
      { name: "description", content: "Your income, spending, savings rate and 50/30/20 budget at a glance." },
      { property: "og:title", content: "Your money dashboard — PennyWise" },
      { property: "og:description", content: "Income, spending, savings rate and a 50/30/20 check." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const COLORS = Array.from({ length: 10 }, (_, i) => `var(--chart-${i + 1})`);

function Stat({ label, value, icon: I, hint }: { label: string; value: string; icon: typeof PiggyBank; hint?: string | undefined }) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <span className="grid size-9 place-items-center rounded-xl bg-secondary"><I className="size-4 text-primary" /></span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Dashboard() {
  const hydrated = useHydrated();
  const txs = usePenny((s) => s.transactions);
  const { currency, goal } = usePenny((s) => s.profile);
  if (!hydrated) return null;
  if (txs.length === 0) return <EmptyData />;

  const t = totals(txs);
  const cats = spendingByCategory(txs);
  const series = spendingOverTime(txs);
  const budget = budget503020(txs);
  const fm = (n: number) => formatMoney(n, currency);
  const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold">Your money, at a glance</h1>
        <p className="mt-1 text-muted-foreground">Goal: {GOAL_LABELS[goal]}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total income" value={fm(t.income)} icon={ArrowUpRight} />
        <Stat label="Total spending" value={fm(t.spending)} icon={ArrowDownRight} hint="Not counting money moved to savings" />
        <Stat label="Savings rate" value={`${(t.savingsRate * 100).toFixed(1)}%`} icon={PiggyBank} hint={t.savingsRate >= 0.2 ? "Brilliant — at or above 20% 🎉" : "Every bit you keep counts"} />
        <Stat label="Biggest category" value={cats[0]?.category ?? "—"} icon={Trophy} hint={cats[0] ? fm(cats[0].value) : undefined} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-3xl bg-card p-5 shadow-soft lg:col-span-2">
          <h2 className="text-xl font-semibold">Where it goes</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={cats} dataKey="value" nameKey="category" innerRadius="58%" outerRadius="90%" paddingAngle={2} stroke="none">
                  {cats.map((c, i) => <Cell key={c.category} fill={COLORS[i % COLORS.length]!} />)}
                </Pie>
                <Tooltip formatter={(v) => fm(Number(v))} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {cats.map((c, i) => (
              <li key={c.category} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1 truncate">{c.category}</span>
                <span className="tabular-nums text-muted-foreground">{((c.value / t.spending) * 100).toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-card p-5 shadow-soft lg:col-span-3">
          <h2 className="text-xl font-semibold">Spending week by week</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} width={60} />
                <Tooltip formatter={(v) => fm(Number(v))} contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="value" name="Spent" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-card p-6 shadow-soft">
        <h2 className="text-xl font-semibold">The 50/30/20 check</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A simple guide: about half your income on needs, a third on wants, and a fifth saved.
        </p>
        <div className="mt-5 space-y-5">
          {budget.map((b) => {
            const pct = b.target > 0 ? (b.actual / b.target) * 100 : 0;
            const good = b.key === "Savings" ? pct >= 100 : pct <= 100;
            return (
              <div key={b.key}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold">{b.key} <span className="font-normal text-muted-foreground">({b.pct}%)</span></span>
                  <span className="tabular-nums">{fm(b.actual)} <span className="text-muted-foreground">/ {fm(b.target)}</span></span>
                </div>
                <Progress value={Math.min(pct, 100)} className="h-3" />
                <p className={`mt-1 text-xs ${good ? "text-success" : "text-warning"}`}>
                  {b.key === "Savings"
                    ? good ? "You're hitting your savings target 🌟" : `${fm(b.target - b.actual)} to go to reach 20%`
                    : good ? "Within the guide" : `${fm(b.actual - b.target)} over the guide — worth a look`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
