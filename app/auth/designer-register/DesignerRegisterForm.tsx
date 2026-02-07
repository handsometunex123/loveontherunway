"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { ButtonLoader } from "@/components/Loader";

export default function DesignerRegisterForm({
  inviteEmail,
  inviteToken
}: {
  inviteEmail: string;
  inviteToken: string;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(inviteEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [brandName, setBrandName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateForm = (): string | null => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!email.trim()) return "Email is required";
    if (!email.includes("@")) return "Please enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!phone.trim()) return "Phone number is required";
    if (phone.trim().length < 7) return "Phone number must be at least 7 digits";
    if (!brandName.trim()) return "Brand name is required";
    if (brandName.trim().length < 2) return "Brand name must be at least 2 characters";
    if (!bio.trim()) return "Bio is required";
    if (bio.trim().length < 10) return "Bio must be at least 10 characters";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/designer-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          brandName: brandName.trim(),
          bio: bio.trim(),
          inviteToken
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Registration failed. Please try again.", "error");
        return;
      }

      // Redirect to login page with success message
      showToast("Registration successful! Please log in.", "success");
      router.push("/login");
    } catch (err) {
      showToast("An error occurred during registration", "error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-3 md:gap-4" onSubmit={handleSubmit}>
      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 md:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          disabled={isLoading}
        />
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 md:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          disabled={true}
          readOnly
        />
        <p className="text-xs text-slate-500 mt-1">This email is locked to your invite.</p>
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password" className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 md:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          disabled={isLoading}
        />
        <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label htmlFor="confirmPassword" className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 md:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          disabled={isLoading}
        />
      </div>

      {/* Phone Input */}
      <div>
        <label htmlFor="phone" className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="e.g. 08012345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 md:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          disabled={isLoading}
        />
      </div>

      {/* Brand Name Input */}
      <div>
        <label htmlFor="brandName" className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
          Brand Name
        </label>
        <input
          id="brandName"
          type="text"
          placeholder="Your fashion brand name"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 md:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          disabled={isLoading}
        />
      </div>

      {/* Bio Input */}
      <div>
        <label htmlFor="bio" className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          placeholder="Tell us about your design style and brand vision..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 md:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-slate-500 mt-1">Minimum 10 characters</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-purple-600 px-4 py-2.5 md:py-3 font-semibold text-sm md:text-base text-white hover:bg-purple-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
      >
        {isLoading && <ButtonLoader size="sm" />}
        {isLoading ? "Creating account..." : "Register as Designer"}
      </button>

      <p className="text-xs text-slate-500 text-center">
        By registering, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  );
}
