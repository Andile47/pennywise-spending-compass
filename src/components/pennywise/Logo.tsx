export function Logo({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="20" cy="20" r="19" className="fill-primary" />
      <circle cx="20" cy="20" r="13" className="fill-accent" />
      <path d="M20 11c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9z" className="fill-primary" />
      <path d="M20 17v12" className="stroke-primary-foreground" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
