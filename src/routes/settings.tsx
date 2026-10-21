import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resetAll, setState, usePenny } from "@/lib/pennywise/store";
import { GOAL_LABELS, type Currency, type Goal, type Level } from "@/lib/pennywise/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PennyWise" },
      { name: "description", content: "Change your coaching level, money goal and currency." },
      { property: "og:title", content: "Settings — PennyWise" },
      { property: "og:description", content: "Change your coaching level, goal and currency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium">{label}</span>
      <div className="w-full sm:w-64">{children}</div>
    </div>
  );
}

function Settings() {
  const profile = usePenny((s) => s.profile);
  const navigate = useNavigate();
  const update = (p: Partial<typeof profile>) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } }));
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-4xl font-semibold">Settings</h1>
      <div className="mt-6 divide-y rounded-3xl bg-card px-6 shadow-soft">
        <Row label="Coaching level">
          <Select value={profile.level} onValueChange={(v) => update({ level: v as Level })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["Beginner", "Intermediate", "Advanced"] as Level[]).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Main goal">
          <Select value={profile.goal} onValueChange={(v) => update({ goal: v as Goal })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => <SelectItem key={g} value={g}>{GOAL_LABELS[g]}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Currency">
          <Select value={profile.currency} onValueChange={(v) => update({ currency: v as Currency })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["ZAR", "USD", "EUR", "GBP"] as Currency[]).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Coach conversation">
          <Button variant="outline" className="w-full" onClick={() => { setState((s) => ({ ...s, chat: [] })); toast.success("Conversation cleared"); }}>
            Clear chat
          </Button>
        </Row>
        <Row label="Start over">
          <Button variant="destructive" className="w-full" onClick={() => { resetAll(); navigate({ to: "/onboarding" }); }}>
            Delete all my data
          </Button>
        </Row>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Your data stays in this browser only.</p>
    </div>
  );
}
