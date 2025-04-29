"use client";
import { ReactNode } from "react";
import { ModalProvider } from "@/contexts/ModalContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function UserLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ModalProvider>
      <AuthProvider>
        <Navbar />
        <div className="flex flex-col min-h-screen">{children}</div>
      </AuthProvider>
    </ModalProvider>
  );
}
