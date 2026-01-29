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
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  PlugZap,
  Loader,
  RefreshCcw,
  ChevronRight,
  MenuSquare,
  Delete,
  MoveRight,
} from "lucide-react";
import Script from "next/script";
import { FileData } from "@/lib/interface";
import drive from "@/public/drive.png";
import { AnalysisChart } from "../ui/radar";
import { getBaseUrl } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

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
      const res = await fetch(`${getBaseUrl()}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const response = await fetch(`${getBaseUrl()}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const localPlaceholders: FileData[] = validFiles.map((f) => ({
          id: Math.random().toString(),
          filename: f.name,
          status: "processing",
          match_score: null,
          details: null,
          created_at: new Date().toISOString(),
        }));

        setExtractedData((prev) => [...localPlaceholders, ...prev]);
        toast.dismiss(uploadToastId);
        toast.success(`Uploaded ${validFiles.length} files`);

        fetchHistory();
      } else {
        toast.error("Upload failed", { id: uploadToastId });
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error("Network error");
      setIsProcessing(false);
    } finally {
      setIsLoading(false);
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
                ? file.match_score <= 1
                  ? file.match_score
                  : file.match_score
                : "N/A";

            return [
              `"${file.id}"`,
              `"${file.filename.split("/")[file.filename.split("/").length - 1]}"`,
              file.status.toUpperCase(),
              displayScore,
              `"${matched.join(", ")}"`,
              `"${missing.join(", ")}"`,
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
            const response = await fetch(`${getBaseUrl()}/get-folder`, {
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
            });

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
              toast.dismiss(toastId);
              toast.success(responseData.message);
            } else {
              const errData = await response.json();
              toast.dismiss(toastId);
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
            const res = await fetch(`${getBaseUrl()}/reset-history`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });

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
  const getDescription = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const toastId = toast.loading("Extracting description from file...");

    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("Invalid file type for Job Description");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-description`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );
      toast.dismiss(toastId);
      if (response.ok) {
        const data = await response.json();
        if (data.description) {
          setDescription(data.description);
          toast.success("Description updated from file");
        }
      } else {
        toast.error("Failed to extract description from file");
      }
    } catch (error) {
      console.error("Extraction error:", error);
      toast.error("Error connecting to server");
    } finally {
      setIsProcessing(false);
      e.target.value = "";
    }
  };

  if(isLoading) return <div className="min-h-screen"><Spinner/></div>

  return (
    <div className="py-20">
      <Script
        src="https://apis.google.com/js/api.js"
        onLoad={() =>
          (window as any).gapi.load("picker", () => setIsPickerLoaded(true))
        }
      />

      <div className="sticky top-2 xs:top-2.5 sm:top-3 md:top-4 bg-white/80 backdrop-blur-xl shadow-lg rounded-xl xs:rounded-2xl sm:rounded-full mx-1.5 xs:mx-2 sm:mx-3 md:mx-4 border border-white/20">
        <div className="max-w-6xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 group transition-all duration-500 group-focus-within:flex-row group-focus-within:items-center">
          <div className="flex items-center shrink-0 transition-all duration-500 ease-in-out min-w-fit">
            <div className="px-1 xs:p-2 sm:p-2.5 bg-main/10 rounded-lg xs:rounded-2xl sm:rounded-4xl shadow-inner border border-main/10 shrink-0 transition-all duration-500 group-focus-within:scale-110 group-focus-within:bg-main/20 group-focus-within:shadow-main/20">
              <MenuSquare className="w-4 xs:w-4.5 sm:w-5 md:w-6 text-main" />
            </div>

            <div className="flex flex-col items-start xs:items-center ml-2 xs:ml-2.5 sm:ml-3 group-focus-within:ml-3 transition-all duration-500 ease-in-out max-w-50 opacity-100 sm:group-focus-within:max-w-0 group-focus-within:opacity-100 sm:group-focus-within:ml-0 overflow-hidden">
              <h1 className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-dark tracking-tight leading-tight whitespace-nowrap">
                Services
              </h1>
              <p className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 font-bold whitespace-nowrap">
                Workspace
              </p>
            </div>
          </div>

          <div className="flex-1 w-full items-center relative transition-all duration-500 ease-in-out min-w-0">
            <textarea
              placeholder="Provide description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-3 xs:pl-3 sm:pl-4 pt-2 pr-9 xs:pr-10 sm:pr-12 py-2 xs:py-2.5 sm:py-3 rounded-2xl xs:rounded-2.5xl sm:rounded-3xl bg-gray-100/50 focus:bg-white text-xs xs:text-sm sm:text-base md:text-lg text-dark placeholder:text-slate-400 focus:outline-none focus:ring-0 transition-all resize-none h-8 xs:h-10 sm:h-11 md:h-12 lg:h-13 shadow-inner"
            />
            {!description && (
              <div
                className="flex border border-dashed border-slate-300 rounded-4xl gap-2 items-center absolute right-10 xs:right-9 sm:right-10 md:right-14 top-1 xs:top-1.5 sm:top-2 md:top-2.5 px-2 xs:p-1.5 sm:px-3 sm:p-1.5 text-slate-300"
              >
                or upload <MoveRight className="w-3 xs:w-3.5 sm:w-6 text-slate-200" />
              </div>
            )}
            {description && (
              <button
                className="flex absolute right-10 xs:right-9 sm:right-10 md:right-14 top-1 xs:top-1.5 sm:top-2 md:top-2.5 cursor-pointer px-2 xs:p-1.5 sm:px-3 sm:p-1.5 bg-white/80 hover:bg-rose-50 text-rose-500 shadow-sm rounded-full transition-all shrink-0"
                onClick={() => setDescription("")}
              >
                <Delete className="w-3 xs:w-3.5 sm:w-4 text-current" />

              </button>
            )}
            <label className="flex absolute right-2 xs:right-1.5 sm:right-2 top-1 xs:top-1.5 sm:top-2 md:top-2.5 cursor-pointer px-2 xs:p-1.5 sm:px-3 sm:p-1.5 bg-white/80 hover:bg-white shadow-sm rounded-full hover:text-main transition-all shrink-0">
              <Paperclip className="w-3 xs:w-3.5 sm:w-4 text-current" />
              <input
                type="file"
                className="hidden"
                onChange={getDescription}
                accept=".pdf,.docx,.txt"
              />
            </label>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-1.5 xs:px-2 sm:px-3 md:px-4 lg:px-6 mt-4 xs:mt-5 sm:mt-6 md:mt-8 lg:mt-12">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-16">
          {[
            {
              label: "Cloud Source",
              title: "Google Drive",
              icon: <Image src={drive} alt="drive" width={32} height={32} />,
              handler: () => {
                if (!description.trim()) {
                  return toast.error("Description Required", {
                    description: "Please provide description to connect Drive",
                  });
                }
                login();
              }
            },
            {
              label: "Local Source",
              title: "Upload Folder",
              icon: (
                <Files className="w-6 xs:w-7 sm:w-8 text-fuchsia-500/30" />
              ),
              handler: () => {
                if (!description.trim()) {
                  return toast.error("Description Required", {
                    description: "Please provide description to upload Folder",
                  });
                }
                folderInputRef.current?.click();
              }
            },
            {
              label: "Local Source",
              title: "Quick File",
              icon: (
                <File className="w-6 xs:w-7 sm:w-8 text-indigo-500/30" />
              ),
              handler: () => {
                if (!description.trim()) {
                  return toast.error("Description Required", {
                    description: "Please provide description to upload File",
                  });
                }
                fileInputRef.current?.click();
              },
            },
            {
              label: "Automation",
              title: "Watch Folder",
              icon: (
                <PlugZap className="w-6 xs:w-7 sm:w-8 text-slate-300" />
              ),
              handler: () => toast.info("feature in development..."),
              disabled: true,
              orbClass: "bg-slate-200 opacity-20",
            },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={action.handler}
                className={`group flex flex-col items-start p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-[2rem] lg:rounded-[2.5rem] transition-all duration-500 text-left relative overflow-hidden active:scale-95 disabled:opacity-50 ${action.disabled ? "cursor-not-allowed bg-gray-100 grayscale" : "bg-white cursor-pointer shadow-xl hover:-translate-y-1"}`}
              >
              <div
                className={`mb-2 xs:mb-3 sm:mb-4 md:mb-5 bg-transparent ${action.label === "Cloud Source" ? "scale-100 xs:scale-110 sm:scale-125 md:scale-150 group-hover:scale-110 xs:group-hover:scale-125 sm:group-hover:scale-150 md:group-hover:scale-[1.75]" : "scale-75 xs:scale-80 sm:scale-90 group-hover:scale-100 xs:group-hover:scale-110 sm:group-hover:scale-125"} transition-all duration-500 group-hover:rotate-3`}
              >
                {action.icon}
              </div>
              <div>
                <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest xs:tracking-[0.12em] md:tracking-[0.15em] block mb-0.5 xs:mb-1">
                  {action.label}
                </span>
                <span className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-dark">
                  {action.title}
                </span>
              </div>
              <div
                className={`absolute top-0 right-0 w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full -mr-8 xs:-mr-10 sm:-mr-12 -mt-8 xs:-mt-10 sm:-mt-12 transition-all duration-700 blur-2xl group-hover:blur-xl group-hover:scale-150 group-hover:opacity-20 ${action.orbClass}`}
              />
            </button>
          ))}
        </div>

        {extractedData.length !== 0 && (
          <div className="bg-white sm:p-10 p-5 space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 rounded-[2rem] shadow-md">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3 sm:gap-4">
              <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-dark">
                Files{" "}
                <span className="text-slate-400 ml-1">
                  ({extractedData.length})
                </span>
              </h2>
              <div className="flex gap-1 w-full xs:w-auto">
                <Button
                  variant="ghost"
                  onClick={fetchHistory}
                  className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-indigo-500 hover:bg-indigo-50 hover:text-indigo-500 rounded-md xs:rounded-lg sm:rounded-xl h-7 xs:h-8 sm:h-9 px-2 xs:px-2.5 sm:px-3"
                >
                  <RefreshCcw
                    className={`w-3 xs:w-3.5 sm:w-4 mr-1 ${isProcessing ? "animate-spin" : ""}`}
                  />{" "}
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  onClick={exportToCSV}
                  className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-emerald-500 hover:bg-emerald-50 hover:text-emerald-500 rounded-md xs:rounded-lg sm:rounded-xl h-7 xs:h-8 sm:h-9 px-2 xs:px-2.5 sm:px-3"
                >
                  <Download className="w-3 xs:w-3.5 sm:w-4 mr-1" />{" "}
                  Export
                </Button>
                <Button
                  variant="ghost"
                  onClick={resetHistory}
                  className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-rose-500 hover:bg-rose-50 hover:text-rose-500 rounded-md xs:rounded-lg sm:rounded-xl h-7 xs:h-8 sm:h-9 px-2 xs:px-2.5 sm:px-3"
                >
                  <Trash2 className="w-3 xs:w-3.5 sm:w-4 mr-1" /> Erase
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 xs:gap-2.5 sm:gap-3 md:gap-4">
              {extractedData.map((file, idx) => {
                const displayFilename =
                  file.filename.split("/").pop() || file.filename;
                const config = getStatusConfig(file.status);
                const isInteractive =
                  file.details &&
                  !["processing", "failed", "pending"].includes(file.status);

                return (
                  <div
                    key={idx}
                    onClick={() => isInteractive && setSelectedFileData(file)}
                    className={`group bg-white p-2.5 xs:p-3 sm:p-4 md:px-6 md:py-5 lg:px-8 lg:py-6 rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-[2rem] lg:rounded-[2.5rem] shadow-shadow transition-all duration-500 relative overflow-hidden min-h-fit ${
                      isInteractive
                        ? "hover:shadow-xl cursor-pointer active:scale-[0.98]"
                        : "cursor-default"
                    }`}
                  >
                    <div
                      className={`flex items-start xs:items-center justify-between gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 
                        
                        `}
                    >
                      <div className="flex items-start xs:items-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0 w-full">
                        <div
                          className={`shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-gray-400 bg-gray-50 rounded-md xs:rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isInteractive &&
                            "group-hover:text-main group-hover:bg-main/10 group-hover:rotate-3"
                          }`}
                        >
                          <File className="w-4 xs:w-4.5 sm:w-5 md:w-6 lg:w-7" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-xs xs:text-sm sm:text-base md:text-lg truncate leading-tight transition-colors wrap-break-word ${
                              isInteractive
                                ? "group-hover:text-main text-dark"
                                : "text-slate-400"
                            }`}
                          >
                            {displayFilename.length > 10 ? `${displayFilename.slice(0,10)}.....${displayFilename.split(".")[1]}` : displayFilename }
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <div
                              className={`inline-flex items-center gap-1 px-1.5 xs:px-2 py-0.5 rounded-full text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-wider ${config.bg}`}
                            >
                              {config.icon} {file.status.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {file.match_score !== null &&
                        file.status !== "processing" && (
                          <div className="text-right shrink-0 ml-auto xs:ml-0">
                            <div className="text-base xs:text-lg sm:text-2xl md:text-3xl font-black text-slate-300 group-hover:text-main transition-colors tracking-tighter tabular-nums">
                              {file.match_score}%
                            </div>
                            <div className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Match
                            </div>
                          </div>
                        )}
                    </div>

                    {isInteractive && (
                      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 xs:gap-2 sm:gap-3">
                        <div className="flex gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center justify-between">
                        <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs font-bold text-slate-400 flex items-center gap-1">
                          <span className="w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                          {file.details?.total_matches} Skills
                        </span>
                        <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs font-bold text-slate-400 flex items-center gap-1">
                          <span className="w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                          {file.details?.matched_keywords.length} Matched
                        </span>
                        <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs font-bold text-slate-400 flex items-center gap-1">
                          <span className="w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                          {file.details?.missing_keywords.length} Missed
                        </span>
                        </div>
                        <button className="cursor-pointer xs:w-auto px-2 xs:px-3 sm:px-4 md:px-6 py-1 xs:py-1.5 md:py-2 text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs bg-slate-50 hover:bg-main hover:text-white transition-all duration-300 font-bold text-slate-500 rounded-md xs:rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center xs:justify-start gap-2 shrink-0">
                          View Report
                          <ChevronRight className="w-2.5 xs:w-3 sm:w-3.5 h-2.5 xs:h-3 sm:h-3.5" />
                        </button>
                        </div>
                      </div>
                    )}

                    <div className="absolute -bottom-4 -right-4 w-16 xs:w-20 h-16 xs:h-20 bg-main/5 rounded-full blur-2xl group-hover:bg-main/10 transition-colors" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedFileData && (
        <div
          className="fixed inset-0 z-60 flex items-end xs:items-end sm:items-center justify-center p-0 xs:p-1.5 sm:p-2 md:p-3 lg:p-6 bg-main/5 backdrop-blur-md"
          onClick={() => setSelectedFileData(null)}
        >
          <div
            className="bg-white w-full rounded-[3rem] lg:max-w-4xl shadow-2xl p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 relative max-h-[95vh] xs:max-h-[92vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 xs:w-12 h-1 xs:h-1.5 bg-slate-200 rounded-full mx-auto mb-3 xs:mb-4 sm:mb-6 sm:hidden" />

            <button
              onClick={() => setSelectedFileData(null)}
              className="absolute top-5 right-5 xs:top-2.5 xs:right-2.5 sm:top-3 sm:right-3 md:top-4 md:right-4 lg:top-12 cursor-pointer lg:right-12 p-2 py-1 xs:p-1.5 sm:p-2 bg-rose-50 hover:bg-rose-50 text-rose-500 xs:text-slate-400 hover:text-rose-500 transition-colors rounded-4xl z-10"
            >
              <X className="w-4 xs:w-5 sm:w-6 text-current" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-12 mt-4 xs:mt-5 sm:mt-6 md:mt-0">
              <div className="order-2 lg:order-1">
                <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-dark mb-1 xs:mb-2 sm:mb-3 pr-8 sm:pr-0 line-clamp-2 sm:line-clamp-none">
                  {selectedFileData.filename.length > 10 ? `${selectedFileData.filename.slice(0,10)}.....${selectedFileData.filename.split(".")[1]}` : selectedFileData.filename }
                </h2>

                <div className="space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-8">
                  <section>
                    <h4 className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 xs:mb-3 sm:mb-4 tracking-widest flex items-center gap-1.5 xs:gap-2">
                      <span className="w-4 xs:w-6 sm:w-8 h-px bg-slate-200" /> Matched
                      Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-2">
                      {selectedFileData.details?.matched_keywords.map(
                        (kw, i) => (
                          <span
                            key={i}
                            className="px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-1.5 bg-emerald-50 text-emerald-600 text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] font-bold rounded-md sm:rounded-lg border border-emerald-100/50"
                          >
                            {kw}
                          </span>
                        ),
                      )}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 xs:mb-3 sm:mb-4 tracking-widest flex items-center gap-1.5 xs:gap-2">
                      <span className="w-4 xs:w-6 sm:w-8 h-px bg-slate-200" /> Missing
                      Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-2">
                      {selectedFileData.details?.missing_keywords.map(
                        (kw, i) => (
                          <span
                            key={i}
                            className="px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-1.5 bg-rose-50 text-rose-600 text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] font-bold rounded-md sm:rounded-lg border border-rose-100/50"
                          >
                            {kw}
                          </span>
                        ),
                      )}
                    </div>
                  </section>
                </div>
              </div>

              <div className="order-1 lg:order-2 flex flex-col items-center justify-center bg-slate-50 rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-[2rem] lg:rounded-[3rem] p-2.5 xs:p-3 sm:p-4 md:p-6 lg:p-8 border border-slate-100">
                <div
                  ref={chartRef}
                  className="w-full max-w-48 xs:max-w-56 sm:max-w-64 md:max-w-72 lg:max-w-full aspect-square"
                >
                  <AnalysisChart
                    data={selectedFileData.details?.radar_data || [1,2,3]}
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
                  className="mt-3 xs:mt-4 sm:mt-5 md:mt-6 w-full xs:w-auto bg-dark hover:bg-emerald-600 text-white rounded-md xs:rounded-lg sm:rounded-xl md:rounded-2xl px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 h-8 xs:h-9 sm:h-10 md:h-11 lg:h-12 text-xs xs:text-sm sm:text-base shadow-lg transition-all active:scale-95"
                >
                  Download Analysis
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
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
