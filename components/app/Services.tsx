"use client";

import { toPng } from "html-to-image";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import {
  File,
  Trash2,
  Download,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader,
  RefreshCcw,
  Delete,
  MoveRight,
  Folder,
} from "lucide-react";
import Script from "next/script";
import { FileData } from "@/lib/interface";
import { AnalysisChart } from "../ui/radar";
import { getBaseUrl } from "@/lib/utils";
import Image from "next/image";

export function Services({ user }: { user: any }) {
  const id = user;
  const ref = useRef<HTMLDivElement>(null);
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

  if (isLoading) return <Loader className="w-full text-white animate-spin" />;

  return (
    <div>
      <Script
        src="https://apis.google.com/js/api.js"
        onLoad={() =>
          (window as any).gapi.load("picker", () => setIsPickerLoaded(true))
        }
      />

      <div className="sticky top-2 xs:top-2.5 sm:top-3 md:top-4 mx-1.5 xs:mx-2 sm:mx-3 md:mx-4">
        <div className="max-w-6xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 group transition-all duration-500 group-focus-within:flex-row group-focus-within:items-center">
          <div className="flex-1 w-full items-center relative transition-all duration-500 ease-in-out min-w-0">
            <textarea
              placeholder="Provide description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-3 xs:pl-3 sm:pl-4 pr-9 xs:pr-10 sm:pr-12 py-2 xs:py-2.5 sm:py-3 border border-white/20 focus:border-white text-xs xs:text-sm sm:text-base md:text-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-0 transition-all resize-none h-8 xs:h-10 sm:h-11 md:h-12 lg:h-13 font-mono"
            />
            {!description && (
              <div className="flex gap-2 items-center absolute right-10 xs:right-9 sm:right-10 md:right-14 top-1 xs:top-1.5 sm:top-2 md:top-2 px-2 xs:p-1.5 sm:px-3 sm:p-1.5 text-white/40">
                or upload <MoveRight className="w-6 text-white/20" />
              </div>
            )}
            {description && (
              <button
                className="flex absolute right-10 xs:right-9 sm:right-10 md:right-14 top-1 xs:top-1.5 sm:top-2 md:top-2 cursor-pointer px-2 xs:p-1.5 sm:px-3 sm:p-1.5 hover:bg-red-500 text-white transition-all shrink-0"
                onClick={() => setDescription("")}
              >
                <Delete className="w-6 text-current" />
              </button>
            )}
            <label className="flex absolute right-2 xs:right-1.5 sm:right-2 top-1 xs:top-1.5 sm:top-2 md:top-2 cursor-pointer px-2 xs:p-1.5 sm:px-3 sm:p-1.5 hover:bg-indigo-500 text-white transition-all shrink-0">
              <Paperclip className="w-6 text-current" />
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
      <div className="max-w-6xl mx-auto px-1.5 xs:px-2 sm:px-3 md:px-4 lg:px-6 mt-4 xs:mt-5 sm:mt-6 md:mt-8 lg:mt-8">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 mb-8 xl:mb-5">
          {[
            {
              title: "Google Drive",
              icon: (
                <Image
                  src="/drive.png"
                  alt="Drive"
                  width={25}
                  height={25}
                  className="invert transition-all"
                />
              ),
              handler: () => {
                if (!description.trim()) {
                  return toast.error("Description Required", {
                    description: "Please provide description to connect Drive",
                  });
                }
                login();
              },
            },
            {
              title: "Upload Folder",
              icon: <Folder className="w-6 h-6" />,
              handler: () => {
                if (!description.trim()) {
                  return toast.error("Description Required", {
                    description: "Please provide description to upload Folder",
                  });
                }
                folderInputRef.current?.click();
              },
            },
            {
              title: "Quick File",
              icon: <File className="w-6 h-6" />,
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
              title: "Watch Folder",
              icon: (
                <div className="text-[10px] font-bold border border-white/30 px-1">
                  LOCK
                </div>
              ),
              handler: () => toast.info("feature in development..."),
              disabled: true,
            },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={action.handler}
              disabled={action.disabled}
              className={`
                group relative flex items-center justify-center gap-3 py-3 px-4 transition-all duration-200
                ${
                  action.disabled
                    ? "text-white/30 cursor-not-allowed"
                    : "bg-black border-white hover:border-indigo-500 text-white hover:bg-indigo-500 active:scale-95 cursor-pointer"
                }
              `}
            >
              <div className={`${action.disabled ? "opacity-50" : ""}`}>
                {action.icon}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight">
                {action.title}
              </h3>
            </button>
          ))}
        </div>

        {extractedData.length !== 0 && (
          <div className="sm:p-10 p-5 space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 border border-white/30">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3 sm:gap-4">
              <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-white">
                Files{" "}
                <span className="text-white/30 ml-1">
                  ({extractedData.length})
                </span>
              </h2>
              <div className="flex w-full xs:w-auto">
                <Button
                  variant="ghost"
                  onClick={fetchHistory}
                  className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-white hover:bg-indigo-500 hover:text-white rounded-none h-7 xs:h-8 sm:h-9 px-2 xs:px-2.5 sm:px-3"
                >
                  <RefreshCcw
                    className={`w-3 xs:w-3.5 sm:w-4 mr-1 ${isProcessing ? "animate-spin" : ""}`}
                  />{" "}
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  onClick={exportToCSV}
                  className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-white hover:bg-green-500 hover:text-white rounded-none h-7 xs:h-8 sm:h-9 px-2 xs:px-2.5 sm:px-3"
                >
                  <Download className="w-3 xs:w-3.5 sm:w-4 mr-1" /> Export
                </Button>
                <Button
                  variant="ghost"
                  onClick={resetHistory}
                  className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-white hover:bg-red-500 hover:text-white rounded-none h-7 xs:h-8 sm:h-9 px-2 xs:px-2.5 sm:px-3"
                >
                  <Trash2 className="w-3 xs:w-3.5 sm:w-4 mr-1" /> Erase
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 xs:gap-2.5 sm:gap-3 md:gap-4">
              {extractedData.length !== 0 && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    {extractedData.map((file, idx) => {
                      const config = getStatusConfig(file.status);
                      const displayFilename = file.filename.split("/").pop();
                      const isInteractive =
                        file.details &&
                        !["processing", "failed", "pending"].includes(
                          file.status,
                        );

                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            isInteractive && setSelectedFileData(file)
                          }
                          className={`group py-4 px-6 ${isInteractive ? "cursor-pointer transition-transform transform hover:scale-105" : "cursor-not-allowed"}`}
                        >
                          <div className="flex items-center justify-between p-4 transition-all duration-200">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 transition-colors duration-300 ${isInteractive && "group-hover:bg-indigo-500"} flex items-center justify-center`}
                              >
                                <File className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-white">
                                  {displayFilename &&
                                  displayFilename.length > 35
                                    ? `${displayFilename.slice(0, 25)}...${displayFilename.split(".").pop()}`
                                    : displayFilename}
                                </h3>
                                <div
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black ${config.bg}`}
                                >
                                  {config.icon} {file.status.toUpperCase()}
                                </div>
                              </div>
                            </div>
                            {file.match_score !== null && (
                              <div className="text-right">
                                <div
                                  className={`text-3xl font-black text-slate-300 ${isInteractive && "group-hover:text-indigo-500"} `}
                                >
                                  {file.match_score}%
                                </div>
                                <div className="text-[10px] font-black text-white/50 uppercase">
                                  Match
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedFileData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFileData(null)}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              className="fixed inset-0 bg-white/20 backdrop-blur-md h-full w-full z-60"
            />
            <div
              className="fixed inset-0 grid place-items-center z-100"
              onClick={() => setSelectedFileData(null)}
            >
              <motion.div
                layoutId={`card-${selectedFileData.id}-${id}`}
                ref={ref}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl h-fit max-h-[90vh] flex flex-col bg-black overflow-hidden shadow-2xl"
              >
                <div className="py-8 px-10 overflow-y-auto no-scrollbar">
                  <div className="flex justify-between items-start mb-6">
                    <motion.h2
                      layoutId={`title-${selectedFileData.id}-${id}`}
                      className="text-2xl md:text-3xl font-bold text-indigo-500"
                    >
                      {selectedFileData.filename.split("/").pop()}
                    </motion.h2>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.1 }}
                      onClick={() => setSelectedFileData(null)}
                      className="p-2 bg-rose-500/50 text-white cursor-pointer rounded-none hover:bg-rose-500 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.1 }}
                      className="space-y-6"
                    >
                      {selectedFileData.details?.matched_keywords.length &&
                        selectedFileData.details?.matched_keywords.length >
                          0 && (
                          <section>
                            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">
                              Matched Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedFileData.details?.matched_keywords.map(
                                (kw, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 bg-emerald-500/30 text-white text-xs font-bold rounded-lg"
                                  >
                                    {kw}
                                  </span>
                                ),
                              )}
                            </div>
                          </section>
                        )}
                      {selectedFileData.details?.missing_keywords.length &&
                        selectedFileData.details?.missing_keywords.length >
                          0 && (
                          <section>
                            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">
                              Missing Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedFileData.details?.missing_keywords.map(
                                (kw, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 bg-rose-500/30 text-white text-xs font-bold rounded-lg"
                                  >
                                    {kw}
                                  </span>
                                ),
                              )}
                            </div>
                          </section>
                        )}
                    </motion.div>

                    <div className="flex flex-col items-center">
                      <motion.div
                        ref={chartRef}
                        className="w-full"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.1 }}
                      >
                        <AnalysisChart
                          data={
                            selectedFileData.details?.radar_data || [1, 2, 3]
                          }
                          color="white"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.1 }}
                        className="w-full"
                      >
                        <Button className="mt-1 w-full bg-black hover:bg-indigo-700 text-white rounded-none h-12 transition-colors">
                          Download Analysis
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
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
