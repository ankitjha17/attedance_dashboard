import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppNavigation } from "@/components/AppNavigation";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Student Attendance Dashboard",
  description: "A simple student attendance dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-900">
        <AppProvider>
          <div className="h-full relative">
            <AppNavigation />
            <main className="md:pl-72 pb-10">
              <div className="p-4 md:p-8 max-w-6xl mx-auto">
                {children}
              </div>
            </main>
          </div>
          <Toaster position="top-right" richColors />
        </AppProvider>
      </body>
    </html>
  );
}
