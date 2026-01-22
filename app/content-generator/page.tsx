"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api";

type Mode = "image" | "video";

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

interface GeneratedContent {
  mode: Mode;
  provider: string;
  title: string;
  caption: string;
  hashtags: string;
  generation_prompt: string;
  notes?: string | null;
}

export default function ContentGenerator() {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Partial<Business>>({});
  const [businessSaved, setBusinessSaved] = useState(false);
  const [assets, setAssets] = useState<File[]>([]);
  const [assetsUploading, setAssetsUploading] = useState(false);
  const [mode, setMode] = useState<Mode>("image");
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
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
      } catch (e) {
        setError("Failed to load content generator. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  const saveBusiness = async () => {
    setError("");
    setGenerated(null);

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
    } catch (e) {
      setError("Failed to save business profile.");
    }
  };

  const uploadAssets = async () => {
    setError("");

    if (!businessSaved) {
      setError("Save your business profile first.");
      return;
    }
    if (assets.length === 0) {
      setError("Please select at least one product photo.");
      return;
    }

    setAssetsUploading(true);
    try {
      const form = new FormData();
      for (const f of assets) form.append("files", f);

      await apiClient.upload("/api/v1/business/me/assets", form);
      // We’re not rendering the assets yet; just clear selection on success
      setAssets([]);
    } catch (e) {
      setError("Upload failed.");
    } finally {
      setAssetsUploading(false);
    }
  };

  const generateContent = async () => {
    setError("");
    setGenerated(null);

    if (!businessSaved) {
      setError("Save your business profile first.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    try {
      const data = await apiClient.post("/api/v1/content/generate", { mode, prompt });
      setGenerated(data);
    } catch (e) {
      setError("Failed to generate content.");
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
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Generator</h1>
        <p className="text-gray-600">
          Create stunning social media content in minutes with AI
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Step 1: Business Info */}
          <section className="border border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-3">1) Business Info</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={business.name || ""}
                  onChange={(e) => setBusiness((b) => ({ ...b, name: e.target.value }))}
                  placeholder="e.g., Arjun's Coffee Roasters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={business.industry || ""}
                  onChange={(e) => setBusiness((b) => ({ ...b, industry: e.target.value }))}
                  placeholder="e.g., Food & Beverage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  value={business.description || ""}
                  onChange={(e) => setBusiness((b) => ({ ...b, description: e.target.value }))}
                  placeholder="What do you sell? What makes you unique?"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={business.website || ""}
                    onChange={(e) => setBusiness((b) => ({ ...b, website: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={business.location || ""}
                    onChange={(e) => setBusiness((b) => ({ ...b, location: e.target.value }))}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={business.target_audience || ""}
                  onChange={(e) => setBusiness((b) => ({ ...b, target_audience: e.target.value }))}
                  placeholder="e.g., Students & young professionals"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Tone</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={business.brand_tone || ""}
                  onChange={(e) => setBusiness((b) => ({ ...b, brand_tone: e.target.value }))}
                  placeholder="e.g., Friendly, premium, minimal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Products</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  value={business.primary_products || ""}
                  onChange={(e) => setBusiness((b) => ({ ...b, primary_products: e.target.value }))}
                  placeholder="List products/services (comma separated is fine)"
                />
              </div>
              <button
                onClick={saveBusiness}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                {businessSaved ? "Update Business Profile" : "Save Business Profile"}
              </button>
              {businessSaved && (
                <p className="text-xs text-green-700">Saved ✓</p>
              )}
            </div>
          </section>

          {/* Step 2: Product Photos */}
          <section className="border border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-3">2) Product Photos (optional)</h3>
            <p className="text-sm text-gray-600 mb-3">
              Upload product photos if you have them. We'll use them later when we connect real image/video generation.
            </p>
            <div className="space-y-3">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setAssets(Array.from(e.target.files || []))}
              />
              {assets.length > 0 && (
                <div className="text-sm text-gray-700">
                  Selected: <span className="font-medium">{assets.length}</span> file(s)
                </div>
              )}
              <button
                disabled={assetsUploading}
                onClick={uploadAssets}
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {assetsUploading ? "Uploading..." : "Upload Photos"}
              </button>
            </div>
          </section>

          {/* Step 3: Generate */}
          <section className="border border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-3">3) Generate Social Content</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Mode)}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Prompt</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={6}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='e.g., "Create a bold Instagram post announcing our new winter blend with a warm cozy vibe."'
                />
              </div>

              <button
                onClick={generateContent}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Generate
              </button>

              {generated && (
                <div className="mt-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-2">
                    Provider: <span className="font-medium">{generated.provider}</span> • Mode:{" "}
                    <span className="font-medium">{generated.mode}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{generated.title}</h4>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap mb-3">{generated.caption}</div>
                  <div className="text-sm text-indigo-700 mb-3">{generated.hashtags}</div>
                  <div className="text-xs text-gray-700">
                    <div className="font-semibold mb-1">Generation prompt (for image/video model):</div>
                    <div className="whitespace-pre-wrap">{generated.generation_prompt}</div>
                  </div>
                  {generated.notes && (
                    <div className="text-xs text-gray-500 mt-3">{generated.notes}</div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
