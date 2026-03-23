"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { usePathname, useRouter } from "@/navigation";

export default function ClientProtected({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (authLoading) return;
    if (user) return;

    const next = encodeURIComponent(`${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`);
    router.replace(`/auth/sign-in?next=${next}`);
  }, [authLoading, user, router, pathname, searchParams]);

  if (authLoading) {
    return (
      fallback ?? (
        <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">
          Loading...
        </div>
      )
    );
  }

  if (!user) return null;
  return <>{children}</>;
}
