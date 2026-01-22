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

  const uploadAssets = async () => {
    setError("");

    if (assets.length === 0) {
      setError("Please select at least one photo.");
      return;
    }

    setAssetsUploading(true);
    try {
      const form = new FormData();
      for (const f of assets) form.append("files", f);

      await apiClient.upload("/api/v1/business/me/assets", form);
      setError("Photos uploaded successfully!");
      setAssets([]);
      setTimeout(() => setError(""), 3000);
    } catch (e) {
      setError("Upload failed.");
    } finally {
      setAssetsUploading(false);
    }
  };

  const generateContent = async () => {
    setError("");
    setGenerated(null);

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

  const saveToDrafts = async () => {
    if (!generated) return;

    try {
      await apiClient.post("/api/v1/drafts", {
        title: generated.title,
        content: generated.caption,
        hashtags: generated.hashtags,
        generation_prompt: generated.generation_prompt,
        mode: generated.mode,
        provider: generated.provider,
        notes: generated.notes,
      });
      setError("Content saved to drafts successfully!");
      setTimeout(() => setError(""), 3000);
    } catch (e) {
      setError("Failed to save to drafts.");
    }
  };

  const saveToPosts = async () => {
    if (!generated) return;

    try {
      await apiClient.post("/api/v1/posts", {
        title: generated.title,
        content: generated.caption,
        hashtags: generated.hashtags,
        generation_prompt: generated.generation_prompt,
        mode: generated.mode,
        provider: generated.provider,
        notes: generated.notes,
      });
      setError("Content saved to posts successfully!");
      setTimeout(() => setError(""), 3000);
    } catch (e) {
      setError("Failed to save to posts.");
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
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
          error.includes("successfully")
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Photos Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Photos</h2>
            <p className="text-gray-600">
              Upload product photos or reference images to enhance your content generation.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Upload photos
                  </span>
                </label>
                <input
                  id="photo-upload"
                  name="photo-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/*"
                  onChange={(e) => setAssets(Array.from(e.target.files || []))}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>

            {assets.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">{assets.length}</span> file{assets.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setAssets([])}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Clear
                  </button>
                </div>
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {assets.map((file, index) => (
                    <div key={index} className="text-xs text-gray-600 py-1">
                      {file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              disabled={assetsUploading || assets.length === 0}
              onClick={uploadAssets}
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {assetsUploading ? "Uploading..." : "Upload Photos"}
            </button>
          </div>
        </div>

        {/* Content Generation Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Generate Social Content</h2>
            <p className="text-gray-600">
              Describe what you want to create and let AI generate engaging social media content.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
              >
                <option value="image">Image Post</option>
                <option value="video">Video Post</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Prompt</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={8}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`e.g., "Create a bold Instagram post announcing our new winter blend with a warm cozy vibe. Highlight the rich aroma and perfect for holiday gatherings."`}
              />
            </div>

            <button
              onClick={generateContent}
              disabled={!prompt.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Generate Content
            </button>
          </div>

          {generated && (
            <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">{generated.provider}</span> • {generated.mode} post
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveToDrafts}
                    className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={saveToPosts}
                    className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors"
                  >
                    Save Post
                  </button>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-3">{generated.title}</h4>
              <div className="text-gray-800 whitespace-pre-wrap mb-4 leading-relaxed">{generated.caption}</div>
              <div className="text-indigo-700 font-medium mb-4">{generated.hashtags}</div>

              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                  View generation details
                </summary>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="font-semibold mb-1">AI Prompt Used:</div>
                  <div className="whitespace-pre-wrap text-gray-700 bg-white p-2 rounded border">
                    {generated.generation_prompt}
                  </div>
                  {generated.notes && (
                    <div className="mt-2 text-gray-500">{generated.notes}</div>
                  )}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
