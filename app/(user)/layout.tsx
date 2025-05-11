"use client";

import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import AuthModals from "@/components/AuthModals";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModalProvider } from "@/contexts/ModalContext";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("UserLayout: Rendering for user routes");

  return (
    <AuthProvider>
      <ModalProvider>
        <AuthModals />
        <Navbar />
        <div className="flex flex-col min-h-screen pt-16">
          {children}
          <Toaster position="bottom-right" richColors />
        </div>
      </ModalProvider>
    </AuthProvider>
  );
}
