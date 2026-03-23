"use client";

import * as React from "react";

import { cn } from "./utils";

type RadioGroupContextValue = {
  name: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

function RadioGroup({
  className,
  name,
  value,
  defaultValue,
  onValueChange,
  disabled,
  children,
  ...props
}: RadioGroupProps) {
  const autoName = React.useId();
  const groupName = name ?? `radiogroup-${autoName}`;

  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const isControlled = typeof value === "string";
  const currentValue = isControlled ? value : uncontrolled;

  const setValue = (next: string) => {
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
  };

  return (
    <RadioGroupContext.Provider
      value={{ name: groupName, value: currentValue, onValueChange: setValue, disabled }}
    >
      <div
        role="radiogroup"
        data-slot="radio-group"
        className={cn("grid gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: string;
}

function RadioGroupItem({ className, value, disabled, id, ...props }: RadioGroupItemProps) {
  const ctx = React.useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error("RadioGroupItem must be used within RadioGroup");
  }

  const isDisabled = ctx.disabled || disabled;
  const checked = ctx.value === value;

  return (
    <label
      data-slot="radio-group-item"
      className={cn("inline-flex items-center gap-2", isDisabled && "opacity-50", className)}
    >
      <span
        className={cn(
          "relative inline-flex size-4 items-center justify-center rounded-full border bg-input-background",
          checked && "border-primary",
        )}
      >
        <span
          className={cn(
            "size-2 rounded-full bg-primary transition-opacity",
            checked ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
      <input
        type="radio"
        className="sr-only"
        name={ctx.name}
        id={id}
        disabled={isDisabled}
        checked={checked}
        onChange={() => ctx.onValueChange?.(value)}
        value={value}
        {...props}
      />
    </label>
  );
}

export { RadioGroup, RadioGroupItem };
