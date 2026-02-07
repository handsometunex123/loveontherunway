"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";

export default function DesignerInviteForm() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/designer-invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail })
      });

      const data = await response.json();

      console.log({data});

      if (!response.ok) {
        showToast(data.error || "Failed to send invite", "error");
        return;
      }

      showToast(data.message || "Invite sent successfully", "success");
      setEmail("");
    } catch (error) {
      showToast("An error occurred while sending invite", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-5 shadow-md border border-slate-100">
      <h3 className="text-lg font-bold mb-2">Invite a Designer</h3>
      <p className="text-sm text-slate-600 mb-4">
        Send a secure registration link to a designer. The link expires in 24 hours.
      </p>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="email"
          placeholder="designer@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send Invite"}
        </button>
      </div>
    </form>
  );
}
