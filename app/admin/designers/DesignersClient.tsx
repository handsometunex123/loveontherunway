
"use client";


import { FaInstagram, FaTwitter, FaTiktok, FaGlobe, FaPhoneAlt, FaUser, FaEnvelope, FaRegIdBadge } from "react-icons/fa";

function DesignerProfileModal({ designer, open, onClose }: { designer: any; open: boolean; onClose: () => void }) {
  if (!open || !designer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-0 relative border border-slate-100">
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-2xl font-bold rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <div className="flex flex-col items-center gap-4 pt-8 pb-4 px-8">
          {designer.brandLogo ? (
            <img src={designer.brandLogo} alt={`${designer.brandName} logo`} className="h-24 w-24 object-cover rounded-xl border-2 border-slate-200 shadow-sm bg-white" />
          ) : (
            <div className="h-24 w-24 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 font-extrabold text-3xl border-2 border-slate-200 shadow-sm">
              {designer.brandName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <h2 className="font-extrabold text-2xl md:text-3xl text-slate-900 text-center tracking-tight mt-2">{designer.brandName}</h2>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <FaEnvelope className="inline-block mr-1" />
            <span>{designer.user.email}</span>
          </div>
        </div>
        <div className="border-t border-slate-100 mx-8" />
        <div className="mt-6 space-y-3 px-8 pb-2">
          <div className="flex items-center gap-2 text-slate-700"><FaUser className="text-slate-400" /><span className="font-semibold">Full Name:</span> <span className="font-normal">{designer.user.name}</span></div>
          <div className="flex items-center gap-2 text-slate-700"><FaPhoneAlt className="text-slate-400" /><span className="font-semibold">Phone:</span> <span className="font-normal">{designer.user.phone}</span></div>
          <div className="flex items-start gap-2 text-slate-700"><FaRegIdBadge className="text-slate-400 mt-1" /><span className="font-semibold">Bio:</span> <span className="font-normal">{designer.bio || <span className="italic text-slate-400">No bio</span>}</span></div>
          <div className="flex flex-wrap gap-3 mt-2">
            {designer.website && (
              <a href={designer.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-purple-700 font-medium text-xs hover:bg-purple-50 transition">
                <FaGlobe /> Website
              </a>
            )}
            {designer.instagram && (
              <a href={`https://instagram.com/${designer.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-pink-600 font-medium text-xs hover:bg-pink-50 transition">
                <FaInstagram /> Instagram
              </a>
            )}
            {designer.twitter && (
              <a href={`https://twitter.com/${designer.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-sky-600 font-medium text-xs hover:bg-sky-50 transition">
                <FaTwitter /> Twitter/X
              </a>
            )}
            {designer.tiktok && (
              <a href={`https://tiktok.com/@${designer.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-black font-medium text-xs hover:bg-slate-100 transition">
                <FaTiktok /> TikTok
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-semibold text-slate-700">Status:</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${designer.isDeleted ? "bg-rose-50 text-rose-700 border-rose-200" : designer.isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{designer.isDeleted ? 'Deleted' : designer.isApproved ? 'Approved' : 'Pending'}</span>
            {!designer.isVisible && !designer.isDeleted && <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Hidden</span>}
          </div>
        </div>
        <div className="mt-8 flex justify-end px-8 pb-8">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold shadow hover:bg-slate-800 transition text-base">Close</button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import Link from "next/link";
import DesignerActions from "./DesignerActions";

type FilterType = "all" | "approved" | "pending" | "visible" | "hidden" | "deleted";

interface DesignersClientProps {
  designers: any[];
  deletedDesigners: any[];
  stats: {
    total: number;
    approved: number;
    pending: number;
    visible: number;
    hidden: number;
    deleted: number;
  };
}

export default function DesignersClient({
  designers,
  deletedDesigners,
  stats
}: DesignersClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const getFilteredDesigners = () => {
    const allDesigners = [...designers, ...deletedDesigners.map(d => ({ ...d, isDeleted: true }))];

    switch (activeFilter) {
      case "approved":
        return allDesigners.filter((d) => d.isApproved && !d.isDeleted);
      case "pending":
        return allDesigners.filter((d) => !d.isApproved && !d.isDeleted);
      case "visible":
        return allDesigners.filter((d) => d.isVisible && !d.isDeleted);
      case "hidden":
        return allDesigners.filter((d) => !d.isVisible && !d.isDeleted);
      case "deleted":
        return allDesigners.filter((d) => d.isDeleted);
      case "all":
      default:
        return allDesigners;
    }
  };

  const filteredDesigners = getFilteredDesigners();
  const filters = [
    { id: "all", label: "All", count: stats.total, color: "slate" },
    { id: "approved", label: "Approved", count: stats.approved, color: "emerald" },
    { id: "pending", label: "Pending", count: stats.pending, color: "amber" },
    { id: "visible", label: "Visible", count: stats.visible, color: "sky" },
    { id: "hidden", label: "Hidden", count: stats.hidden, color: "slate" },
    { id: "deleted", label: "Deleted", count: stats.deleted, color: "rose" }
  ];

  const getFilterStyles = (filter: any, isActive: boolean) => {
    const baseStyles =
      "cursor-pointer transition-all rounded-full px-4 py-2 text-sm font-semibold border";
    if (isActive) {
      const colorMap: { [key: string]: string } = {
        slate: "bg-slate-900 text-white border-slate-900",
        emerald: "bg-emerald-50 text-emerald-900 border-emerald-300",
        amber: "bg-amber-50 text-amber-900 border-amber-300",
        sky: "bg-sky-50 text-sky-900 border-sky-300",
        rose: "bg-rose-50 text-rose-900 border-rose-300"
      };
      return `${baseStyles} ${colorMap[filter.color]} shadow-md`;
    }
    return `${baseStyles} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300`;
  };

  const [modalDesigner, setModalDesigner] = useState<any | null>(null);
  return (
    <>
      <DesignerProfileModal designer={modalDesigner} open={!!modalDesigner} onClose={() => setModalDesigner(null)} />
      <div className="flex flex-wrap gap-3 mb-6">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as FilterType)}
            className={getFilterStyles(filter, activeFilter === filter.id)}
          >
            {filter.label}: <span className="font-bold ml-1">{filter.count}</span>
          </button>
        ))}
      </div>

      {filteredDesigners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">
            {activeFilter === "deleted" && "No deleted designers."}
            {activeFilter === "approved" && "No approved designers yet."}
            {activeFilter === "pending" && "No pending designers yet."}
            {activeFilter === "visible" && "No visible designers yet."}
            {activeFilter === "hidden" && "No hidden designers."}
            {activeFilter === "all" && "No active designers."}
          </p>
        </div>
      ) : (
        <div className="grid auto-fit grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
          {filteredDesigners.map((designer: any) => (
            <div
              key={designer.id}
              className={`rounded-2xl p-6 shadow-sm border transition-all ${
                designer.isDeleted
                  ? "bg-rose-50 border-rose-200 opacity-50"
                  : "bg-white border-slate-100 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between md:gap-3">
                <div
                  className="flex items-start gap-2 md:gap-3 flex-1 cursor-pointer group"
                  onClick={() => setModalDesigner(designer)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Show profile for ${designer.brandName}`}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setModalDesigner(designer); }}
                >
                  {designer.brandLogo ? (
                    <img
                      src={designer.brandLogo}
                      alt={`${designer.brandName} logo`}
                      className="h-12 w-12 object-cover rounded-lg border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                      {designer.brandName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base md:text-lg text-slate-900">
                      {designer.brandName}
                    </h3>
                    <p className="text-slate-500 text-sm">{designer.user.email}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs -ml-2 md:ml-0 font-semibold ${
                    designer.isDeleted
                      ? "bg-rose-100 text-rose-700 border border-rose-300"
                      : designer.isApproved
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {designer.isDeleted
                    ? "Deleted"
                    : designer.isApproved
                    ? "Approved"
                    : "Pending"}
                </span>
              </div>

              <p className="text-slate-600 text-sm mt-3">
                {designer.bio
                  ? `${designer.bio.substring(0, 80)}${
                      designer.bio.length > 80 ? "..." : ""
                    }`
                  : "No bio provided."}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {designer.products.length} product
                  {designer.products.length !== 1 ? "s" : ""}
                </span>
                {!designer.isDeleted && (
                  <span
                    className={`rounded-full px-3 py-1 ${
                      designer.isVisible
                        ? "bg-sky-50 text-sky-700 border border-sky-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {designer.isVisible ? "Visible" : "Hidden"}
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2">
                {designer.products.length > 0 && (
                  <Link
                    href={`/admin/designers/${designer.id}/products`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Products ({designer.products.length})
                  </Link>
                )}
                <DesignerActions designer={designer} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
