import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, PieChart, MessageCircleHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePenny, useHydrated } from "@/lib/pennywise/store";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PennyWise — a friendly AI budget coach" },
      { name: "description", content: "Understand where your money goes and learn money skills at your own pace with PennyWise." },
      { property: "og:title", content: "PennyWise — a friendly AI budget coach" },
      { property: "og:description", content: "Understand where your money goes and learn money skills at your own pace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const onboarded = usePenny((s) => s.profile.onboarded);
  const hydrated = useHydrated();
  const to = hydrated && onboarded ? "/dashboard" : "/onboarding";
  return (
    <div className="grid items-center gap-10 py-6 md:grid-cols-2 md:py-14">
      <div>
        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          No judgement. Just progress.
        </span>
        <h1 className="mt-5 text-5xl font-semibold leading-[1.05] md:text-6xl">
          Money feels lighter when you <span className="text-primary">understand it.</span>
        </h1>
        <p className="mt-5 max-w-md text-lg text-muted-foreground">
          PennyWise sorts your spending, shows you the big picture, and coaches you in language that fits where you are.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-full shadow-soft">
          <Link to={to}>
            {hydrated && onboarded ? "Open my dashboard" : "Get started — 2 minutes"} <ArrowRight />
          </Link>
        </Button>
        <div className="mt-10 grid max-w-md grid-cols-3 gap-3 text-sm">
          {[
            { i: PieChart, t: "See your spending" },
            { i: MessageCircleHeart, t: "Chat with a coach" },
            { i: GraduationCap, t: "Learn as you go" },
          ].map(({ i: I, t }) => (
            <div key={t} className="rounded-2xl bg-card p-3 shadow-soft">
              <I className="mb-2 size-5 text-primary" />
              {t}
            </div>
          ))}
        </div>
      </div>
      <img src={hero} alt="A plant growing from a stack of coins" className="mx-auto w-full max-w-md rounded-[2.5rem] shadow-soft" />
    </div>
  );
}
