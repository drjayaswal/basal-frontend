"use client";

import { useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import Image from "next/image";
import Script from "next/script";
import { Spinner } from "@/components/ui/spinner";

export default function ResumeDashboard() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPickerLoaded, setIsPickerLoaded] = useState(false);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      openPicker(tokenResponse.access_token);
    },
    scope: process.env.NEXT_PUBLIC_DRIVE_URL,
  });

  const openPicker = (token: string) => {
    if (!isPickerLoaded) return alert("Picker API not loaded yet.");

    const google = (window as any).google;

    const handleConnectDrive = async (
      folderId: number,
      userAccessToken: string,
    ) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-folder/${folderId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userAccessToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (data.error) {
          console.error("Backend Error:", data.error);
        } else {
          console.log("Files found in folder:", data.files);
        }
      } catch (error) {
        console.error("Network Error:", error);
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
      .setOrigin(process.env.NEXT_PUBLIC_URL)
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .setCallback(async (data: any) => {
        if (data.action === google.picker.Action.PICKED) {
          const folderId = data.docs[0].id;
          try {
            await handleConnectDrive(folderId, token);
          } catch (err) {
            setIsLoading((prev) => !prev);
            console.error("Backend fetch failed:", err);
          }
        }
      })
      .build();

    picker.setVisible(true);
    setIsLoading((prev) => !prev);
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="flex items-center justify-center mt-20">
      <div className="flex items-center flex-col md:flex-row gap-8 p-10">
        {isLoggedIn ? (
          <div className="relative">
            <div className="flex flex-col items-center justify-center mx-auto ">
              <Script
                src="https://apis.google.com/js/api.js"
                onLoad={() => {
                  (window as any).gapi.load("picker", () =>
                    setIsPickerLoaded(true),
                  );
                }}
              />
              <Button
                size="lg"
                className="flex items-center gap-1 pl-3 h-14 text-lg font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-main hover:text-main shadow-sm transition-all duration-200 rounded-2xl group"
                onClick={() => {
                  setIsLoading((prev) => !prev);
                  login();
                }}
              >
                <Image
                  src={"/drive.png"}
                  alt={"drive"}
                  quality={100}
                  width={50}
                  height={50}
                  className="relative object-center border-0 grayscale group-hover:grayscale-0 transition-all"
                />

                <span className="flex flex-col items-start leading-tight">
                  <span className="text-xs font-normal text-slate-500 group-hover:text-main">
                    Google Drive
                  </span>
                  <span className="font-semibold">Connect</span>
                </span>
              </Button>
            </div>
            <div className="absolute -inset-1 bg-shadow rounded-xl blur opacity-20 -z-10"></div>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-4 pl-4 pr-8 h-16 bg-white border-2 border-dashed border-shadow rounded-2xl">
              <div className="flex items-center justify-center w-10 h-10">
                <Button
                  size="lg"
                  className="flex items-center gap-1 h-13 text-lg font-medium hover:bg-white bg-white text-main border-0 hover:text-green-500 shadow-none transition-all duration-200 rounded-xl group"
                  onClick={()=>setLoggedIn(true)}
                >
                  <LogIn className="scale-150" />
                </Button>
              </div>

              <div className="flex flex-col items-start justify-center">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 leading-none mb-1">
                  Access Restricted
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  Please Login to Connect Drive
                </span>
              </div>
            </div>
            <div className="absolute -inset-1 bg-shadow rounded-2xl blur-sm opacity-10 -z-10"></div>
          </div>
        )}
        {isLoggedIn && (
          <Button
            variant="outline"
            size="lg"
            className="flex items-center gap-1 p-5 h-13 text-lg font-medium bg-white text-rose-500 border-0 hover:bg-rose-500 hover:text-white shadow-sm transition-all duration-200 rounded-xl group"
            onClick={()=>setLoggedIn(false)}
          >
            <LogOut className="scale-150" />
          </Button>
        )}
      </div>
    </div>
  );
}
