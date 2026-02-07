import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export default function PermanentDeleteModal({ designer, onClose }: { designer: any; onClose: () => void }) {
  const router = useRouter();
  const { showToast } = useToast();

  const handlePermanentDelete = async () => {
    try {
      const response = await fetch(`/api/admin/designers/${designer.id}/permanent-delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        showToast(data.error || "Failed to permanently delete designer", "error");
        return;
      }

      router.refresh();
      showToast("Designer permanently deleted successfully", "success");
      onClose();
    } catch (err) {
      console.error(err);
      showToast("An error occurred while permanently deleting the designer", "error");
    }
  };

  return (
    <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal-content bg-white rounded-lg p-6 shadow-lg z-60 relative">
        <h2 className="text-lg font-semibold">Permanently Delete Designer</h2>
        <p className="text-sm text-gray-600">
          This action will remove all records of the designer and their products from the platform. This action cannot be undone.
        </p>
        <div className="modal-actions flex justify-end gap-4 mt-4">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={handlePermanentDelete}
          >
            Confirm Permanent Delete
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}