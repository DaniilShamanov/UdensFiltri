"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      richColors
      closeButton
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-md",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold",
          description: "group-[.toast]:text-xs group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-secondary/15 group-[.toaster]:to-primary/15 group-[.toaster]:border-primary/35",
          error:
            "group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-destructive/20 group-[.toaster]:to-accent/10 group-[.toaster]:border-destructive/45",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-foreground",
          closeButton:
            "group-[.toast]:border-border group-[.toast]:bg-background/80 group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "color-mix(in oklab, var(--primary) 16%, var(--popover))",
          "--success-text": "var(--popover-foreground)",
          "--success-border": "color-mix(in oklab, var(--primary) 35%, var(--border))",
          "--error-bg": "color-mix(in oklab, var(--destructive) 12%, var(--popover))",
          "--error-text": "var(--popover-foreground)",
          "--error-border": "color-mix(in oklab, var(--destructive) 35%, var(--border))",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
