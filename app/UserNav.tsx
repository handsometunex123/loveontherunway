"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface UserNavProps {
  displayName?: string;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

export default function UserNav({ displayName, variant = "desktop", onNavigate }: UserNavProps) {
  const { data: session } = useSession();
  const handleNavigate = () => onNavigate?.();

  if (!session?.user) {
    if (variant === "mobile") {
      return (
        <div className="border-t border-slate-200 pt-3 mt-2">
          <Link
            href="/login"
            onClick={handleNavigate}
            className="flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Login
          </Link>
        </div>
      );
    }

    return (
      <li>
        <a href="/login" className="hover:text-purple-600 border-transparent text-slate-900 hover:border-slate-200 hover:bg-white">Login</a>
      </li>
    );
  }

  if (variant === "mobile") {
    return (
      <div className="border-t border-slate-200 pt-3 mt-2 flex flex-col gap-2">
        <Link
          href="/admin"
          onClick={handleNavigate}
          className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          {displayName || session.user.email}
        </Link>
        <button
          type="button"
          onClick={() => {
            handleNavigate();
            signOut({ callbackUrl: "/login" });
          }}
          className="flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
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
          className="flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-200 hover:bg-white hover:text-purple-600 transition-all"
        >
          <svg
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          {displayName || session.user.email}
        </Link>
      </li>
      <li>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-200 hover:bg-white hover:text-red-600 transition-all cursor-pointer"
        >
          Logout
        </button>
      </li>
    </>
  );
}
