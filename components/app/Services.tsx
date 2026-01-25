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
  CheckCircle2,
  AlertCircle,
  Download,
  Paperclip,
  Cross,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Script from "next/script";
import { FileData } from "@/lib/interface";
import drive from "@/public/drive.png";
import { AnalysisChart } from "../ui/radar";

interface UserData {
  email: string;
  id: string;
  authenticated?: boolean;
}

interface ServicesProps {
  user: UserData | null;
}

export function Services({ user }: ServicesProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [totalFiles, setTotalFiles] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPickerLoaded, setIsPickerLoaded] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [extractedData, setExtractedData] = useState<FileData[]>([]);
  const [selectedFileData, setSelectedFileData] = useState<FileData | null>(
    null,
  );
  const progress =
    totalFiles > 0 ? Math.round((currentFileIndex / totalFiles) * 100) : 0;
  const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
  const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ];

  const handleConnect = () => login();
  const handleWatch = () => login();
  const openFolderPicker = () => folderInputRef.current?.click();
  const openFilePicker = () => fileInputRef.current?.click();

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (res.ok) {
          const history = await res.json();
          if (history && history.length > 0) {
            setExtractedData(history);
          }
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [user]);
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing) {
        e.preventDefault();
        e.returnValue =
          "Processing is in progress. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isProcessing]);

  const actions = [
    {
      label: "Google Drive",
      action: "Connect",
      isImage: true,
      isAvailable: true,
      handler: handleConnect,
    },
    {
      label: "Google Drive",
      action: "Watch",
      isImage: true,
      isAvailable: false,
      handler: handleWatch,
    },
    {
      label: "Upload",
      action: "Folder",
      isAvailable: true,
      // Full classes for Folder (Indigo/Rose)
      textGradient:
        "group-hover:bg-linear-to-r group-hover:from-indigo-500 group-hover:via-rose-500 group-hover:to-indigo-500 group-hover:bg-clip-text group-hover:text-transparent",
      barGradient: "bg-linear-to-r from-indigo-500 via-rose-500 to-indigo-500",
      icon: (
        <Files className="scale-180 m-2 text-slate-500 group-hover:text-indigo-500 transition-colors" />
      ),
      isImage: false,
      handler: openFolderPicker,
    },
    {
      label: "Upload",
      action: "File",
      isAvailable: true,
      // Full classes for File (Fuchsia/Teal)
      textGradient:
        "group-hover:bg-linear-to-r group-hover:from-indigo-500 group-hover:via-teal-500 group-hover:to-indigo-500 group-hover:bg-clip-text group-hover:text-transparent",
      barGradient: "bg-linear-to-r from-indigo-500 via-teal-500 to-indigo-500",
      icon: (
        <File className="scale-180 m-2 text-slate-500 group-hover:text-indigo-500 transition-colors" />
      ),
      isImage: false,
      handler: openFilePicker,
    },
  ];

  const exportToCSV = () => {
    if (extractedData.length === 0) return;

    const date = new Date().toISOString().split("T")[0];

    const fileName = `${extractedData.length} ${extractedData.length >= 2 ? "files" : "file"} @${date}.csv`;

    const headers = ["Filename", "Match Score (%)", "Status"];
    const rows = extractedData.map((file) => [
      file.filename,
      file.ml_analysis ? Math.round(file.ml_analysis.match_score * 100) : "N/A",
      file.ml_analysis ? file.ml_analysis.status : "N/A",
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported: ${fileName}`);
  };
  const handleSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to upload files");
      return;
    }

    // 1. Filter valid files first to show the user the correct count in the toast
    const validFiles = Array.from(files).filter((file) => {
      const isAllowedType = ALLOWED_MIME_TYPES.includes(file.type);
      const isUnderSizeLimit = file.size <= MAX_FILE_SIZE_BYTES;
      return isAllowedType && isUnderSizeLimit;
    });

    if (validFiles.length === 0) {
      toast.error("No valid files found in selection");
      return;
    }

    // 2. Trigger Confirmation Toast
    toast(
      `Analyze ${validFiles.length} ${validFiles.length > 1 ? "files" : "file"}?`,
      {
        description:
          "This will consume credits and begin the analysis process.",
        action: {
          label: "Yes, Start",
          onClick: async () => {
            setIsProcessing(true);
            setTotalFiles(validFiles.length);
            setCurrentFileIndex(0);

            for (let i = 0; i < validFiles.length; i++) {
              const file = validFiles[i];
              setCurrentFileIndex(i + 1);
              setProcessingStatus(`Analyzing ${file.name}...`);

              const formData = new FormData();
              // Use webkitRelativePath for folder structure, fallback to name
              formData.append(
                "files",
                file,
                file.webkitRelativePath || file.name,
              );
              if (user?.id) formData.append("userId", user.id);
              if (description) formData.append("description", description);

              try {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`,
                  {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                  },
                );

                if (response.ok) {
                  const rawData = await response.json();
                  const normalizedData = Array.isArray(rawData)
                    ? rawData
                    : [rawData];
                  setExtractedData((prev) => [...normalizedData, ...prev]);
                } else {
                  console.error(`Failed to upload ${file.name}`);
                }
              } catch (error) {
                console.error("Upload error:", error);
              }
            }

            setIsProcessing(false);
            setProcessingStatus("");
            // Clear inputs
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (folderInputRef.current) folderInputRef.current.value = "";
            toast.success("All files processed successfully");
          },
        },
        cancel: {
          label: "Cancel",
          onClick: () => {
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (folderInputRef.current) folderInputRef.current.value = "";
          },
        },
      },
    );
  };
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      openPicker(tokenResponse.access_token);
    },
    scope: "https://www.googleapis.com/auth/drive.readonly",
  });
  const openPicker = (token: string) => {
    if (!isPickerLoaded) return alert("Picker API not loaded yet.");
    const biasbreakerToken = localStorage.getItem("token");
    const google = (window as any).google;

    const handleConnectDrive = async (
      folderId: string,
      userAccessToken: string,
    ) => {
      setIsProcessing(true);
      setProcessingStatus("Connecting to Google Drive...");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-folder`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${biasbreakerToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              folderId,
              description,
              userId: user?.id,
              googleToken: userAccessToken,
              email: user?.email,
            }),
          },
        );

        const data = await response.json();
        if (response.ok) {
          setExtractedData(Array.isArray(data) ? data : [data]);
          toast.success("Folder processed successfully");
        }
      } catch (error) {
        toast.error("Failed to process folder");
      } finally {
        setIsProcessing(false);
      }
    };

    const view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMode(google.picker.DocsViewMode.LIST);

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(token)
      .setDeveloperKey(process.env.NEXT_PUBLIC_PICKER_KEY)
      .setAppId(process.env.NEXT_PUBLIC_APP_ID)
      .setTitle("Select Biasbreaker Project Folder")
      .setSize(1050, 650)
      .setOrigin(window.location.origin)
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .setCallback(async (data: any) => {
        if (data.action === google.picker.Action.PICKED) {
          const folderId = data.docs[0].id;
          try {
            await handleConnectDrive(folderId, token);
          } catch (err) {
            console.error("Backend fetch failed:", err);
            setIsLoading(false);
          }
        } else if (data.action === google.picker.Action.CANCEL) {
          setIsLoading(false);
        }
      })
      .build();

    picker.setVisible(true);
    setIsLoading(true);
  };
  const resetHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    toast("Permanently delete history?", {
      description: "This action cannot be undone.",
      action: {
        label: "Yes, Clear All",
        onClick: async () => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/reset-history`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (response.ok) {
              setExtractedData([]);
              toast.success("History permanently cleared");
            } else {
              toast.error("Failed to clear history on server");
            }
          } catch (error) {
            console.error("Reset error:", error);
            toast.error("Could not reach the server");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => console.log("Reset cancelled"),
      },
    });
  };
  const handleDescriptionFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("Invalid file type for Job Description");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsProcessing(true);
    setProcessingStatus("Extracting description from file...");

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
      setProcessingStatus("");
      e.target.value = "";
    }
  };
  const downloadChart = async () => {
    if (chartRef.current === null) return;

    try {
      const dataUrl = await toPng(chartRef.current, {
        cacheBust: true,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.download = `${selectedFileData?.filename || "analysis"}-chart.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Chart downloaded as PNG");
    } catch (err) {
      toast.error("Failed to export chart");
      console.error(err);
    }
  };
  if (isLoading && extractedData.length === 0) return <Spinner />;

  return (
    <div className="flex flex-col items-center justify-start my-20 p-4 sm:p-6">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleSelection}
      />
      <input
        type="file"
        ref={folderInputRef}
        className="hidden"
        onChange={handleSelection}
        /* @ts-ignore */
        webkitdirectory=""
        directory=""
      />
      <div className="w-full max-w-4xl mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-main tracking-tight">
            Services
          </h1>
          <p className="text-slate-500 mb-6">
            Manage your connections and folders
          </p>

          <div className="max-w-md mx-auto mb-8 flex gap-2 items-center justify-center">
            <div className="flex items-center gap-2 w-full">
              <textarea
                placeholder="Describe your requirements here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-main/2 border-2 border-transparent shadow-inner text-main focus:outline-none focus:border-main/10 placeholder:text-slate-400 transition-colors"
              />
              <label className="flex cursor-pointer bg-white border-2 border-dashed border-slate-300 rounded-xl p-2 text-center transition-colors shadow-inner">
                <span className="text-sm text-slate-300">
                  <Paperclip />
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleDescriptionFileChange}
                  accept=".pdf,.docx,.txt"
                />
              </label>
            </div>
          </div>
        </header>
        <Script
          src="https://apis.google.com/js/api.js"
          onLoad={() => {
            (window as any).gapi.load("picker", () => setIsPickerLoaded(true));
          }}
        />
        <nav className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12 justify-items-center">
          {actions.map((item, idx) => (
            <Button
              key={idx}
              variant="outline"
              disabled={!item.isAvailable}
              onClick={() =>
                description
                  ? item.handler()
                  : toast.info("Provide a description")
              }
              className={`
        group relative flex flex-col items-start justify-between 
        h-35 w-full max-w-45
        p-5 border-0 ${item.isAvailable ? "shadow-md hover:shadow-2xl" : "shadow-none"}
        bg-white hover:bg-gray-50
        transition-all duration-300 rounded-3xl rounded-t-none hover:rounded-t-3xl overflow-hidden
      `}
            >
              <div className="shrink-0">
                {item.isImage ? (
                  <Image
                    src={drive}
                    alt="icon"
                    width={48}
                    height={48}
                    className="grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                ) : (
                  <div className="transition-colors">{item.icon}</div>
                )}
              </div>

              <div className="flex flex-col items-start text-left mt-4">
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold text-slate-400 transition-all duration-300 ${item.textGradient}`}
                >
                  {item.label}
                </span>
                <span
                  className={`text-xl font-extrabold leading-tight text-slate-700 transition-all duration-300 ${item.textGradient}`}
                >
                  {item.action}
                </span>
              </div>

              <div
                className={`absolute bottom-0 left-0 w-full h-2.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-r-full 
        ${item.barGradient || "bg-linear-to-r from-emerald-500 via-main to-amber-500"}`}
              />
            </Button>
          ))}
        </nav>
        {extractedData.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-b-slate-200 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                Processing Results
              </h2>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportToCSV}
                  className="text-emerald-500 hover:text-white hover:bg-emerald-500 bg-emerald-500/10 rounded-lg"
                >
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetHistory}
                  className="text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Clear
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {extractedData.map((file, fileIdx) => (
                <div
                  key={fileIdx}
                  onClick={() => setSelectedFileData(file)}
                  className="group cursor-pointer rounded-3xl p-5 bg-white shadow-xs hover:shadow-md transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-main/5 rounded-xl">
                            <File className="w-5 h-5 text-main" />
                          </div>
                          <h3 className="font-bold text-slate-800 text-sm sm:text-base break-all">
                            {file.filename}
                          </h3>
                        </div>

                        {file.ml_analysis && (
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${
                                file.ml_analysis.status === "High Match"
                                  ? "bg-emerald-50 text-emerald-700 border-0"
                                  : "bg-amber-50 text-amber-700 border-0"
                              }`}
                            >
                              {Math.round(file.ml_analysis.match_score * 100)}%
                              Match
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {file.ml_analysis?.analysis_details && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2">
                            Hits (
                            {file.ml_analysis.analysis_details.total_matches}{" "}
                            Total)
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {file.ml_analysis.analysis_details.matched_keywords.map(
                              (kw, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded border border-emerald-100"
                                >
                                  {kw}
                                </span>
                              ),
                            )}
                            {file.ml_analysis.analysis_details.total_matches >
                              10 && (
                              <span className="text-[9px] text-slate-400 italic font-medium">
                                +{" "}
                                {file.ml_analysis.analysis_details
                                  .total_matches - 10}{" "}
                                more
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2">
                            Lags ({file.ml_analysis.analysis_details.total_lags}{" "}
                            Total)
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {file.ml_analysis.analysis_details.missing_keywords.map(
                              (kw, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] rounded border border-rose-100"
                                >
                                  {kw}
                                </span>
                              ),
                            )}
                            {file.ml_analysis.analysis_details.total_lags >
                              10 && (
                              <span className="text-[9px] text-slate-400 italic font-medium">
                                +{" "}
                                {file.ml_analysis.analysis_details.total_lags -
                                  10}{" "}
                                more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {isProcessing && (
        <div className="fixed inset-0 z-70 flex flex-col items-center justify-center bg-main/10 backdrop-blur-md p-6 text-white">
          <div className="w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl text-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-main">Processing </h3>
              <span className="text-sm font-medium text-slate-500">
                {currentFileIndex} / {totalFiles}
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-main transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-sm text-center text-slate-600 animate-pulse">
              {processingStatus}
            </p>

            <p className="mt-6 text-[10px] text-center text-slate-400 uppercase tracking-widest">
              Please do not close this tab
            </p>
          </div>
        </div>
      )}
      {/* VISUALIZATION POPUP */}
      {selectedFileData && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedFileData(null)} // Close on background click
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedFileData.filename}
                </h3>
                <p className="text-sm text-slate-500">
                  In-depth skill visualization
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadChart}
                  className="rounded-xl border-0 hover:text-white hover:bg-emerald-500 text-emerald-500 bg-emerald-50"
                >
                  <Download className="w-4 h-4 mr-2" /> PNG
                </Button>
                <Button
                  onClick={() => setSelectedFileData(null)}
                  className="p-2 rounded-full hover:bg-rose-100 text-rose-500 transition-colors bg-transparent"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div
              ref={chartRef}
              className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm"
            >
              <AnalysisChart
                data={selectedFileData.ml_analysis.analysis_details.radar_data}
                color={
                  selectedFileData.ml_analysis.status === "High Match"
                    ? "#10b981"
                    : "#f59e0b"
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
