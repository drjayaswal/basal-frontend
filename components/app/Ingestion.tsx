"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { getBaseUrl } from "@/lib/utils";
import { UserData } from "@/lib/interface";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  CircleNotchIcon,
  CloudArrowUpIcon,
  FileDocIcon,
  FilePdfIcon,
  FileTxtIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";

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
    <div className="min-h-screen w-full selection:bg-violet-600 selection:text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <header className="border-l-2 border-violet-700 mb-10 flex items-center justify-between">
          <div className="pl-1">
            <h1 className="text-4xl font-black tracking-tighter text-white">
              <span className="uppercase">Ingest your data</span>
            </h1>
              <span className="underline underline-offset-5 text-white/50 decoration-violet-700">
                Add Context
              </span>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 border border-white/10 bg-black backdrop-blur-sm">
          <div className="p-8  space-y-6">
            <div className="flex items-center justify-between">
              <YoutubeLogoIcon
                className={`scale-150 ${videoLoading || videoUrl ? " text-violet-700" : "text-white/30"}`}
              />
              <span className="text-[14px] text-white/30 font-bold uppercase">
                Video
              </span>
            </div>

            <form onSubmit={handleVideoIngest} className="space-y-4">
              <input
                disabled={videoLoading}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white outline-none focus:border-violet-700 transition-colors placeholder:text-zinc-700"
                placeholder="https://www.youtube.com/watch?v=AKDBhBALKBAKljHBKAb"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <button
                disabled={videoLoading || !videoUrl}
                className={`cursor-pointer group w-full bg-white text-black py-3 text-xs font-bold uppercase ${videoUrl && "hover:bg-violet-700 hover:text-white"} transition-all flex items-center justify-center gap-2 disabled:opacity-30`}
              >
                {videoLoading ? (
                  <>
                    <CircleNotchIcon className="animate-spin" size={14} />
                    Processing...
                  </>
                ) : (
                  <>
                    Process
                    <ArrowRightIcon
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
              <div className="flex scale-150">
              <FilePdfIcon
                className={`${fileLoading ? "text-violet-700" : "text-white/50"}`}
              />
              <FileDocIcon
                className={`${fileLoading ? "text-violet-700" : "text-white/50"}`}
              />
                            <FileTxtIcon
                className={`${fileLoading ? "text-violet-700" : "text-white/50"}`}
              />
              </div>
              <span className="text-[14px] text-white/30 font-bold uppercase">
                Document
              </span>
            </div>

            <label
              className={`
              border border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-all
              ${fileLoading ? "border-violet-700 bg-violet-700/5" : "border-white/20 hover:border-white/40 hover:bg-white/5"}
            `}
            >
              {fileLoading ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <CircleNotchIcon
                    className="animate-spin text-violet-700"
                    size={24}
                  />
                  <span className="text-[12px] uppercase text-violet-700 font-bold">
                    Uploading...
                  </span>
                  <span className="text-[10px] text-white/50 truncate max-w-37.5">
                    {fileName}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <CloudArrowUpIcon size={20} className="mb-1 text-white" />
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
