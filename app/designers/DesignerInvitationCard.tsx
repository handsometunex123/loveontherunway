"use client";

import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { ButtonLoader } from "@/components/Loader";
import { useToast } from "@/context/ToastContext";

interface DesignerInvitationCardProps {
  designerId: string;
  brandName: string;
  brandLogo?: string;
  bio?: string;
}

export default function DesignerInvitationCard({
  designerId,
  brandName,
  brandLogo,
  bio
}: DesignerInvitationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { showToast } = useToast();

  const designerUrl = `${typeof window !== "undefined" ? window.location.origin : "https://loveontherunway.com"}/designers/${designerId}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setDownloading(true);
    try {
      // Wait for all images to load
      const images = cardRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise<void>((resolve) => {
              if ((img as HTMLImageElement).complete) {
                resolve();
              } else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }
            })
        )
      );

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 5000
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${brandName.replace(/\s+/g, "-").toLowerCase()}-invitation-card.png`;
      link.click();
    } catch (err) {
      console.error("Failed to download card:", err);
      showToast("Failed to download invitation card", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-white rounded-2xl p-6 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-black rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Share Your Brand</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Download your personalized invitation card featuring your brand logo. Share it on social media to drive traffic to your designer page with an embedded QR code.
            </p>
          </div>
        </div>
      </div>

      {/* Card Preview */}
      <div className="relative">
        {/* Decorative Background Elements */}
        <div className="absolute -inset-4 bg-gradient-to-br from-purple-100 via-rose-100 to-orange-100 rounded-3xl blur-2xl opacity-30 -z-10"></div>
        
        <div
          ref={cardRef}
          className="w-full relative rounded-3xl overflow-hidden bg-white shadow-2xl border-4 border-white mx-auto"
        >
          {/* Background Image - Full Coverage */}
          <img
            src="/designer.png"
            alt="Love on the Runway Background"
            className="w-full h-auto object-contain block"
          />

          {/* Overlay Container - Positioned absolutely over image */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10"></div>

          {/* Content Layer */}
          <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-12">
            {/* Designer Logo */}
            {brandLogo && (
              <img
                src={brandLogo}
                alt={brandName}
                className="h-40 w-40 sm:h-64 sm:w-64 lg:h-80 lg:w-80 object-contain"
              />
            )}

            {/* "Scan QR Code" with Curvy Arrow */}
            <div className="absolute top-3 right-4 sm:top-5 sm:right-12 flex flex-col items-center gap-1">
              {/* Text */}
              <div>
                <p className="text-white font-bold text-xs sm:text-sm drop-shadow-lg whitespace-nowrap">Scan QR Code</p>
              </div>
              
              {/* SVG Curvy Arrow pointing down-right to QR */}
              <svg
                className="w-10 h-10 sm:w-16 sm:h-16 text-white drop-shadow-lg"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Curved arrow line */}
                <path
                  d="M50 15 Q70 35 68 60"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Large arrow head */}
                <path
                  d="M68 60 L56 52 L64 72 Z"
                  fill="currentColor"
                />
                {/* Circle highlight at arrow tip */}
                <circle cx="68" cy="60" r="6" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>

            {/* QR Code - Top Right Corner */}
            <div className="absolute top-14 right-3 sm:top-[5.5rem] sm:right-6 bg-white rounded-xl p-1.5 sm:p-2 shadow-xl ring-3 ring-white/70 scale-[0.85] sm:scale-100 origin-top-right">
              <QRCodeCanvas
                value={designerUrl}
                size={80}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="flex flex-col gap-4">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-700 to-purple-900 text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
        >
          {downloading ? (
            <>
              <ButtonLoader />
              <span>Generating your card...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Invitation Card</span>
            </>
          )}
        </button>

        {/* Social Share Tips */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-900 mb-1">Pro Tip</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post this card on Instagram Stories, TikTok, Twitter, and Facebook. Your followers can scan the QR code directly from their feed to visit your designer page!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
