"use client";

import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("AdminLayout: Rendering for admin routes");

  return (
    <SidebarProvider>
      <div
        className={cn(
          "min-h-screen min-w-full bg-gray-50 text-gray-900 flex font-sans box-border"
        )}
      >
        <AppSidebar />
        <div className="flex-1 flex flex-col w-screen overflow-hidden">
          <SiteHeader />
          <main className="flex-1 overflow-auto">
            <div className="px-8 py-12 sm:px-8 sm:py-12 lg:px-12 lg:py-16 max-w-7xl mx-auto">
              {children}
              <Toaster position="bottom-right" richColors />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
