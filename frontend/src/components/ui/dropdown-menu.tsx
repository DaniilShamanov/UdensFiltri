"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "./utils";

type Ctx = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const DropdownContext = React.createContext<Ctx | null>(null);

function mergeClassName(existing: any, next: string) {
  if (!existing) return next;
  return cn(existing, next);
}

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement>(null);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </DropdownContext.Provider>
  );
}

function DropdownMenuTrigger({
  children,
  className,
  asChild = false,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");

  const onClick = () => ctx.setOpen((prev) => !prev);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      ref: ctx.triggerRef as any,
      onClick: (...args: any[]) => {
        (children as any).props?.onClick?.(...args);
        onClick();
      },
      className: mergeClassName((children as any).props?.className, className ?? ""),
      "aria-haspopup": "menu",
      "aria-expanded": ctx.open,
    });
  }

  return (
    <button
      type="button"
      ref={ctx.triggerRef as any}
      className={cn("inline-flex", className)}
      onClick={onClick}
      aria-haspopup="menu"
      aria-expanded={ctx.open}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end";
}) {
  const ctx = React.useContext(DropdownContext);
  const [mounted, setMounted] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!ctx?.open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (contentRef.current?.contains(t)) return;
      if (ctx.triggerRef.current?.contains(t)) return;
      ctx.setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [ctx]);

  if (!ctx?.open || !mounted) return null;

  const rect = ctx.triggerRef.current?.getBoundingClientRect();
  const top = (rect?.bottom ?? 0) + 8 + window.scrollY;
  const leftBase = (rect?.left ?? 0) + window.scrollX;
  const left = align === "end" ? leftBase + (rect?.width ?? 0) : leftBase;

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      className={cn(
        "z-50 min-w-[10rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
        className,
      )}
      style={{
        position: "absolute",
        top,
        left,
        transform: align === "end" ? "translateX(-100%)" : undefined,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onSelect?: () => void;
  asChild?: boolean;
}

function DropdownMenuItem({
  children,
  className,
  onSelect,
  asChild = false
}: DropdownMenuItemProps) {
  const ctx = React.useContext(DropdownContext);
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted focus:outline-none",
        className,
      )}
      onClick={() => {
        onSelect?.();
        ctx?.setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div role="separator" className={cn("my-1 h-px bg-border", className)} />;
}

function DropdownMenuLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
