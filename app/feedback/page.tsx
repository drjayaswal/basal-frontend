"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "@/lib/utils";
import Image from "next/image";
import { ArrowLeftIcon, ChatDotsIcon, CircleNotchIcon, EnvelopeSimpleIcon, PaperPlaneTiltIcon, Tag, TagIcon } from "@phosphor-icons/react";

export default function FeedbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    category: "General",
    message: "",
  });
  const categoryMap = {
    General: "GENERAL",
    "Bug Report": "BUG",
    "Feature Request": "FEATURE",
    "UI/UX": "UIUX",
    Other: "OTHER",
  };
  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message)
      return toast.error("Required fields missing");

    setIsLoading(true);

    try {
      const shortCategory =
        categoryMap[formData.category as keyof typeof categoryMap];
      const response = await fetch(`${getBaseUrl()}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          category: shortCategory.toUpperCase(),
          content: formData.message,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success("Feedback received.");
      setFormData({ email: "", category: "General", message: "" });
    } catch (error) {
      toast.error("Transmission failed.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen selection:bg-sky-600 selection:text-white text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="relative p-6.5 px-10 z-10 w-full max-w-160 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <button
          onClick={() => router.back()}
          className="cursor-pointer flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeftIcon
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">
            Go Back
          </span>
        </button>

        <div className="mb-3 text-center md:text-left">
          <h1 className="flex items-center gap-2 mb-2">
          <Image
            className="invert"
            src="/logo.png"
            alt="logo"
            width={40}
            height={40}
          />
            <span className="underline text-3xl font-bold tracking-tighter uppercase underline-offset-4 decoration-sky-600">Feedback</span><span className="text-3xl font-bold text-sky-600 -ml-3 mb-1.25 decoration-none decoration-transparent">•</span>
          </h1>
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">
            Help us bridge the gap
          </p>
        </div>
        <form
          onSubmit={handleFeedback}
          className="space-y-6 -mr-1 p-8"
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/30 tracking-widest">
              <EnvelopeSimpleIcon size={12} /> Email Address
            </label>
            <input
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              data-1p-ignore
              required
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="user@example.com"
              className="w-full bg-black border border-white/10 px-4 py-3 text-sm focus:border-sky-700 outline-none transition-all placeholder:text-white/30"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/30 tracking-widest">
              <TagIcon size={12} /> Category
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-black text-white/30 border border-white/10 px-4 py-3 text-sm focus:border-sky-700 outline-none appearance-none cursor-pointer"
              >
                {Object.keys(categoryMap).map((label) => (
                  <option key={label} value={label} className="bg-neutral-900">
                    {label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                ▼
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/30 tracking-widest">
              <ChatDotsIcon size={12} /> Your Thoughts
            </label>
            <textarea
              required
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              data-1p-ignore
              rows={5}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="How can we improve the experience?"
              className="w-full bg-black border border-white/10 px-4 py-3 text-sm focus:border-sky-700 outline-none transition-all resize-none placeholder:text-white/30"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="group/btn cursor-pointer relative flex items-center justify-between overflow-hidden px-5 py-2 font-bold text-black transition-colors duration-500 bg-white hover:bg-sky-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="relative text-sm flex items-center justify-center gap-2 z-10 transition-all duration-500">
              {isLoading ? (
                <>
                  Submiting... <CircleNotchIcon className="animate-spin" size={16} />
                </>
              ) : (
                <>
                  Submit <PaperPlaneTiltIcon size={14} />
                </>
              )}
            </span>
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out group-hover/btn:translate-x-full" />
          </button>
        </form>
      </div>
    </div>
  );
}
