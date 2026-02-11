"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowBendRightUpIcon,
  BellIcon,
  ClockCounterClockwiseIcon,
  HouseLineIcon,
  PackageIcon,
  PiggyBankIcon,
  SignOutIcon,
  UserIcon
} from "@phosphor-icons/react";

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

  const navItems = [
    {
      label: "Home",
      icon: <HouseLineIcon size={20} />,
      onClick: () => router.push("/"),
      hoverClass: "hover:bg-lime-700",
    },
    {
      label: "Services",
      icon: <PackageIcon size={20} />,
      onClick: () => router.push("/services"),
      hoverClass: "hover:bg-lime-700",
    },
    {
      label: "Logout",
      icon: <SignOutIcon size={20} />,
      onClick: handleLogout,
      hoverClass: "hover:bg-rose-700",
    },
  ];

  const isLowCredits = user.credits < 10;

  return (
    <div className="w-full selection:bg-lime-600 selection:text-white text-white flex-col">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Account Profile
          </h1>

          <div className="flex items-center w-full sm:w-auto border border-white/12 px-1 py-0.5">
            {navItems.map((item, index) => (
              <div key={item.label} className="flex items-center">
                <div className="relative group/tooltip">
                  <button
                    onClick={item.onClick}
                    className={`flex items-center gap-3 text-white p-3 cursor-pointer duration-200 font-bold transition-all ${item.hoverClass}`}
                  >
                    {item.icon}
                  </button>

                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 hidden md:block">
                    <div className="bg-white text-black text-[10px] font-bold uppercase tracking-wider py-1 px-3 whitespace-nowrap shadow-xl border border-white/20 relative">
                      {item.label}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-white" />
                    </div>
                  </div>
                </div>
                
                {index < navItems.length - 1 && (
                  <div className="h-12 bg-white/12 w-px mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 pt-6">
          <section className="space-y-0.5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 text-white/30 flex items-center justify-center shrink-0">
                <UserIcon size={24} />
              </div>
              <p className="text-sm sm:text-lg font-medium text-white/30 truncate italic">
                {user.email}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 text-white/30 flex items-center justify-center shrink-0">
                <PiggyBankIcon size={24} />
              </div>
              <div
                className={`px-3 py-1 transition-all ${
                  isLowCredits
                    ? "bg-rose-700/20 text-rose-700"
                    : "text-white bg-lime-700"
                }`}
              >
                <span className="text-sm sm:text-lg font-bold">
                  {user.credits} Credits
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 text-white/30 flex items-center justify-center shrink-0 relative">
                <BellIcon size={24} />
                {user.total_conversations > 0 && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-lime-700 text-[10px] font-black text-white ring-2 ring-black">
                    {user.total_conversations}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm sm:text-lg flex items-center font-medium gap-2 text-white/30 italic">
                  conversations{" "}
                  <span className="text-white cursor-pointer">
                    <ArrowBendRightUpIcon
                      onClick={() => router.push("/conversations")}
                    />
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 text-white/30 flex items-center justify-center shrink-0">
                <ClockCounterClockwiseIcon size={24} />
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