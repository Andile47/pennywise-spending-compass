import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import confetti from "canvas-confetti";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QUIZ, levelFromScore } from "@/lib/pennywise/quiz";
import { setState } from "@/lib/pennywise/store";
import { GOAL_LABELS, type Currency, type Goal, type Level } from "@/lib/pennywise/types";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — PennyWise" },
      { name: "description", content: "Take a quick 5-question quiz so PennyWise can coach you at the right level." },
      { property: "og:title", content: "Get started with PennyWise" },
      { property: "og:description", content: "A quick quiz, your goal, and your currency — then you're set." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const CURRENCIES: Currency[] = ["ZAR", "USD", "EUR", "GBP"];
const TOTAL = QUIZ.length + 2;

function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border-2 bg-card px-5 py-4 text-left font-medium transition-all hover:border-primary/60 ${
        selected ? "border-primary bg-secondary" : "border-border"
      }`}
    >
      {children}
      {selected && <Check className="size-5 text-primary" />}
    </button>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ.map(() => null));
  const [goal, setGoal] = useState<Goal | null>(null);
  const [currency, setCurrency] = useState<Currency>("ZAR");
  const [result, setResult] = useState<Level | null>(null);

  const finish = () => {
    const score = answers.reduce<number>((s, a, i) => s + (a === QUIZ[i].answer ? 1 : 0), 0);
    const level = levelFromScore(score);
    setResult(level);
    setState((s) => ({ ...s, profile: { onboarded: true, level, goal: goal ?? "budget", currency } }));
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  };

  if (result) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl bg-card p-10 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">You're all set</p>
        <h1 className="mt-3 text-4xl font-semibold">Level: {result}</h1>
        <p className="mt-3 text-muted-foreground">
          Your coach will talk to you at this level. You can change it anytime in Settings.
        </p>
        <Button size="lg" className="mt-8 rounded-full" onClick={() => navigate({ to: "/transactions" })}>
          Add my money data
        </Button>
      </div>
    );
  }

  const isQuiz = step < QUIZ.length;
  const canNext = isQuiz ? answers[step] !== null : step === QUIZ.length ? goal !== null : true;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 flex items-center gap-3">
        <Progress value={((step + 1) / TOTAL) * 100} className="h-2" />
        <span className="shrink-0 text-xs text-muted-foreground">
          {step + 1} / {TOTAL}
        </span>
      </div>
      {isQuiz && (
        <>
          <p className="text-sm font-semibold text-primary">Quick check — no wrong feelings, only wrong answers 😉</p>
          <h1 className="mt-2 text-3xl font-semibold">{QUIZ[step].q}</h1>
          <div className="mt-6 space-y-3">
            {QUIZ[step].options.map((o, i) => (
              <Choice key={o} selected={answers[step] === i} onClick={() => setAnswers((a) => a.map((v, j) => (j === step ? i : v)))}>
                {o}
              </Choice>
            ))}
            <button
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => {
                setAnswers((a) => a.map((v, j) => (j === step ? -1 : v)));
                setStep(step + 1);
              }}
            >
              I'm not sure
            </button>
          </div>
        </>
      )}
      {step === QUIZ.length && (
        <>
          <h1 className="text-3xl font-semibold">What's your main money goal?</h1>
          <div className="mt-6 space-y-3">
            {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
              <Choice key={g} selected={goal === g} onClick={() => setGoal(g)}>
                {GOAL_LABELS[g]}
              </Choice>
            ))}
          </div>
        </>
      )}
      {step === QUIZ.length + 1 && (
        <>
          <h1 className="text-3xl font-semibold">Which currency do you use?</h1>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {CURRENCIES.map((c) => (
              <Choice key={c} selected={currency === c} onClick={() => setCurrency(c)}>
                {c}
              </Choice>
            ))}
          </div>
        </>
      )}
      <div className="mt-8 flex justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        <Button className="rounded-full px-8" disabled={!canNext} onClick={() => (step === TOTAL - 1 ? finish() : setStep(step + 1))}>
          {step === TOTAL - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
