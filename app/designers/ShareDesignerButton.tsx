"use client";

import { useState, useEffect } from "react";

export default function ShareDesignerButton({
  designerId,
  designerName
}: {
  designerId: string;
  designerName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const designerUrl = typeof window !== "undefined"
    ? `${window.location.origin}/designers/${designerId}`
    : `https://loveontherunway.com/designers/${designerId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(designerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: designerName,
          text: `Check out ${designerName} on Love on the Runway!`,
          url: designerUrl
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold text-xs sm:text-sm px-3 py-2 whitespace-nowrap"
      >
        {copied ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Link
          </>
        )}
      </button>

      {canShare && (
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-200 text-slate-900 hover:bg-slate-300 transition-colors font-semibold text-xs sm:text-sm px-3 py-2 whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Share
        </button>
      )}
    </div>
  );
}
