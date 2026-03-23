"use client";

import * as React from "react";

import { cn } from "./utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string | number;
}

function ScrollArea({ className, maxHeight, style, ...props }: ScrollAreaProps) {
  return (
    <div
      data-slot="scroll-area"
      className={cn("overflow-auto", "no-scrollbar", className)}
      style={{ ...style, maxHeight }}
      {...props}
    />
  );
}

export { ScrollArea };
