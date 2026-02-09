"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Power,
  Home,
  Wrench,
  Clock,
  MessageSquare,
  Wallet,
  ArrowUpRightFromSquare,
} from "lucide-react";
import { ProfileProps } from "@/lib/interface";

export function Profile({ user }: ProfileProps) {
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

  const isLowCredits = user.credits < 10;

  return (
    <div className="w-full text-white flex-col">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Account Profile
          </h1>

          <div className="flex items-center w-full sm:w-auto border border-white/12 px-1 py-0.5">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3 text-white p-3 cursor-pointer duration-200 font-bold transition-all hover:bg-teal-700"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="h-12 bg-white/12 w-px mx-1" />
            <button
              onClick={() => router.push("/services")}
              className="flex items-center gap-3 text-white p-3 cursor-pointer duration-200 font-bold transition-all hover:bg-indigo-700"
            >
              <Wrench className="w-5 h-5" />
            </button>
            <div className="h-12 bg-white/12 w-px mx-1" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-white p-3 cursor-pointer duration-200 font-bold transition-all hover:bg-rose-700"
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
              <p className="text-sm sm:text-lg font-medium text-white/30 truncate italic">
                {user.email}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 text-white/30 flex items-center justify-center shrink-0">
                <Wallet size={24} />
              </div>
              <div
                className={`px-3 py-1 transition-all ${
                  isLowCredits
                    ? "bg-rose-700/20 text-rose-700"
                    : "bg-white/5  text-white"
                }`}
              >
                <span className="text-sm sm:text-lg font-bold">
                  {user.credits} Credits
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 text-white/30 flex items-center justify-center shrink-0 relative">
                <MessageSquare size={24} />
                {user.total_conversations > 0 && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-black ring-2 ring-black">
                    {user.total_conversations}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm sm:text-lg flex items-center font-medium gap-2 text-white/30 italic">
                  conversations <span className="text-white cursor-pointer"><ArrowUpRightFromSquare onClick={()=> router.push("/conversations")}/></span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 text-white/30 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <p className="text-sm sm:text-lg font-medium text-white/30 truncate">
                {user.updated_at
                  ? new Date(user.updated_at).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
