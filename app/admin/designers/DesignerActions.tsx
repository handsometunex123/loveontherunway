"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import ApprovalModal from "./ApprovalModal";
import RevokeModal from "./RevokeModal";
import DeleteModal from "./DeleteModal";
import ReinstateModal from "./ReinstateModal";

export default function DesignerActions({ designer }: { designer: any }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReinstateModal, setShowReinstateModal] = useState(false);

  const handleApprovalClick = () => {
    if (designer.isApproved) {
      setShowRevokeModal(true);
    } else {
      setShowApprovalModal(true);
    }
  };

  const toggleVisibility = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/designers/${designer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !designer.isVisible })
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Unable to update visibility", "error");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      showToast("An error occurred while updating visibility", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };


  return (
    <>
      {designer.isDeleted ? (
        <button
          className="w-full rounded-lg px-3 py-2 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => setShowReinstateModal(true)}
          disabled={loading}
        >
          Reinstate
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
        <button
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
            designer.isApproved
              ? "bg-red-100 text-red-900 hover:bg-red-200"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
          onClick={handleApprovalClick}
          disabled={loading}
        >
          {designer.isApproved ? "Revoke" : "Approve"}
        </button>
        <button
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
            designer.isVisible
              ? "bg-slate-100 text-slate-900 hover:bg-slate-200"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
          onClick={toggleVisibility}
          disabled={loading}
        >
          {designer.isVisible ? "Hide" : "Show"}
        </button>
        
          {!designer.isApproved && (
            <button
              className="col-span-2 rounded-lg px-3 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteClick}
              disabled={loading}
            >
              Delete
            </button>
          )}
        </div>
      )}

      {showApprovalModal && (
        <ApprovalModal designer={designer} onClose={() => setShowApprovalModal(false)} />
      )}

      {showRevokeModal && (
        <RevokeModal designer={designer} onClose={() => setShowRevokeModal(false)} />
      )}

        {showDeleteModal && (
          <DeleteModal
            designer={designer}
            onClose={() => setShowDeleteModal(false)}
          />
        )}


      {showReinstateModal && (
        <ReinstateModal designer={designer} onClose={() => setShowReinstateModal(false)} />
      )}
    </>
  );
}
