"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Power, Home, Wrench, Clock } from "lucide-react";

interface UserData {
  email: string;
  id: string;
  updated_at: string;
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
    <div className="w-full text-white bg-black border-y border-white/12 py-14 mt-4.25 flex-col">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
            Settings
          </h1>

          <div className="flex items-center w-full sm:w-auto border border-white/12 px-1 py-0.5">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3 text-white p-3 cursor-pointer duration-200 font-bold transition-all hover:bg-teal-600"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="h-12 bg-white/12 w-px mx-1" />
            <button
              onClick={() => router.push("/services")}
              className="flex items-center gap-3 text-white p-3 cursor-pointer duration-200 font-bold transition-all hover:bg-indigo-600"
            >
              <Wrench className="w-5 h-5" />
            </button>
            <div className="h-12 bg-white/12 w-px mx-1" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-white p-3 cursor-pointer duration-200 font-bold transition-all hover:bg-rose-600"
            >
              <Power className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="space-y-6 pt-6">
          <section className="space-y-0.5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 text-white/30 flex items-center justify-center shrink-0">
                <User size={24} />
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 overflow-hidden">
                <p className="text-sm sm:text-lg font-medium text-white/30 truncate italic max-w-50 sm:max-w-none">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 text-white/30 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 overflow-hidden">
                <p className="text-sm sm:text-lg font-medium text-white/30 truncate italic max-w-50 sm:max-w-none">
                  {user.updated_at
                    ? new Date(user.updated_at).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
