"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

interface ReinstateModalProps {
  designer: {
    id: string;
    brandName: string;
    user: {
      email: string;
    };
  };
  onClose: () => void;
}

export default function ReinstateModal({ designer, onClose }: ReinstateModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleReinstate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/designers/${designer.id}/reinstate`, {
        method: "PATCH"
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Unable to reinstate designer", "error");
        return;
      }

      showToast("Designer reinstated successfully", "success");
      router.refresh();
      onClose();
    } catch (err) {
      console.error(err);
      showToast("An error occurred while reinstating designer", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-emerald-600">Reinstate Designer</h2>
          <p className="text-sm text-slate-600 mt-1">
            Restore this designer to active status
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-900">
              You are about to reinstate <strong>{designer.brandName}</strong> ({designer.user.email}).
            </p>
          </div>
          
          <p className="text-sm text-slate-600">
            This will:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            <li>Remove the deleted status</li>
            <li>Allow the designer to be approved again</li>
            <li>Restore access to their account</li>
          </ul>

          <p className="text-sm text-slate-900 font-semibold">
            Do you want to proceed?
          </p>
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReinstate}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Reinstating..." : "Reinstate Designer"}
          </button>
        </div>
      </div>
    </div>
  );
}
