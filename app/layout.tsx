import "./globals.css";
import Navbar from "../components/app/Navbar";
import Footer from "../components/app/Footer";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import AuthGuard from "@/components/app/AuthGurad";
import { AlertCircle, CheckCircle2, Info, Loader } from "lucide-react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BiasBreaker",
  description: "AI-driven utility to ensure fair and unbiased selection",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased select-none bg-black`}
      >
        <Toaster
          position="bottom-right"
          closeButton
          theme="dark"
          toastOptions={{
            className:
              "bg-main text-black border-none font-bold rounded-2xl shadow-2xl",
          }}
          icons={{
            success: <CheckCircle2 className="text-green-500" size={18} />,
            error: <AlertCircle className="text-rose-500" size={18} />,
            info: <Info className="text-blue-500" size={18} />,
            loading: <Loader className="animate-spin text-black" size={18} />,
          }}
        />
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <AuthGuard>
            <Navbar />
            <div className="min-h-screen py-20 w-full flex flex-col items-center justify-center overflow-x-hidden font-mono">
              {children}
            </div>
            <Footer />
          </AuthGuard>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
