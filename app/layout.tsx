// app/layout.tsx
import type { Metadata } from "next";
import { poppins } from "./font";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModalProvider } from "@/contexts/ModalContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Gian Construction & Supplies",
  description:
    "Your trusted partner for construction services and building supplies.",
  icons: {
    icon: "/images/gianconstruction2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className="antialiased bg-gray-50 font-sans">
        <AuthProvider>
          <ModalProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <footer className="bg-gray-800 text-white py-4 text-center">
                &copy; {new Date().getFullYear()} Gian Construction & Supplies
              </footer>
            </div>
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
