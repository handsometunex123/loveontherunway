import "./globals.css";
import Link from "next/link";
import AuthProvider from "./AuthProvider";
import HeaderNav from "./HeaderNav";
import ToastContainer from "@/components/ToastContainer";
import { ToastProvider } from "@/context/ToastContext";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = {
  title: "Love On The Runway",
  description: "Fashion show ecommerce platform for a church event."
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let displayName: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id && session.user.role === "DESIGNER") {
      const designerProfile = await db.designerProfile.findUnique({
        where: { userId: session.user.id }
      });
     
      if (designerProfile?.brandName) {
        displayName = designerProfile.brandName;
      }
    }
  } catch (error) {
    // Silently handle errors
  }
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <AuthProvider>
          <ToastProvider>
            <header className="sticky top-0 z-20 border-b border-slate-200/50 bg-white/90 backdrop-blur-2xl shadow-sm">
              <div className="w-full md:mx-auto flex items-center justify-between px-4 md:px-6 py-3.5 md:py-4 md:max-w-6xl">
                {/* Logo - Left */}
                <Link href="/" className="group flex items-center gap-2 md:gap-3 font-bold flex-shrink-0 hover:opacity-80 transition-opacity">
                  <span className="inline-flex h-9 md:h-10 w-9 md:w-10 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white shadow-lg shadow-purple-300/50 text-base md:text-lg group-hover:shadow-purple-400/60 transition-shadow">
                    ✦
                  </span>
                </Link>
                
                {/* Center Text - Mobile Only */}
                <span className="md:hidden text-sm font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900">
                  LOTRW
                </span>
                
                {/* Full Brand Name - Desktop Only */}
                <Link href="/" className="hidden md:flex items-center gap-3 font-bold hover:opacity-80 transition-opacity">
                  <span className="text-sm font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900">
                    LOVE ON THE RUNWAY
                  </span>
                </Link>
                
                {/* Navigation - Right */}
                <HeaderNav displayName={displayName} />
              </div>
            </header>
            <main className="mx-auto w-full max-w-6xl px-4 md:px-6 py-12 md:py-20">
              {children}
            </main>
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
