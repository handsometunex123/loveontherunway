"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  brandName: string;
  bio: string;
};

export default function ProfileForm({ initialProfile }: { initialProfile: ProfileData }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState(initialProfile.name);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [brandName, setBrandName] = useState(initialProfile.brandName);
  const [bio, setBio] = useState(initialProfile.bio);
  const [loading, setLoading] = useState(false);

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
          bio: bio.trim()
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
        <label className="block text-sm font-semibold text-slate-900 mb-2">Bio</label>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-sm text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Update Profile"}
      </button>
    </form>
  );
}
