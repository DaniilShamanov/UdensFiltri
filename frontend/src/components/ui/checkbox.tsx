"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "./utils";

export type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  id?: string;
  name?: string;
  value?: string;
  "aria-label"?: string;
};

function Checkbox({
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
  className,
  ...rest
}: CheckboxProps) {
  const [uncontrolled, setUncontrolled] = React.useState(!!defaultChecked);
  const isControlled = typeof checked === "boolean";
  const isChecked = isControlled ? checked : uncontrolled;

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) setUncontrolled(next);
    onCheckedChange?.(next);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={toggle}
      data-slot="checkbox"
      className={cn(
        "peer inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border bg-input-background shadow-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        isChecked && "bg-primary text-primary-foreground border-primary",
        className,
      )}
      {...rest}
    >
      {isChecked ? <CheckIcon className="size-3.5" /> : null}
    </button>
  );
}

export { Checkbox };
