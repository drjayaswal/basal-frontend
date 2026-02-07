"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Services } from "@/components/app/Services";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Loading from "@/components/ui/loading";
import { UserData } from "@/lib/interface";

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const res = await fetch(
          `${getBaseUrl()}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          toast.error("Session expired");
        }
      } catch (err) {
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <Loading/>
  if (!user) return router.push("/connect")

  return (
    <div>
      <Services user={user} />
    </div>
  );
}
