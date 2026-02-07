"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import Select from "@/app/components/Select";

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [votingEnabled, setVotingEnabled] = useState(initialSettings?.votingEnabled ?? false);
  const [eventPhase, setEventPhase] = useState(initialSettings?.eventPhase ?? "BEFORE_SHOW");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          votingEnabled,
          eventPhase
        })
      });

      if (response.ok) {
        showToast("Settings updated successfully", "success");
        router.refresh();
      } else {
        showToast("Failed to update settings", "error");
      }
    } catch (err) {
      showToast("An error occurred while saving settings", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={votingEnabled}
            onChange={(e) => setVotingEnabled(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-purple-600"
          />
          <span className="font-semibold text-slate-900">Enable Voting</span>
        </label>
      </div>

      <div>
        <label htmlFor="eventPhase" className="block mb-2 font-semibold text-slate-900">
          Event Phase:
        </label>
        <Select
          value={eventPhase}
          onChange={(value) => setEventPhase(value)}
          options={[
            { label: "Before Show", value: "BEFORE_SHOW" },
            { label: "After Show", value: "AFTER_SHOW" }
          ]}
          placeholder="Select phase"
        />
      </div>

      <button
        className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>

      <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-900 mb-2">Current Status:</p>
        <p>Voting: {votingEnabled ? "✅ Enabled" : "❌ Disabled"}</p>
        <p>Phase: {eventPhase}</p>
      </div>
    </form>
  );
}
