"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "./utils";

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const SheetContext = React.createContext<Ctx | null>(null);

function mergeClassName(existing: any, next: string) {
  if (!existing) return next;
  return cn(existing, next);
}

function Sheet({ children, open: controlledOpen, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const isControlled = typeof controlledOpen === "boolean";
  const open = isControlled ? (controlledOpen as boolean) : uncontrolled;
  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolled(v);
    onOpenChange?.(v);
  };
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

function SheetTrigger({
  children,
  className,
  asChild = false,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("SheetTrigger must be used within Sheet");

  const onClick = () => ctx.setOpen(true);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onClick: (...args: any[]) => {
        (children as any).props?.onClick?.(...args);
        onClick();
      },
      className: mergeClassName((children as any).props?.className, className ?? ""),
    });
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}

function SheetClose({
  children,
  className,
  asChild = false,
}: {
  children?: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("SheetClose must be used within Sheet");

  const onClick = () => ctx.setOpen(false);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onClick: (...args: any[]) => {
        (children as any).props?.onClick?.(...args);
        onClick();
      },
      className: mergeClassName((children as any).props?.className, className ?? ""),
    });
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {children ?? <X className="h-4 w-4" />}
    </button>
  );
}

function SheetContent({
  children,
  className,
  side = "right",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
}) {
  const ctx = React.useContext(SheetContext);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (!ctx?.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx.setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ctx]);

  if (!ctx?.open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => ctx.setOpen(false)} />
      <div
        className={cn(
          "absolute top-0 h-full w-[90vw] max-w-sm bg-background shadow-xl",
          side === "right" ? "right-0" : "left-0",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose };
