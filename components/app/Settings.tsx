"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Power, Home, Wrench } from "lucide-react";

interface UserData {
  email: string;
  id: string;
  authenticated?: boolean;
}

interface SettingsProps {
  user: UserData | null;
}

export function Settings({ user }: SettingsProps) {
  const router = useRouter();
  
  const handleLogout = () => {
    toast.info("Logout?", {
      description: "You will be logged out of your account",
      action: {
        label: "Logout",
        onClick: () => {
          localStorage.removeItem("token");
          localStorage.removeItem("user_email");
          toast.success("Logged out successfully");
          router.push("/connect");
        },
      },
    });
  };

  if (!user) return null;

  return (
    <div className="w-full text-white p-10">
      <div className="sm:min-w-3xl min-w-xs mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
            Settings
          </h1>

          <div className="flex border border-b-0 border-white/30 items-center w-full sm:w-auto">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-3 bg-black text-white p-3 cursor-pointer duration-200 font-bold transition-all hover:bg-indigo-600"
              >
                <Home className="w-5 h-5" />
              </button>

              <button
                onClick={() => router.push("/services")}
                className="flex items-center gap-3 bg-black text-white p-3 cursor-pointer duration-200 font-bold transition-all hover:bg-indigo-600"
              >
                <Wrench className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 bg-black text-white p-3 cursor-pointer duration-200 font-bold transition-all hover:bg-rose-600"

              >
                <Power className="w-5 h-5" />
              </button>
          </div>
        </div>

        <div className="space-y-6 border-t border-white/30 pt-6">
          <section className="bg-white/5 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white/10 flex items-center justify-center text-white shrink-0">
                <User size={24} />
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 overflow-hidden">
                <p className="text-sm sm:text-lg font-medium text-white/30 truncate max-w-50 sm:max-w-none">
                  {user.email}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
