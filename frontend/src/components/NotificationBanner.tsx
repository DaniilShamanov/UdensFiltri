"use client";

import React from "react";

type NotificationBannerProps = {
  title: string;
  description?: string;
  onDismiss?: () => void;
  className?: string;
  dismissLabel?: string;
  variant?: "info" | "warning";
};

export default function NotificationBanner({
  title,
  description,
  onDismiss,
  className = "",
  dismissLabel = "Dismiss",
  variant = "warning",
}: NotificationBannerProps) {
  const tone = variant === "info"
    ? "border-t border-primary/20 bg-blue-100/60 text-blue-900"
    : "border-t border-primary/20 bg-amber-100/60 text-amber-900";

  return (
    <div className={`${tone} px-4 py-2 text-sm ${className}`} role="status" aria-live="polite">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{title}</p>
          {description ? <p>{description}</p> : null}
        </div>
        {onDismiss ? (
          <button type="button" onClick={onDismiss} className="cursor-pointer font-medium underline">
            {dismissLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
