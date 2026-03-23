"use client";

import * as React from "react";

import { cn } from "./utils";

type TabsCtx = {
  value: string;
  setValue: (v: string) => void;
};

const TabsContext = React.createContext<TabsCtx | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function Tabs({ value, defaultValue, onValueChange, className, children, ...props }: TabsProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const isControlled = typeof value === "string";
  const current = isControlled ? (value as string) : uncontrolled;

  const setValue = (v: string) => {
    if (!isControlled) setUncontrolled(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div data-slot="tabs" className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="tabs-list"
      className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabsTrigger({ className, value, ...props }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs");
  const active = ctx.value === value;
  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      onClick={() => ctx.setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        active ? "bg-background text-foreground shadow" : "hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({ className, value, ...props }: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within Tabs");
  if (ctx.value !== value) return null;
  return (
    <div data-slot="tabs-content" className={cn("mt-2", className)} {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
