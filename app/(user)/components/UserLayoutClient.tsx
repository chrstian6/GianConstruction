"use client";
import { ReactNode } from "react";
import { ModalProvider } from "@/contexts/ModalContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

interface UserLayoutClientProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export default function UserLayoutClient({
  children,
  isAuthenticated,
}: UserLayoutClientProps) {
  return (
    <ModalProvider>
      <AuthProvider>
        <Navbar />
        <div className="flex flex-col min-w-screen">{children}</div>
      </AuthProvider>
    </ModalProvider>
  );
}
