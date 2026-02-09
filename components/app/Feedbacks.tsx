"use client";

import { UserData } from "@/lib/interface";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Loader2, Inbox, X, User2, Clock } from "lucide-react";
import { getBaseUrl } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

const getCategoryStyles = (category: string) => {
  const cat = (category || "GENERAL").toUpperCase();
  if (cat.includes("BUG"))
    return {
      color: "text-red-500",
      border: "border-red-500/30",
      bg: "bg-red-500/10",
    };
  if (cat.includes("FEATURE"))
    return {
      color: "text-blue-500",
      border: "border-blue-500/30",
      bg: "bg-blue-500/10",
    };
  if (cat.includes("URGENT"))
    return {
      color: "text-amber-500",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
    };
  return {
    color: "text-pink-500",
    border: "border-pink-500/30",
    bg: "bg-pink-500/20",
  };
};

export default function Feedbacks({ user }: { user: UserData }) {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("ALL");

  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);

  const isAdmin = user?.email === "dhruv@gmail.com";

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      router.push("/");
      return;
    }

    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${getBaseUrl()}/get-feedbacks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFeedbacks(data);
      } catch (err) {
        console.error("System Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [user, isAdmin, router]);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${getBaseUrl()}/resolve-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setFeedbacks((prev) => prev.filter((fb) => fb.id !== id));
        toast.success("Feedback resolved.");
        setSelectedFeedback(null);
      } else {
        toast.error("Failed to resolve.");
      }
    } catch (err) {
      toast.error("Transmission failed.");
    } finally {
      setResolvingId(null);
    }
  };

  const filteredFeedbacks = useMemo(() => {
    if (activeCategory === "ALL") return feedbacks;
    return feedbacks.filter(
      (f) => (f.category || "GENERAL").toUpperCase() === activeCategory,
    );
  }, [feedbacks, activeCategory]);

  const categories = useMemo(() => {
    const cats = new Set(
      feedbacks.map((f) => f.category?.toUpperCase() || "GENERAL"),
    );
    return ["ALL", ...Array.from(cats)];
  }, [feedbacks]);

  if (!user || !isAdmin) return null;

  return (
    <div className="text-white font-mono relative">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="mb-3">
            <h1 className="flex items-center gap-2 mb-2">
              <Image
                className="invert"
                src="/logo.png"
                alt="logo"
                width={40}
                height={40}
              />
              <span className="underline text-3xl font-bold tracking-tighter uppercase underline-offset-4 decoration-pink-600">
                Feedbacks
              </span>
              <span className="text-3xl font-bold text-pink-600 -ml-2 mb-1.25 decoration-none decoration-transparent">
                •
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-px">
            {filteredFeedbacks.length > 0 &&
              categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`cursor-pointer px-4 text-[12px] font-bold tracking-widest transition-none uppercase ${activeCategory === cat ? "bg-white text-black py-1" : "hover:bg-white/10 text-white/40 py-1"}`}
                >
                  {cat}
                </button>
              ))}
          </div>
        </header>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10">
            <Loader2 className="w-6 h-6 animate-spin text-white/20 mb-4" />
          </div>
        ) : filteredFeedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px">
            {filteredFeedbacks.map((fb) => {
              const styles = getCategoryStyles(fb.category);
              return (
                <div
                  key={fb.id}
                  onClick={() => setSelectedFeedback(fb)}
                  className="bg-black p-8 group hover:bg-black border border-transparent hover:border-white/15 transition-all cursor-pointer flex flex-col"
                >
                  <div
                    className={`text-[10px] w-fit px-2 py-1 mb-4 font-black ${styles.color} ${styles.bg} uppercase tracking-[0.2em]`}
                  >
                    {fb.category || "General"}
                  </div>
                  <p className="text-sm text-white/60 line-clamp-3 mb-6 italic">
                    "{fb.content}"
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-[11px] text-gray-500">
                    <User2 size={14} /> {fb.email}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-dashed border-2 border-white/10 bg-white/3 py-32 flex flex-col items-center justify-center">
            <Inbox className="w-8 h-8 text-white/50 mb-4 stroke-[1px]" />
            <p className="text-[14px] uppercase tracking-[0.5em] text-white/50">
              Zero Records
            </p>
          </div>
        )}
      </div>
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/5 backdrop-blur-md">
          <div className="bg-zinc-950 border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedFeedback(null)}
              className="absolute top-6 right-6 cursor-pointer z-10 text-white hover:text-rose-600 transition-colors bg-black p-1"
            >
              <X size={24} />
            </button>
            <div className="p-8 pb-4">
              <div
                className={`inline-block text-[12px] px-3 py-1 font-black mb-4 uppercase tracking-widest ${getCategoryStyles(selectedFeedback.category).color} ${getCategoryStyles(selectedFeedback.category).bg}`}
              >
                {selectedFeedback.category || "General"}
              </div>
              <div className="text-gray-500 text-xs flex items-center gap-2">
                <User2 size={14} /> {selectedFeedback.email}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
              <div className="bg-white/5 p-4 border-l-4 border-pink-600 mb-6">
                <p className="text-lg md:text-xl leading-relaxed font-light italic text-white/90 wrap-break-word whitespace-pre-wrap">
                  "{selectedFeedback.content}"
                </p>
              </div>
              <p className="flex gap-2 items-center text-[14px] text-white/20 uppercase tracking-tighter">
                <Clock size={15} />
                {new Date(selectedFeedback.created_at).toLocaleString()}
              </p>
            </div>
            <div className="p-4 flex flex-col md:flex-row gap-4">
              <button
                onClick={() => handleResolve(selectedFeedback.id)}
                disabled={resolvingId === selectedFeedback.id}
                className="flex-1 bg-white cursor-pointer text-black font-bold py-4 uppercase hover:bg-pink-600 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {resolvingId === selectedFeedback.id && (
                  <Loader2 size={18} className="animate-spin" />
                )}
                {resolvingId === selectedFeedback.id
                  ? "Resolving..."
                  : "Mark as Resolved"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
