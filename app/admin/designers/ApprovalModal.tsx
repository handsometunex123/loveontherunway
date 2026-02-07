"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

interface ApprovalModalProps {
  designer: {
    id: string;
    brandName: string;
    bio: string | null;
    isApproved: boolean;
    user: {
      name: string | null;
      email: string;
      phone: string;
    };
    products: any[];
  };
  onClose: () => void;
}

export default function ApprovalModal({ designer, onClose }: ApprovalModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/designers/${designer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true })
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Unable to approve designer", "error");
        return;
      }

      showToast("Designer approved successfully! Approval email sent.", "success");
      router.refresh();
      onClose();
    } catch (err) {
      console.error(err);
      showToast("An error occurred while approving designer", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold">
            {designer.isApproved ? "Designer Already Approved" : "Approve Designer"}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-500">Brand Name</label>
            <p className="text-lg font-bold text-slate-900">{designer.brandName}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-500">Designer Name</label>
            <p className="text-slate-900">{designer.user.name || "Not provided"}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-500">Email</label>
            <p className="text-slate-900">{designer.user.email}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-500">Phone</label>
            <p className="text-slate-900">{designer.user.phone || "Not provided"}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-500">Bio</label>
            <p className="text-slate-900">{designer.bio || "No bio provided"}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-500">Products</label>
            <p className="text-slate-900">
              {designer.products.length} product{designer.products.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-500">Current Status</label>
            <p className="text-slate-900 font-semibold">
              {designer.isApproved ? "✅ Approved" : "❌ Pending Approval"}
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
          {!designer.isApproved && (
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Approving..." : "Approve Designer"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
