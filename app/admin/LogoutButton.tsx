"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
    >
      Logout
    </button>
  );
}
