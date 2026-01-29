"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBaseUrl } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export default function Connect() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log(getBaseUrl());

      const response = await fetch(`${getBaseUrl()}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_email", data.email);

        toast.success(data.message || "Welcome!");

        setTimeout(() => {
          router.push("/");
          window.location.href = "/";
        }, 500);
      }
    } catch (error: any) {
      toast.error(error.message || "Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full min-w-md mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-main">Connect</h1>
          <p className="text-main text-sm mt-2 font-medium">
            Enter email and password to continue
          </p>
        </div>

        <form className="space-y-4 md:mx-0  mx-10" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-3xl text-main placeholder:text-shadow border-2 border-transparent focus-visible:border-main/30 focus-visible:ring-0 transition-all shadow-none"
              required
            />
          </div>

          <div className="space-y-2 relative group">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-3xl text-main placeholder:text-shadow border-2 border-transparent focus-visible:border-main/30 focus-visible:ring-0 transition-all shadow-none"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute cursor-pointer right-2 top-1.5 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-xl hover:bg-indigo-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye className="w-5 h-5" strokeWidth={2.5} />
              ) : (
                <EyeOff className="w-5 h-5" strokeWidth={2.5} />
              )}
            </button>
          </div>
          <Button
            type="submit"
            variant={"ghost"}
            className="w-full h-12 text-lg bg-transparent hover:bg-linear-to-r hover:from-white hover:via-main/80 hover:to-white hover:text-white text-main font-bold rounded-none duration-300 transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-colors mt-4"
            disabled={loading}
          >
            {loading ? "Connecting..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
