"use client";

import { useState } from "react";
import Cookies from "js-cookie";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export default function UpdateProfilePage() {
  const [formData, setFormData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`, // Assuming you use js-cookie
        },
        body: JSON.stringify({
          email: formData.email,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12 text-white">
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_80%_0,rgba(124,58,237,0.2),transparent_28%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.06),transparent_32%)]" />
      <form
        onSubmit={handleSubmit}
        className="relative bg-surface-elevated/80 p-8 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-md border border-white/10"
      >
        {/* Title */}
        <h2 className="text-3xl font-bold mb-8 text-center text-brand-200 tracking-wide">
          Update Profile
        </h2>

        {/* Email */}
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full mb-4 p-3 bg-transparent border border-brand-400/40 text-white placeholder-brand-200/50 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />

        {/* Old Password */}
        <input
          type="password"
          name="oldPassword"
          value={formData.oldPassword}
          onChange={handleChange}
          placeholder="Old Password"
          className="w-full mb-4 p-3 bg-transparent border border-brand-400/40 text-white placeholder-brand-200/50 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />

        {/* New Password */}
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="New Password"
          className="w-full mb-4 p-3 bg-transparent border border-brand-400/40 text-white placeholder-brand-200/50 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />

        {/* Confirm Password */}
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          className="w-full mb-8 p-3 bg-transparent border border-brand-400/40 text-white placeholder-brand-200/50 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-brand-500 hover:bg-brand-400 text-white py-3 rounded-xl font-semibold
                 shadow-lg hover:shadow-brand-500/30 transition-all active:scale-[0.97]"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}
