"use client";

import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import ClientLayout from "./ClientLayout";
import AuthModals from "@/components/AuthModals";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("UserLayout: Rendering for user routes");

  return (
    <ClientLayout isAdmin={false}>
      <AuthModals />
      <Navbar />
      <div className="flex flex-col min-h-screen pt-16">
        {children}
        <Toaster position="bottom-right" richColors />
      </div>
    </ClientLayout>
  );
}
