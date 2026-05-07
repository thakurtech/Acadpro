import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import CommandPalette from "@/components/layout/CommandPalette";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "APEX — Life OS",
  description: "Your hyper-productivity operating system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#15152a",
              color: "#f0f0ff",
              border: "1px solid #1e1e3a",
              borderRadius: "10px",
              fontSize: "13px",
            },
          }}
        />
        <CommandPalette />
        <Sidebar />
        <main className="ml-[220px] min-h-screen bg-bg-base">
          {children}
        </main>
      </body>
    </html>
  );
}
