"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, Youtube, ArrowRight, File, Send } from "lucide-react";
import { getBaseUrl } from "@/lib/utils";
import { UserData } from "@/lib/interface";
import { useRouter } from "next/navigation";

interface AIProps {
  user: UserData;
}

export default function Ingestion({ user }: AIProps) {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleVideoIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return toast.error("Paste Video URL");
    const token = localStorage.getItem("token");

    setVideoLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/ingest-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: videoUrl, user_id: user.id }),
      });

      if (res.status === 401) {
        toast.error("Please log in again.");
        router.push("/connect");
      }

      const response = await res.json();
      if (res.ok) {
        if (response.status !== "ready") {
          toast.info("Resource will be ready soon", {
            action: {
              label: "Chat with 2BAI",
              onClick: () => {
                const toastId = toast.loading("Redirecting...");
                setTimeout(() => {
                  toast.dismiss(toastId);
                  router.push("/ingestion/chat");
                }, 1500);
              },
            },
          });
        } else {
          setVideoUrl("");
          toast.info("Resource is Ready", {
            action: {
              label: "Chat with 2BAI",
              onClick: () => {
                const toastId = toast.loading("Redirecting...");
                setTimeout(() => {
                  toast.dismiss(toastId);
                  router.push("/ingestion/chat");
                }, 1500);
              },
            },
          });
        }
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("Network Error");
    } finally {
      setVideoLoading(false);
    }
  };
  const handleFileIngest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return toast.error("Upload Document");

    setFileName(file.name);
    setFileLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${getBaseUrl()}/ingest-document`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        toast.error("Please log in again.");
        router.push("/connect");
      }
      const response = await res.json();

      if (res.ok) {
        if (response.status !== "ready") {
          toast.info("Resource will be ready soon", {
            action: {
              label: "Chat with 2BAI",
              onClick: () => {
                const toastId = toast.loading("Redirecting...");
                setTimeout(() => {
                  toast.dismiss(toastId);
                  router.push("/ingestion/chat");
                }, 1500);
              },
            },
          });
        } else {
          setVideoUrl("");
          toast.info("Resource is Ready", {
            action: {
              label: "Chat with 2BAI",
              onClick: () => {
                const toastId = toast.loading("Redirecting...");
                setTimeout(() => {
                  toast.dismiss(toastId);
                  router.push("/ingestion/chat");
                }, 1500);
              },
            },
          });
        }
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("Network Error");
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <header className="border-l-4 border-teal-800 pl-3 mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white">
              <span className="uppercase">Ingestion</span> your{" "}
              <span className="underline underline-offset-4 decoration-teal-700">
                Data
              </span>
            </h1>
          </div>
          <button
            onClick={() => {
              const toastId = toast.loading("Redirecting...");
              setTimeout(() => {
                toast.dismiss(toastId);
                router.push("/conversations");
              }, 1500);
            }}
            className="group/btn cursor-pointer relative flex items-center justify-between overflow-hidden px-4 py-2 font-bold text-white transition-all duration-500 bg-teal-700"
          >
            <div className="absolute inset-0 z-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 bg-linear-to-r from-rose-800 via-rose-600 to-rose-800" />
            <span className="relative z-10 transition-all duration-500 group-hover/btn:tracking-widest mr-4">
              Conversations
            </span>
            <div className="relative z-10 flex items-center justify-center h-6 w-6">
              <div
                className="transition-all duration-500 transform 
      group-hover/btn:translate-x-10 group-hover/btn:-translate-y-10 group-hover/btn:opacity-0"
              >
                <Send size={20} />
              </div>

              <div
                className="absolute transition-all duration-500 transform -translate-x-10 translate-y-10 opacity-0 
      group-hover/btn:translate-x-0 group-hover/btn:translate-y-0 group-hover/btn:opacity-100"
              >
                <Send size={20} />
              </div>
            </div>
          </button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 border border-white/10 bg-zinc-950/50 backdrop-blur-sm">
          <div className="p-8  space-y-6">
            <div className="flex items-center justify-between">
              <Youtube
                className={`${videoLoading || videoUrl ? " text-teal-700" : "text-white/30"}`}
              />
              <span className="text-[14px] text-white/30 font-bold uppercase">
                Video
              </span>
            </div>

            <form onSubmit={handleVideoIngest} className="space-y-4">
              <input
                disabled={videoLoading}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white outline-none focus:border-teal-700 transition-colors placeholder:text-zinc-700"
                placeholder="https://www.youtube.com/watch?v=AKDBhBALKBAKljHBKAb"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <button
                disabled={videoLoading || !videoUrl}
                className={`cursor-pointer group w-full bg-white text-black py-3 text-xs font-bold uppercase ${videoUrl && "hover:bg-teal-700 hover:text-white"} transition-all flex items-center justify-center gap-2 disabled:opacity-30`}
              >
                {videoLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Processing...
                  </>
                ) : (
                  <>
                    Process
                    <ArrowRight
                      size={14}
                      className={`${videoUrl && "group-hover:translate-x-1 transition-transform"}`}
                    />
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <File
                className={`${fileLoading ? "text-teal-700" : "text-white/50"}`}
              />
              <span className="text-[14px] text-white/30 font-bold uppercase">
                Document
              </span>
            </div>

            <label
              className={`
              border border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-all
              ${fileLoading ? "border-teal-700 bg-teal-700/5" : "border-white/20 hover:border-white/40 hover:bg-white/5"}
            `}
            >
              {fileLoading ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <Loader2 className="animate-spin text-teal-700" size={24} />
                  <span className="text-[12px] uppercase text-teal-700 font-bold">
                    Uploading...
                  </span>
                  <span className="text-[10px] text-white/50 truncate max-w-37.5">
                    {fileName}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={20} className="mb-1 text-white" />
                  <span className="text-[12px] text-white uppercase font-bold tracking-widest">
                    Upload
                  </span>
                  <span className="text-[10px] text-white/40 italic">
                    Max size: 10MB
                  </span>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileIngest}
                disabled={fileLoading}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
