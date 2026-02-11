import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import AuthProvider from "./AuthProvider";
import HeaderNav from "./HeaderNav";
import CartNotification from "./CartNotification";
import ToastContainer from "@/components/ToastContainer";
import { ToastProvider } from "@/context/ToastContext";
import { LoadingProvider } from "@/context/LoadingContext";
import ProgressBar from "@/components/ProgressBar";
import FetchInterceptorInit from "@/components/FetchInterceptorInit";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love On The Runway | Fashion Show Platform",
  description: "Discover emerging fashion designers and exclusive collections at Love On The Runway. Featuring curated designer pieces and a unique voting experience.",
  keywords: ["fashion", "designers", "runway", "clothing", "fashion show", "ecommerce"],
  authors: [{ name: "Love On The Runway" }],
  openGraph: {
    title: "Love On The Runway | Fashion Show Platform",
    description: "Discover emerging fashion designers and exclusive collections",
    url: "https://loveontherunway.com",
    siteName: "Love On The Runway",
    images: [
      {
        url: "https://loveontherunway.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Love On The Runway"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Love On The Runway",
    description: "Discover emerging fashion designers and exclusive collections",
    images: ["https://loveontherunway.com/og-image.png"]
  }
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {

  let displayName: string | undefined;
  let brandLogo: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id && session.user.role === "DESIGNER") {
      const designerProfile = await db.designerProfile.findUnique({
        where: { userId: session.user.id, isDeleted: false }
      });
     
      if (designerProfile?.brandName) {
        displayName = designerProfile.brandName;
        brandLogo = designerProfile.brandLogo ?? undefined;
      }
    }
  } catch (error) {
    // Silently handle errors
  }

  // JSON-LD Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Love On The Runway",
    "url": "https://loveontherunway.com",
    "logo": "https://loveontherunway.com/og-image.png",
    "description": "Fashion show platform featuring emerging designers and exclusive collections",
    "sameAs": []
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900">
        <AuthProvider>
          <LoadingProvider>
            <FetchInterceptorInit />
            <ProgressBar />
            <ToastProvider>
              <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/95 backdrop-blur-2xl">
              <div className="w-full md:mx-auto flex items-center justify-between px-4 md:px-6 py-2 md:py-3 md:max-w-7xl">
                {/* Logo - Left */}
                <Link href="/" className="group flex items-center font-bold flex-shrink-0 hover:opacity-90 transition-all">
                  <div className="relative h-24 md:h-28 w-auto rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-2 shadow-md hover:shadow-lg hover:border-purple-300 transition-all">
                    <Image
                      src="/logo.jpg"
                      alt="Love On The Runway"
                      height={200}
                      width={350}
                      className="h-20 md:h-24 w-auto object-contain rounded-xl"
                      priority
                    />
                  </div>
                </Link>
                
                {/* Navigation - Right */}
                <HeaderNav displayName={displayName} brandLogo={brandLogo} />
              </div>
            </header>
            <main className="mx-auto w-full max-w-6xl px-4 md:px-6 py-12 md:py-20">
              {children}
            </main>
              <CartNotification />
              <ToastContainer />
            </ToastProvider>
          </LoadingProvider>
          <footer className="mt-auto">
            <div className="opacity-90 hover:opacity-100 transition-opacity flex flex-col items-center">
              <Image
                src="/creator_logo.png"
                alt="Creator Logo"
                height={100}
                width={100}
                className="h-24 w-24 object-contain"
              />
              <span className="text-xs text-gray-600 -mt-6">Developed by AySync Labs</span>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
