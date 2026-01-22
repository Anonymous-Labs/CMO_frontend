"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api";

interface User {
  email: string;
  id: number;
  full_name?: string | null;
}

interface Business {
  id: number;
  user_id: number;
  name: string;
  industry?: string | null;
  description?: string | null;
  website?: string | null;
  location?: string | null;
  target_audience?: string | null;
  brand_tone?: string | null;
  primary_products?: string | null;
}

interface InstagramAccount {
  id: string;
  username: string;
  account_type: string;
  connected_at: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Partial<Business>>({});
  const [businessSaved, setBusinessSaved] = useState(false);
  const [instagramAccount, setInstagramAccount] = useState<InstagramAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"business" | "instagram">("business");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const bootstrap = async () => {
      try {
        setError("");
        // Validate token + load user
        const me = await apiClient.get("/api/v1/users/me");
        setUser(me);

        // Load business if present
        try {
          const biz = await apiClient.get("/api/v1/business/me");
          setBusiness(biz);
          setBusinessSaved(true);
        } catch (e) {
          // Business not set up yet, that's fine
        }

        // Check Instagram status
        try {
          const instagramData = await apiClient.get("/api/v1/instagram/status");
          setInstagramAccount(instagramData);
        } catch (e) {
          // Instagram not connected yet, that's fine
        }
      } catch (e) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const saveBusiness = async () => {
    setError("");

    if (!business.name || business.name.trim().length === 0) {
      setError("Business name is required.");
      return;
    }

    try {
      const saved = await apiClient.post("/api/v1/business/me", {
        name: business.name,
        industry: business.industry || null,
        description: business.description || null,
        website: business.website || null,
        location: business.location || null,
        target_audience: business.target_audience || null,
        brand_tone: business.brand_tone || null,
        primary_products: business.primary_products || null,
      });
      setBusiness(saved);
      setBusinessSaved(true);
      setError("Business profile saved successfully!");
      setTimeout(() => setError(""), 3000);
    } catch (e) {
      setError("Failed to save business profile.");
    }
  };

  const connectInstagram = async () => {
    try {
      const data = await apiClient.get("/api/v1/instagram/oauth/url");
      window.location.href = data.authorization_url;
    } catch (e) {
      setError("Failed to initiate Instagram connection.");
    }
  };

  const disconnectInstagram = async () => {
    try {
      await apiClient.delete("/api/v1/instagram/disconnect");
      setInstagramAccount(null);
      setError("Instagram account disconnected successfully!");
      setTimeout(() => setError(""), 3000);
    } catch (e) {
      setError("Failed to disconnect Instagram account.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your business information and social media connections
        </p>
      </div>

      {error && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
          error.includes("successfully")
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("business")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "business"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Business Information
            </button>
            <button
              onClick={() => setActiveTab("instagram")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "instagram"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Instagram Connection
            </button>
          </nav>
        </div>
      </div>

      {/* Business Information Tab */}
      {activeTab === "business" && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Profile</h2>
            <p className="text-gray-600">
              This information helps our AI create content tailored to your business.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Business Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={business.name || ""}
                onChange={(e) => setBusiness((b) => ({ ...b, name: e.target.value }))}
                placeholder="e.g., Arjun's Coffee Roasters"
              />
            </div>

            {/* Industry and Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={business.industry || ""}
                onChange={(e) => setBusiness((b) => ({ ...b, industry: e.target.value }))}
                placeholder="e.g., Food & Beverage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={business.website || ""}
                onChange={(e) => setBusiness((b) => ({ ...b, website: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            {/* Location and Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={business.location || ""}
                onChange={(e) => setBusiness((b) => ({ ...b, location: e.target.value }))}
                placeholder="City, Country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={business.target_audience || ""}
                onChange={(e) => setBusiness((b) => ({ ...b, target_audience: e.target.value }))}
                placeholder="e.g., Students & young professionals"
              />
            </div>

            {/* Brand Tone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Tone</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={business.brand_tone || ""}
                onChange={(e) => setBusiness((b) => ({ ...b, brand_tone: e.target.value }))}
                placeholder="e.g., Friendly, premium, minimal"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
                value={business.description || ""}
                onChange={(e) => setBusiness((b) => ({ ...b, description: e.target.value }))}
                placeholder="What do you sell? What makes you unique?"
              />
            </div>

            {/* Primary Products */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Products/Services</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                value={business.primary_products || ""}
                onChange={(e) => setBusiness((b) => ({ ...b, primary_products: e.target.value }))}
                placeholder="List your main products or services (comma separated)"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={saveBusiness}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              {businessSaved ? "Update Business Profile" : "Save Business Profile"}
            </button>
          </div>
        </div>
      )}

      {/* Instagram Connection Tab */}
      {activeTab === "instagram" && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Instagram Business Account</h2>
            <p className="text-gray-600">
              Connect your Instagram Business account to post content directly from our platform.
            </p>
          </div>

          {instagramAccount ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-green-800">Instagram Connected</h3>
                  <p className="text-green-600">@{instagramAccount.username}</p>
                </div>
              </div>
              <p className="text-green-700 mb-4">
                Account Type: {instagramAccount.account_type} • Connected: {new Date(instagramAccount.connected_at).toLocaleDateString()}
              </p>
              <button
                onClick={disconnectInstagram}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Disconnect Instagram
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Instagram Not Connected</h3>
                  <p className="text-gray-600">Connect your Instagram Business account</p>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Instagram Business account</li>
                  <li>• Connected Facebook Page</li>
                  <li>• Admin access to the Facebook Page</li>
                </ul>
              </div>
              <button
                onClick={connectInstagram}
                className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors font-medium flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Connect Instagram
              </button>
            </div>
          )}
        </div>
      )}

      {/* Account Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-2">Account Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email:</strong> {user?.email}</p>
              {user?.full_name && <p><strong>Name:</strong> {user?.full_name}</p>}
              <p><strong>User ID:</strong> {user?.id}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
