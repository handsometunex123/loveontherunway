"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

interface RevokeModalProps {
  designer: {
    id: string;
    brandName: string;
    user: {
      email: string;
    };
  };
  onClose: () => void;
}

export default function RevokeModal({ designer, onClose }: RevokeModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRevoke = async () => {
    if (!reason.trim()) {
      showToast("Please provide a reason for revocation", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/designers/${designer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false, revocationReason: reason.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Unable to revoke designer", "error");
        return;
      }

      showToast("Designer revoked successfully! Notification email sent.", "success");
      router.refresh();
      onClose();
    } catch (err) {
      console.error(err);
      showToast("An error occurred while revoking designer", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold">Revoke Designer Approval</h2>
          <p className="text-sm text-slate-600 mt-1">
            You are about to revoke approval for <strong>{designer.brandName}</strong>
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Reason for Revocation <span className="text-red-600">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={6}
              placeholder="Explain why this designer's approval is being revoked. This message will be sent to their email."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              An email will be sent to {designer.user.email} with this message.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRevoke}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Revoking..." : "Revoke Approval"}
          </button>
        </div>
      </div>
    </div>
  );
}
