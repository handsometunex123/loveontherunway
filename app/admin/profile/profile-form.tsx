"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { ButtonLoader } from "@/components/Loader";

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
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState(initialProfile.name);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [brandName, setBrandName] = useState(initialProfile.brandName);
  const [bio, setBio] = useState(initialProfile.bio);
  const [brandLogo, setBrandLogo] = useState(initialProfile.brandLogo || "");
  const [website, setWebsite] = useState(initialProfile.website || "");
  const [instagram, setInstagram] = useState(initialProfile.instagram || "");
  const [twitter, setTwitter] = useState(initialProfile.twitter || "");
  const [tiktok, setTiktok] = useState(initialProfile.tiktok || "");
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Logo must be under 2MB", "error");
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-logo", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Failed to upload logo", "error");
        return;
      }

      setBrandLogo(data.url);
      showToast("Logo uploaded successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to upload logo", "error");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
        showToast(data.error || "Unable to update profile", "error");
        return;
      }

      showToast("Profile updated successfully", "success");
      router.refresh();
    } catch (err) {
      showToast("An error occurred while updating your profile", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Personal Details</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Email</label>
            <input
              type="email"
              value={initialProfile.email}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
              placeholder="e.g. 08012345678"
              required
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Brand Profile</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Brand Name</label>
            <input
              type="text"
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Brand Logo</label>
            <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="h-20 w-20 rounded-2xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                  {brandLogo ? (
                    <img
                      src={brandLogo}
                      alt="Brand Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No logo</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="brand-logo"
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white cursor-pointer hover:bg-slate-800"
                    >
                      {uploadingLogo ? "Uploading..." : brandLogo ? "Replace logo" : "Upload logo"}
                    </label>
                    <input
                      id="brand-logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="sr-only"
                    />
                    {brandLogo && (
                      <button
                        type="button"
                        onClick={() => setBrandLogo("")}
                        className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 hover:bg-white"
                      >
                        Remove logo
                      </button>
                    )}
                    {uploadingLogo && <ButtonLoader />}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Max 2MB. Recommended 200x200px. PNG or JPG.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 resize-none"
              required
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Social Media & Links</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Personal Website</label>
            <input
              type="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Instagram Handle</label>
            <input
              type="text"
              value={instagram}
              onChange={(event) => setInstagram(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
              placeholder="@yourhandle"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Twitter/X Handle</label>
            <input
              type="text"
              value={twitter}
              onChange={(event) => setTwitter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
              placeholder="@yourhandle"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">TikTok Handle</label>
            <input
              type="text"
              value={tiktok}
              onChange={(event) => setTiktok(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
              placeholder="@yourhandle"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-sm text-white hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
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
