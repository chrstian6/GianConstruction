import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { verifyToken } from "@/lib/jwt";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = await verifyToken(cookieStore.get("token")?.value || "");

  if (!token) {
    redirect("/");
  }

  if (token.role !== "admin") {
    redirect("/(user)/dashboard");
  }

  return (
    <SidebarProvider>
      <div
        className={cn(
          "min-h-screen min-w-full bg-gray-50 text-gray-900 flex font-sans box-border",
          poppins.className
        )}
      >
        <AppSidebar />
        <div className="flex-1 flex flex-col w-screen overflow-hidden">
          <SiteHeader />
          <main className="flex-1 overflow-auto">
            <div className="px-8 py-12 sm:px-8 sm:py-12 lg:px-12 lg:py-16 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
