import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, ListChecks, MessageCircleHeart, Moon, Settings, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Money in & out", icon: ListChecks },
  { to: "/coach", label: "Coach", icon: MessageCircleHeart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const d = localStorage.getItem("pennywise:theme") === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle dark mode"
      onClick={() => {
        const d = !dark;
        setDark(d);
        document.documentElement.classList.toggle("dark", d);
        localStorage.setItem("pennywise:theme", d ? "dark" : "light");
      }}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const bare = path === "/" || path === "/onboarding";
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-xl font-semibold">PennyWise</span>
          </Link>
          {!bare && (
            <nav className="ml-auto hidden gap-1 md:flex">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                  activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                >
                  <n.icon className="size-4" />
                  {n.label}
                </Link>
              ))}
            </nav>
          )}
          <div className={bare ? "ml-auto" : "md:ml-0 ml-auto"}>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className={`mx-auto w-full max-w-6xl flex-1 px-4 py-8 ${bare ? "" : "pb-28 md:pb-8"}`}>{children}</main>
      <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground mb-16 md:mb-0">
        PennyWise is an educational tool and does not provide professional financial advice.
      </footer>
      {!bare && (
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-card md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <n.icon className="size-5" />
              {n.label.split(" ")[0]}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
