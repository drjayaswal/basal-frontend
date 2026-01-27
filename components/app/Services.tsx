"use client";

import { toPng } from "html-to-image";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import {
  File,
  Files,
  Trash2,
  Download,
  Paperclip,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ServerCogIcon,
  PlugZap,
  Loader,
  RefreshCcw,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Script from "next/script";
import { FileData } from "@/lib/interface";
import drive from "@/public/drive.png";
import { AnalysisChart } from "../ui/radar";

export function Services({ user }: { user: any }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPickerLoaded, setIsPickerLoaded] = useState(false);
  const [extractedData, setExtractedData] = useState<FileData[]>([]);
  const [selectedFileData, setSelectedFileData] = useState<FileData | null>(
    null,
  );

  const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
  const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const fetchHistory = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem("token");
    if (!token || !user) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const history = await res.json();
        setExtractedData(history);
        const stillWorking = history.some(
          (f: any) => f.status === "pending" || f.status === "processing",
        );
        if (stillWorking) setIsProcessing(true);
        else setIsProcessing(false);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(fetchHistory, 5 * 1000);
    }
    return () => clearInterval(interval);
  }, [isProcessing, user]);

  useEffect(() => {
    setIsLoading(true);
    fetchHistory().finally(() => setIsLoading(false));
  }, [user]);

  const handleSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const toastId = toast.loading(`Collecting files...`);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!description) {
      toast.error("Please provide a job description first.");
      return;
    }

    const token = localStorage.getItem("token");
    const validFiles = Array.from(files).filter(
      (f) =>
        ALLOWED_MIME_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE_BYTES,
    );

    if (validFiles.length === 0) {
      toast.error("No valid PDF or Docx files selected.");
      return;
    }

    setIsProcessing(true);
    setIsLoading(true);

    const formData = new FormData();
    validFiles.forEach((file) => formData.append("files", file));
    formData.append("description", description);

    try {
      const uploadToastId = toast.loading(
        `Uploading ${validFiles.length} files...`,
      );
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      if (response.ok) {
        // MAP LOCAL FILES TO PLACEHOLDERS
        const localPlaceholders: FileData[] = validFiles.map((f) => ({
          id: Math.random().toString(), // Temp ID until fetchHistory runs
          filename: f.name,
          status: "processing",
          match_score: null,
          details: null,
          created_at: new Date().toISOString(),
        }));

        setExtractedData((prev) => [...localPlaceholders, ...prev]);
        toast.dismiss(uploadToastId);
        toast.success(`Upload started for ${validFiles.length} files`);

        // Trigger a history fetch immediately to sync with real DB IDs
        fetchHistory();
      } else {
        toast.error("Upload failed", { id: uploadToastId });
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error("Network error", { id: toastId });
      setIsProcessing(false);
    } finally {
      setIsLoading(false);
      toast.dismiss(toastId);
    }
  };
  const exportToCSV = () => {
    toast.success("Save CSV?", {
      description: "This will download the Report.csv",
      action: {
        label: "Download",
        onClick: () => {
          if (extractedData.length === 0) return;

          const fileName = `Report.csv`;

          const headers = [
            "ID",
            "Filename",
            "Status",
            "Match Score (%)",
            "Matched Keywords",
            "Missing Keywords",
            "Created At",
          ];

          const rows = extractedData.map((file) => {
            const matched = file.details?.matched_keywords || [];
            const missing = file.details?.missing_keywords || [];

            const displayScore =
              file.match_score !== null
                ? Math.round(
                    file.match_score <= 1
                      ? file.match_score * 100
                      : file.match_score,
                  )
                : "N/A";

            return [
              `"${file.id}"`,
              `"${file.filename}"`,
              file.status.toUpperCase(),
              displayScore,
              `"${matched.join("; ")}"`,
              `"${missing.join("; ")}"`,
              `"${new Date(file.created_at).toLocaleString()}"`,
            ];
          });

          const csvContent = [headers, ...rows]
            .map((e) => e.join(","))
            .join("\n");

          const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.success("Report Downloaded");
        },
      },
    });
  };
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => openPicker(tokenResponse.access_token),
    scope: "https://www.googleapis.com/auth/drive.readonly",
  });
  const openPicker = (token: string) => {
    if (!isPickerLoaded) return toast.error("Picker API not loaded.");
    const google = (window as any).google;

    const view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true);

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(process.env.NEXT_PUBLIC_PICKER_KEY)
      .setAppId(process.env.NEXT_PUBLIC_APP_ID)
      .setTitle("Select Google Drive Folder")
      .setCallback(async (data: any) => {
        if (data.action === google.picker.Action.PICKED) {
          const folderId = data.docs[0].id;
          setIsProcessing(true);
          const toastId = toast.loading("Processing Drive folder...");

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-folder`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  folderId: folderId,
                  googleToken: token,
                  description: description || "Resume Analysis",
                }),
              },
            );

            if (response.ok) {
              const responseData = await response.json();

              const placeholders = responseData.files.map((f: any) => ({
                id: f.id,
                filename: f.name,
                status: "processing",
                match_score: null,
                details: null,
                created_at: new Date().toISOString(),
              }));

              setExtractedData((prev) => [...placeholders, ...prev]);
              setIsProcessing(true);
              toast.dismiss(toastId)
              toast.success(responseData.message);
            } else {
              const errData = await response.json();
              toast.dismiss(toastId)
              console.error("422 Details:", errData);
              toast.error("Processing failed (422). Check console.", {
                id: toastId,
              });
            }
          } catch (err) {
            toast.error("Network error.", { id: toastId });
          } finally {
            setIsProcessing(false);
          }
        }
      })
      .build();

    picker.setVisible(true);
  };
  const resetHistory = async () => {
    const token = localStorage.getItem("token");
    if (extractedData.length < 1) {
      toast.error("Nothing to Erase...");
      return;
    }
    toast.info("Erase History?", {
      description: "This action cannot be undone",
      action: {
        label: "Clear All",
        onClick: async () => {
          try {
            const toastId = toast.loading("Erasing history...");
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/reset-history`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            if (res.ok) {
              setExtractedData([]);
              toast.dismiss(toastId);
              toast.success("History cleared successfully");
            } else {
              toast.dismiss(toastId);
              toast.error("Failed to clear history");
            }
          } catch (error) {
            toast.error("Network error. Please try again.");
          }
        },
      },
    });
  };
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          bg: "bg-emerald-500/10 text-emerald-600",
        };
      case "processing":
        return {
          icon: <Loader className="w-4 h-4 animate-spin" />,
          bg: "bg-main/10 text-main animate-pulse",
        };
      case "failed":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          bg: "bg-rose-500/10 text-rose-600",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          bg: "bg-slate-100 text-slate-500",
        };
    }
  };

  return (
    <div className=" my-20">
      <Script
        src="https://apis.google.com/js/api.js"
        onLoad={() =>
          (window as any).gapi.load("picker", () => setIsPickerLoaded(true))
        }
      />

      {/* 1. TOP COMMAND BAR */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl shadow-lg rounded-4xl mx-4">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-main/20 rounded-xl shadow-inner border border-main/10">
              <ServerCogIcon className="w-5 h-5 text-main" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark tracking-tight">
                Services
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Workspace
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xl w-full relative group">
            <textarea
              placeholder="Paste job requirements or project scope..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-gray-50 focus:bg-white text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-main/20 transition-all resize-none h-12 focus:h-30"
            />
            <label className="absolute right-3 top-3 cursor-pointer p-1.5 bg-white shadow-sm rounded-lg hover:text-main transition-colors">
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={() => {}}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              label: "Cloud Source",
              title: "Google Drive",
              icon: <Image src={drive} alt="drive" width={42} height={42} />,
              handler: () => {
                if (!description.trim()) {
                  return toast.error("Description Required", {
                    description: "Please provide description to connect Drive",
                  });
                }
                login();
              },
              orbClass:
                "bg-gradient-to-br from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] opacity-[0.08]",
            },
            {
              label: "Local Source",
              title: "Upload Folder",
              icon: <Files className="w-8 h-8 text-fuchsia-500/30" />,
              handler: () => {
                if (!description.trim()) {
                  return toast.error("Description Required", {
                    description: "Please provide description to upload Folder",
                  });
                }
                folderInputRef.current?.click();
              },
              orbClass:
                "bg-gradient-to-br from-fuchsia-500 to-fuchsia-500 opacity-[0.08]",
            },
            {
              label: "Local Source",
              title: "Quick File",
              icon: <File className="w-8 h-8 text-indigo-500/30" />,
              handler: () => {
                if (!description.trim()) {
                  return toast.error("Description Required", {
                    description: "Please provide description to upload File",
                  });
                }
                fileInputRef.current?.click();
              },
              orbClass:
                "bg-gradient-to-br from-indigo-500 to-indigo-500 opacity-[0.08]",
            },
            {
              label: "Automation",
              title: "Watch Folder",
              icon: <PlugZap className="w-8 h-8 text-slate-300" />,
              handler: () => {
                return toast.info("feature in development...");
              },
              disabled: true,
              orbClass: "bg-slate-200 opacity-20",
            },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={action.handler}
              className={`group flex flex-col items-start p-8 bg-white rounded-[2.5rem] shadow-shadow transition-all duration-500 text-left relative overflow-hidden active:scale-95 disabled:opacity-50 ${action.disabled ? "cursor-not-allowed opacity-70 grayscale" : "cursor-pointer hover:shadow-2xl hover:-translate-y-1"}`}
            >
              <div
                className={`mb-5 bg-transparent ${action.label == "Cloud Source" ? "scale-150 group-hover:scale-200" : "scale-90 group-hover:scale-150"} transition-all duration-500 group-hover:rotate-3`}
              >
                {action.icon}
              </div>
              <div className="z-10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
                  {action.label}
                </span>
                <span className="text-xl font-bold text-dark">
                  {action.title}
                </span>
              </div>
              <div
                className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-12 -mt-12 transition-all duration-700 blur-2xl group-hover:blur-xl group-hover:scale-150 group-hover:opacity-20 ${action.orbClass}`}
              />
            </button>
          ))}
        </div>

        {extractedData.length != 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-dark">
                  Total files {extractedData.length}
                </h2>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  onClick={fetchHistory}
                  className="text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl"
                >
                  <RefreshCcw
                    className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""} `}
                  />{" "}
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  onClick={exportToCSV}
                  className="text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl"
                >
                  <Download className="w-4 h-4" /> Export
                </Button>
                <Button
                  variant="ghost"
                  onClick={resetHistory}
                  className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" /> Erase
                </Button>
              </div>
            </div>

            {isLoading && extractedData.length == 0 ? (
              <div
                className={`group bg-white mt-1 px-8 py-1 rounded-[2.5rem] shadow-shadow hover:shadow-none cursor-not-allowed transition-all duration-500 relative overflow-hidden`}
              >
                <div className={`flex items-start justify-between`}>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 text-gray-400 bg-gray-100 rounded-2xl flex items-center justify-center transition-all`}
                    />

                    <div>
                      <div className="h-5 w-32 bg-slate-200 rounded-lg" />
                      <div className="h-5 w-20 bg-slate-100 rounded-full" />
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="h-8 w-14 bg-slate-200 rounded-lg" />
                    <div className="h-2 w-10 bg-slate-100 rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50">
                  <div className="h-4 w-28 bg-slate-100 rounded-md" />

                  <div className="h-8 w-24 bg-slate-100 rounded-xl" />
                </div>

                <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 bg-slate-50 blur-2xl opacity-50" />
              </div>
            ) : extractedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center bg-white rounded-[3rem] py-5">
                <Search className="w-8 h-8 text-slate-300 mb-4" />
                <p className="text-slate-400 font-medium">
                  Ready for input. Upload a file to begin.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {extractedData.map((file, idx) => {
                  const displayFilename =
                    file.filename.split("/").pop() || file.filename;
                  const config = getStatusConfig(file.status);
                  return (
                    <div
                      key={idx}
                      onClick={() =>
                        file.status === "completed" && setSelectedFileData(file)
                      }
                      className={`group bg-white px-8 py-6 rounded-[2.5rem] shadow-shadow ${file.details && file.status != "processing" && file.status != "failed" && file.status != "pending" ? "hover:shadow-2xl cursor-pointer" : "hover:shadow-none cursor-not-allowed"}  transition-all duration-500 relative overflow-hidden`}
                    >
                      <div
                        className={`flex items-start justify-between ${file.details && file.status != "processing" && file.status != "failed" && file.status != "pending" && "mb-6"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 text-gray-400 bg-gray-100 rounded-2xl flex items-center justify-center ${file.details && file.status != "processing" && file.status != "failed" && file.status != "pending" && "group-hover:text-main group-hover:bg-main/20"} transition-all`}
                          >
                            <File className="w-6 h-6" />
                          </div>
                          <div>
                            <h3
                              className={`font-bold ${file.details && file.status != "processing" && file.status != "failed" && file.status != "pending" && "group-hover:text-main"}  text-gray-400 truncate max-w-37.5`}
                            >
                              {displayFilename}
                            </h3>
                            <div
                              className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${config.bg}`}
                            >
                              {config.icon} {file.status.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        {file.match_score !== null &&
                          file.status != "processing" && (
                            <div className="text-right">
                              <div className="text-2xl font-black text-gray-400 group-hover:text-main tracking-tighter">
                                {file.match_score}%
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">
                                Match
                              </div>
                            </div>
                          )}
                      </div>
                      {file.details &&
                        file.status != "processing" &&
                        file.status != "failed" &&
                        file.status != "pending" && (
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-400">
                              {file.details.total_matches} Skills Identified
                            </span>
                            <Button
                              variant="ghost"
                              className="h-8 text-[12px] hover:text-white hover:bg-main font-bold text-gray-400 rounded-xl"
                            >
                              View Report
                            </Button>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedFileData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark/20 backdrop-blur-md"
          onClick={() => setSelectedFileData(null)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedFileData(null)}
              className="absolute top-2 right-2 p-2 hover:bg-red-50 text-rose-500 hover:text-rose-500 cursor-pointer rounded-2xl"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-dark mb-2">
                  {selectedFileData.filename}
                </h2>
                <p className="text-slate-400 text-sm mb-8">
                  {selectedFileData.details?.summary}
                </p>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-300 uppercase mb-3 tracking-widest">
                      Matched
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFileData.details?.matched_keywords.map(
                        (kw, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl"
                          >
                            {kw}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-300 uppercase mb-3 tracking-widest">
                      Missing
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFileData.details?.missing_keywords.map(
                        (kw, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl"
                          >
                            {kw}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-8">
                <div ref={chartRef} className="w-full">
                  <AnalysisChart
                    data={selectedFileData.details?.radar_data || []}
                    color="#0F172A"
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (chartRef.current) {
                      const dataUrl = await toPng(chartRef.current);
                      const link = document.createElement("a");
                      link.download = "analysis.png";
                      link.href = dataUrl;
                      link.click();
                    }
                  }}
                  className="mt-8 bg-dark hover:bg-emerald-500 text-white rounded-2xl px-8 h-12 shadow-lg"
                >
                  Download PNG
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Inputs Linked to Logic */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleSelection}
      />
      <input
        type="file"
        ref={folderInputRef}
        className="hidden"
        /* @ts-ignore */
        webkitdirectory=""
        directory=""
        onChange={handleSelection}
      />
    </div>
  );
}
