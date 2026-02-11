"use client";

import { useState } from "react";
import { ButtonLoader } from "@/components/Loader";
import imageCompression from "browser-image-compression";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  brandName: string;
  bio: string;
  brandLogo?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
};

export default function ProfileForm({ initialProfile }: { initialProfile: ProfileData }) {
  const [name, setName] = useState(initialProfile.name);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [brandName, setBrandName] = useState(initialProfile.brandName);
  const [bio, setBio] = useState(initialProfile.bio);
  const [brandLogo, setBrandLogo] = useState(initialProfile.brandLogo || "");
  const [website, setWebsite] = useState(initialProfile.website || "");
  const [instagram, setInstagram] = useState(initialProfile.instagram || "");
  const [twitter, setTwitter] = useState(initialProfile.twitter || "");
  const [tiktok, setTiktok] = useState(initialProfile.tiktok || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);

    try {
      const compressionOptions = {
        maxSizeMB: 1.8,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };

      let compressedFile: File;

      try {
        const compressed = await imageCompression(file, compressionOptions);
        compressedFile = new File([compressed], file.name, { type: compressed.type });
      } catch (compressionError) {
        console.error("Logo compression error:", compressionError);
        setError("Failed to compress logo");
        return;
      }

      if (compressedFile.size > 2 * 1024 * 1024) {
        setError("Logo must be under 2MB");
        return;
      }

      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", "lotr_logos");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setBrandLogo(data.secure_url);
      setError(null);
    } catch (err) {
      console.error(err);
      if (!error) {
        setError("Failed to upload logo");
      }
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim(),
          brandName: brandName.trim(),
          bio: bio.trim(),
          brandLogo: brandLogo || undefined,
          website: website.trim() || undefined,
          instagram: instagram.trim() || undefined,
          twitter: twitter.trim() || undefined,
          tiktok: tiktok.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to update profile");
        return;
      }

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Name</label>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Email</label>
        <input
          type="email"
          value={initialProfile.email}
          disabled
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="e.g. 08012345678"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Brand Name</label>
        <input
          type="text"
          value={brandName}
          onChange={(event) => setBrandName(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Brand Logo</label>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="w-full text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Max 2MB. Recommended: 200x200px</p>
          </div>
          {uploadingLogo && <ButtonLoader />}
        </div>
        {brandLogo && (
          <div className="mt-3">
            <img src={brandLogo} alt="Brand Logo" className="h-20 w-20 object-cover rounded-lg border border-slate-300" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Bio</label>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          required
        />
      </div>

      <hr className="my-2" />

      <h3 className="text-sm font-semibold text-slate-900">Social Media & Links (Optional)</h3>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Personal Website</label>
        <input
          type="url"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Instagram Handle</label>
        <input
          type="text"
          value={instagram}
          onChange={(event) => setInstagram(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="@yourhandle"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Twitter/X Handle</label>
        <input
          type="text"
          value={twitter}
          onChange={(event) => setTwitter(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="@yourhandle"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">TikTok Handle</label>
        <input
          type="text"
          value={tiktok}
          onChange={(event) => setTiktok(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="@yourhandle"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm text-emerald-700 font-semibold">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-sm text-white hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <ButtonLoader color="white" /> Saving...
          </>
        ) : (
          "Update Profile"
        )}
      </button>
    </form>
  );
}
