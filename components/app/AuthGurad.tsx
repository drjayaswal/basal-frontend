"use client";

import { useEffect} from "react";
import { useRouter, usePathname } from "next/navigation";
import { getBaseUrl } from "@/lib/utils";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const publicPaths = ["/connect", "/developers"];
    const isPublicPath = publicPaths.includes(pathname);
    const token = localStorage.getItem("token");

    if (!token) {
      if (!isPublicPath) {
        router.push("/connect");
      }
      return;
    }

    fetch(`${getBaseUrl()}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          if (isPublicPath && pathname !== "/developers") {
            router.push("/");
          }
        } else {
          localStorage.removeItem("token");
          if (!isPublicPath) {
            router.push("/connect");
          }
        }
      })
      .catch(() => {
        if (!isPublicPath) router.push("/connect");
      })
  }, [pathname, router]);

  return <>{children}</>;
}