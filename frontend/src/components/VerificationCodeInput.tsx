"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VerificationCodeInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  banner?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

/**
 * VerificationCodeInput Component
 * 
 * A reusable input component for entering verification codes.
 * Displays a notification banner and an input field styled for code entry.
 * 
 * @example
 * ```tsx
 * <VerificationCodeInput
 *   id="email-code"
 *   value={code}
 *   onChange={(e) => setCode(e.target.value)}
 *   label="Verification code"
 *   placeholder="Enter code from email"
 *   banner="Verification code has been sent to your email."
 *   autoFocus
 * />
 * ```
 */
export default function VerificationCodeInput({
  id,
  value,
  onChange,
  label = "Verification code",
  placeholder = "Enter code from email",
  banner,
  autoFocus = false,
  disabled = false,
}: VerificationCodeInputProps) {
  return (
    <div className="space-y-2">
      {banner && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
          {banner}
        </div>
      )}
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        disabled={disabled}
      />
    </div>
  );
}
