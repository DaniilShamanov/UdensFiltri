"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "./utils";

type Item = { value: string; label: string; disabled?: boolean };

type SelectCtx = {
  value?: string;
  setValue: (v: string) => void;
  placeholder?: string;
  items: Item[];
  register: (item: Item) => void;
  unregister: (value: string) => void;
  disabled?: boolean;
};

const SelectContext = React.createContext<SelectCtx | null>(null);

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function Select({ value, defaultValue, onValueChange, disabled, children }: SelectProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const isControlled = typeof value === "string";
  const isControlledRef = React.useRef(isControlled);
  isControlledRef.current = isControlled;

  const [items, setItems] = React.useState<Item[]>([]);

  const setValue = React.useCallback((v: string) => {
    if (!isControlledRef.current) setUncontrolled(v);
    onValueChange?.(v);
  }, [onValueChange]);

  const register = React.useCallback((item: Item) => {
    setItems((prev) => (prev.some((p) => p.value === item.value) ? prev : [...prev, item]));
  }, []);

  const unregister = React.useCallback((val: string) => {
    setItems((prev) => prev.filter((p) => p.value !== val));
  }, []);

  const contextValue = React.useMemo(
    () => ({
      value: isControlled ? value : uncontrolled,
      setValue,
      items,
      register,
      unregister,
      disabled,
    }),
    [isControlled, value, uncontrolled, setValue, items, register, unregister, disabled]
  );

  return (
    <SelectContext.Provider value={contextValue}>
      {children}
    </SelectContext.Provider>
  );
}

function SelectTrigger({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("SelectTrigger must be used within Select");

  return (
    <div className={cn("relative", className)} data-slot="select-trigger">
      <select
        disabled={ctx.disabled}
        value={ctx.value ?? ""}
        onChange={(e) => ctx.setValue(e.target.value)}
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-border bg-background px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {/* Render all registered items as options */}
        {ctx.items.map((item) => (
          <option key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </option>
        ))}
        
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

/*function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  // We render placeholder as a disabled option. Actual label comes from options.
  if (!placeholder) return null;
  return null;
}*/

function SelectContent({ children }: { children: React.ReactNode }) {
  // Content is flattened directly into the <select>
  return <>{children}</>;
}

function SelectItem({ value, disabled, children }: SelectItemProps) {
  const ctx = React.useContext(SelectContext);
  const label = typeof children === "string" ? children : String(value);

  React.useEffect(() => {
    if (!ctx) return;
    ctx.register({ value, label, disabled });
    return () => ctx.unregister(value);
  }, [value, label, disabled, ctx?.register, ctx?.unregister]);

  return null;
}

export { Select, SelectTrigger, SelectContent, SelectItem };
