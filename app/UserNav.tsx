"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { memo } from "react";

interface UserNavProps {
  displayName?: string;
  brandLogo?: string;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

function UserNav({ displayName, brandLogo, variant = "desktop", onNavigate }: UserNavProps) {
  const { data: session } = useSession();
  const handleNavigate = () => onNavigate?.();

  if (!session?.user) {
    if (variant === "mobile") {
      return (
        <div className="border-t border-slate-200 pt-3 mt-2">
          <Link
            href="/login"
            onClick={handleNavigate}
            className="flex items-center justify-center rounded-lg px-4 py-3 text-base font-semibold text-slate-900 hover:bg-slate-100"
          >
            Login
          </Link>
        </div>
      );
    }

    return (
      <li>
        <a href="/login" className="text-lg lg:text-xl hover:text-purple-600 border-transparent text-slate-900 hover:border-slate-200 hover:bg-white">Login</a>
      </li>
    );
  }

  if (variant === "mobile") {
    return (
      <div className="border-t border-slate-200 pt-3 mt-2 flex flex-col gap-2">
        <Link
          href="/admin"
          onClick={handleNavigate}
          className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50 transition-all"
        >
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={`${displayName || session.user.email} logo`}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-purple-200"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 text-xs font-bold ring-2 ring-slate-100">
              {(displayName || session.user.email || "U").slice(0, 2).toUpperCase()}
            </div>
          )}
          {displayName || session.user.email}
        </Link>
        <button
          type="button"
          onClick={() => {
            handleNavigate();
            signOut({ callbackUrl: "/login" });
          }}
          className="flex items-center justify-center rounded-lg px-4 py-3 text-base font-semibold text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <li>
        <Link 
          href="/admin" 
          className="flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-base lg:text-lg font-semibold text-slate-800 hover:bg-white hover:text-purple-700 transition-all"
        >
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={`${displayName || session.user.email} logo`}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-purple-200"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 text-[10px] font-bold ring-2 ring-slate-100">
              {(displayName || session.user.email || "U").slice(0, 2).toUpperCase()}
            </div>
          )}
          {displayName || session.user.email}
        </Link>
      </li>
      <li>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-full bg-white/90 px-4 py-2 text-base lg:text-lg font-semibold text-slate-600 hover:bg-white hover:text-red-600 transition-all cursor-pointer"
        >
          Logout
        </button>
      </li>
    </>
  );
}

export default memo(UserNav);
