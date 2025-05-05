import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import ClientLayout from "./ClientLayout";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("UserLayout: Rendering for user routes");

  return (
    <ClientLayout isAdmin={false}>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        {children}
        <Toaster position="bottom-right" richColors />
      </div>
    </ClientLayout>
  );
}
