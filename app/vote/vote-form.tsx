"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { ButtonLoader } from "@/components/Loader";

export default function VoteForm() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, productId })
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Vote recorded successfully. Thank you!", "success");
        setEmail("");
        setPhone("");
        setProductId("");
        return;
      }

      showToast(data.error ?? "Unable to vote", "error");
    } catch (error) {
      showToast("An error occurred while voting", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-3 max-w-md" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
        disabled={loading}
      />
      <input
        type="tel"
        placeholder="Phone number"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Product ID"
        value={productId}
        onChange={(event) => setProductId(event.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
        disabled={loading}
      />
      <button 
        className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2" 
        type="submit"
        disabled={loading}
      >
        {loading && <ButtonLoader size="sm" />}
        {loading ? "Voting..." : "Vote"}
      </button>
    </form>
  );
}
