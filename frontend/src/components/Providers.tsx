"use client";

import { AppProvider } from "@/contexts/AppContext";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      {children}
      <Toaster richColors position="top-center" />
    </AppProvider>
  );
}
