"use client";

import { toast } from "sonner";
import { useState } from "react";
import { getBaseUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, MoveRight } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center shadow-xl py-10 px-4 rounded-[5rem] relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md mx-auto px-6 ">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white">
            Bias<span className="text-indigo-600">~</span>Breaker
          </h1>
          <p className="text-white/70 text-sm mt-2">connect to your account</p>
        </div>
        <form className="space-y-4 md:mx-0  mx-10" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-none text-white placeholder:text-shadow border-2 border-transparent focus-visible:border-white/30 focus-visible:ring-0 transition-all shadow-none"
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
              className="h-11 rounded-none text-white placeholder:text-shadow border-2 border-transparent focus-visible:border-white/30 focus-visible:ring-0 transition-all shadow-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute cursor-pointer right-1.5 top-1.5 p-1.5 text-white transition-colors hover:bg-indigo-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye className="w-5 h-5" strokeWidth={2.5} />
              ) : (
                <EyeOff className="w-5 h-5" strokeWidth={2.5} />
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group/btn cursor-pointer relative flex w-full items-center justify-between overflow-hidden bg-black px-8 py-4 font-bold text-white transition-all duration-500 hover:bg-indigo-600 disabled:opacity-50"
          >
            <span className="relative z-10 transition-all duration-500 group-hover/btn:tracking-widest">
              {loading ? "Connecting..." : "Continue"}
            </span>
            <div className="relative flex items-center overflow-hidden">
              <MoveRight
                className="transform transition-all duration-500 -translate-x-full opacity-0 
                 group-hover/btn:translate-x-0 group-hover/btn:opacity-100"
              />
              <MoveRight
                className="absolute transition-all duration-500 opacity-100 
                 group-hover/btn:translate-x-full group-hover/btn:opacity-0"
              />
            </div>
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 ease-in-out group-hover/btn:translate-x-full" />
          </button>
        </form>
      </div>
    </div>
  );
}
