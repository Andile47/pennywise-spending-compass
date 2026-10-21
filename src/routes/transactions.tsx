import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Database, Loader2, Plus, Wand2 as Wand, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseStatementCsv } from "@/lib/pennywise/csv";
import { sampleTransactions } from "@/lib/pennywise/sample";
import { categorizeWithAI } from "@/lib/pennywise/categorize";
import { formatMoney } from "@/lib/pennywise/calc";
import { setState, usePenny } from "@/lib/pennywise/store";
import { CATEGORIES, type Transaction, type TxCategory } from "@/lib/pennywise/types";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Money in & out — PennyWise" },
      { name: "description", content: "Upload a bank statement or add income and expenses; AI sorts each into a category." },
      { property: "og:title", content: "Money in & out — PennyWise" },
      { property: "og:description", content: "Upload a statement, add transactions, and let AI sort your spending." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TransactionsPage,
});

async function addAndCategorize(rows: Transaction[] | null, replace: boolean, setBusy: (b: boolean) => void) {
  if (rows) setState((s) => ({ ...s, transactions: replace ? rows : [...s.transactions, ...rows] }));
  setBusy(true);
  try {
    const n = await categorizeWithAI(rows ? rows.filter((r) => r.amount < 0).map((r) => r.id) : undefined);
    toast.success(`Sorted ${n} transactions into categories`);
  } catch (e) {
    toast.error((e as Error).message, { description: "You can still set categories by hand below." });
  } finally {
    setBusy(false);
  }
}

function TransactionsPage() {
  const txs = usePenny((s) => s.transactions);
  const currency = usePenny((s) => s.profile.currency);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), description: "", amount: "", type: "expense" });

  const onFile = async (f: File) => {
    const { rows, skipped } = parseStatementCsv(await f.text());
    if (rows.length === 0) return toast.error("We couldn't find any transactions", { description: "Use columns: date, description, amount." });
    if (skipped) toast.message(`Skipped ${skipped} rows we couldn't read`);
    await addAndCategorize(rows, false, setBusy);
  };

  const addManual = async () => {
    const amt = Math.abs(Number(form.amount));
    if (!form.description.trim() || !amt) return toast.error("Add a description and an amount");
    const row: Transaction = {
      id: `m-${Date.now()}`,
      date: form.date,
      description: form.description.trim(),
      amount: form.type === "income" ? amt : -amt,
      category: form.type === "income" ? "Income" : "Other",
    };
    setForm({ ...form, description: "", amount: "" });
    await addAndCategorize([row], false, setBusy);
  };

  const sorted = [...txs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">Money in & out</h1>
          <p className="mt-1 text-muted-foreground">Add your transactions — PennyWise's AI sorts them for you.</p>
        </div>
        {txs.length > 0 && (
          <Button asChild className="rounded-full">
            <Link to="/dashboard">See my dashboard</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-card p-6 shadow-soft">
          <Upload className="size-6 text-primary" />
          <h2 className="mt-3 text-xl font-semibold">Upload a statement</h2>
          <p className="mt-1 text-sm text-muted-foreground">A CSV file with columns: date, description, amount.</p>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <Button variant="secondary" className="mt-4 rounded-full" disabled={busy} onClick={() => fileRef.current?.click()}>
            Choose CSV file
          </Button>
        </div>
        <div className="rounded-3xl bg-card p-6 shadow-soft">
          <Database className="size-6 text-primary" />
          <h2 className="mt-3 text-xl font-semibold">Try sample data</h2>
          <p className="mt-1 text-sm text-muted-foreground">Two months of realistic transactions to explore the app.</p>
          <Button variant="secondary" className="mt-4 rounded-full" disabled={busy} onClick={() => addAndCategorize(sampleTransactions(), true, setBusy)}>
            Load sample data
          </Button>
        </div>
        <div className="rounded-3xl bg-card p-6 shadow-soft">
          <Plus className="size-6 text-primary" />
          <h2 className="mt-3 text-xl font-semibold">Add one by hand</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="col-span-2" />
            <Input placeholder="e.g. Coffee at Vida" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="col-span-2" />
            <Input type="number" inputMode="decimal" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="mt-3 w-full rounded-full" disabled={busy} onClick={addManual}>Add</Button>
        </div>
      </div>

      {busy && (
        <div className="flex items-center gap-3 rounded-2xl bg-secondary px-5 py-4 text-sm text-secondary-foreground">
          <Loader2 className="size-4 animate-spin" /> Sorting your transactions into categories…
        </div>
      )}

      {txs.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
          Nothing here yet. Pick one of the options above to get started 🌱
        </div>
      ) : (
        <div className="rounded-3xl bg-card p-2 shadow-soft md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-3">
            <p className="text-sm text-muted-foreground">{txs.length} transactions · tap a category to correct it</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => addAndCategorize(null, false, setBusy)}>
                <Wand /> Re-sort "Other"
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setState((s) => ({ ...s, transactions: [] }))}>
                <Trash2 /> Clear all
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{t.date}</TableCell>
                  <TableCell className="max-w-[220px] truncate font-medium">{t.description}</TableCell>
                  <TableCell className={`text-right tabular-nums ${t.amount > 0 ? "text-success" : ""}`}>
                    {formatMoney(t.amount, currency)}
                  </TableCell>
                  <TableCell>
                    {t.amount > 0 ? (
                      <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Income</span>
                    ) : (
                      <Select
                        value={t.category}
                        onValueChange={(v) =>
                          setState((s) => ({ ...s, transactions: s.transactions.map((x) => (x.id === t.id ? { ...x, category: v as TxCategory } : x)) }))
                        }
                      >
                        <SelectTrigger className="h-8 w-[150px] rounded-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
