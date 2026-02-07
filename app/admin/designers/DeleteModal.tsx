"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import PermanentDeleteModal from "./PermanentDeleteModal";

interface DeleteModalProps {
  designer: {
    id: string;
    brandName: string;
    user: {
      email: string;
    };
  };
  onClose: () => void;
  onPermanentDelete: () => void;
}

export default function DeleteModal({ designer, onClose, onPermanentDelete }: DeleteModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/designers/${designer.id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Unable to delete designer", "error");
        return;
      }

      showToast("Designer deleted successfully", "success");
      router.refresh();
      onClose();
    } catch (err) {
      console.error(err);
      showToast("An error occurred while deleting designer", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-red-600">Delete Designer</h2>
          <p className="text-sm text-slate-600 mt-1">
            This will mark the designer as deleted for documentation purposes
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-900">
              <strong>Warning:</strong> You are about to mark <strong>{designer.brandName}</strong> ({designer.user.email}) as deleted.
            </p>
          </div>
          
          <p className="text-sm text-slate-600">
            This will:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            <li>Mark the designer as deleted</li>
            <li>Disable approval and visibility</li>
            <li>Keep records for documentation</li>
          </ul>

          <p className="text-sm text-slate-900 font-semibold">
            Are you absolutely sure you want to proceed?
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
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Designer"}
          </button>
          <button
            onClick={onPermanentDelete}
            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
