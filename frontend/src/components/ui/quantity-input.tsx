// components/ProductQuantity.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductQuantityProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const ProductQuantity: React.FC<ProductQuantityProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(String(value));

  // Sync local state when external value changes (e.g., reset or cart update)
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const clamp = (num: number) => Math.min(max, Math.max(min, num));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow empty string temporarily for better UX
    if (raw === '') {
      setInputValue('');
      return;
    }
    // Only allow digits and limit length to 2 (max two digits)
    if (/^\d{0,2}$/.test(raw)) {
      setInputValue(raw);
    }
  };

  const handleBlur = () => {
    if (inputValue === '') {
      // If empty, revert to min
      const clamped = clamp(min);
      setInputValue(String(clamped));
      onChange(clamped);
      return;
    }
    const num = parseInt(inputValue, 10);
    if (isNaN(num)) {
      // Fallback to min
      const clamped = clamp(min);
      setInputValue(String(clamped));
      onChange(clamped);
    } else {
      const clamped = clamp(num);
      setInputValue(String(clamped));
      onChange(clamped);
    }
  };

  const handleDecrease = () => {
    const newVal = clamp(value - 1);
    setInputValue(String(newVal));
    onChange(newVal);
  };

  const handleIncrease = () => {
    const newVal = clamp(value + 1);
    setInputValue(String(newVal));
    onChange(newVal);
  };

  return (
    <div className={`flex items-center border rounded-lg ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleDecrease}
        disabled={value <= min}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        type="text"
        inputMode="numeric"
        pattern="\d*"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="h-8 w-12 rounded-none border-y-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleIncrease}
        disabled={value >= max}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};