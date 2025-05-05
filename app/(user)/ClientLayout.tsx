"use client";
import { ReactNode } from "react";
import { ModalProvider } from "@/contexts/ModalContext";
import { AuthProvider } from "@/contexts/AuthContext";

export default function ClientLayout({
  children,
  isAdmin,
}: {
  children: ReactNode;
  isAdmin: boolean;
}) {
  return (
    <ModalProvider>
      <AuthProvider>{children}</AuthProvider>
    </ModalProvider>
  );
}
