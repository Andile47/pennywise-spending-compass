import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyData({ title = "No money data yet" }: { title?: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-dashed bg-card p-10 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-secondary">
        <Sprout className="size-7 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Add a bank statement, type in a few transactions, or try the sample data to see PennyWise in action.
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/transactions">Add your money</Link>
      </Button>
    </div>
  );
}
