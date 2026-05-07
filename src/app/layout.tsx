import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import CommandPalette from "@/components/layout/CommandPalette";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "APEX — Life OS",
  description: "Your hyper-productivity operating system",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Toaster position="top-center" toastOptions={{
          style: {
            background: "rgba(28,28,34,0.96)",
            color: "rgba(255,255,255,0.92)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            fontSize: "14px",
            fontWeight: "500",
            backdropFilter: "blur(40px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            padding: "12px 16px",
          },
          duration: 2000,
        }} />
        <CommandPalette />
        <Sidebar />
        <main className="md:ml-60 pt-[60px] md:pt-0 pb-24 md:pb-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
