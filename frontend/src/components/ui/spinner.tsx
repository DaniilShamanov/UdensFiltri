"use client";

export function Spinner({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <div className={`rounded-full border-4 border-primary/25 border-t-primary animate-spin ${className}`} />
  );
}