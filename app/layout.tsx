import "./globals.css";
import Footer from "../components/app/Footer";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import AuthGuard from "@/components/app/AuthGurad";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Basal",
  description: "AI-driven utility to ensure fair and unbiased",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
           style: { 
              border: '0.15px solid rgba(255, 255, 255, 0.3)', 
              borderRadius: '0px',
              backgroundColor: '#000000',
              color: '#ffffff'
            },
            className: "bg-white text-black font-bold broder border-white",
          }}
        />
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <AuthGuard>
            <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden font-mono bg-black">
              <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center" />
              <div className="relative z-10 w-full items-center">
                {children}
              </div>
            </main>
            <Footer />
          </AuthGuard>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
