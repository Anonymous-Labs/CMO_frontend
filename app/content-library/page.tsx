"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api";

interface User {
  email: string;
  id: number;
  full_name?: string | null;
}

interface GeneratedContent {
  id: number;
  mode: "image" | "video";
  provider: string;
  title: string;
  caption: string;
  hashtags: string;
  generation_prompt: string;
  notes?: string | null;
  created_at: string;
  user_id: number;
}

export default function ContentLibrary() {
  const [user, setUser] = useState<User | null>(null);
  const [contents, setContents] = useState<GeneratedContent[]>([]);
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

        // Load generated content
        const contentData = await apiClient.get("/api/v1/content");
        setContents(contentData);
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

  const deleteContent = async (contentId: number) => {
    try {
      await apiClient.delete(`/api/v1/content/${contentId}`);
      setContents(contents.filter(c => c.id !== contentId));
    } catch (e) {
      setError("Failed to delete content.");
    }
  };

  const saveToDrafts = async (content: GeneratedContent) => {
    try {
      await apiClient.post("/api/v1/drafts", {
        title: content.title,
        caption: content.caption,
        hashtags: content.hashtags,
        mode: content.mode,
        original_content_id: content.id,
      });
      alert("Content saved to drafts!");
    } catch (e) {
      setError("Failed to save to drafts.");
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Library</h1>
        <p className="text-gray-600">
          Browse and manage your generated social media content
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {contents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No content yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate some content first to see it here.
          </p>
          <div className="mt-6">
            <a
              href="/content-generator"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Generate Content
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contents.map((content) => (
            <div key={content.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      content.mode === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {content.mode}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(content.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{content.title}</h3>

                <div className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {content.caption}
                </div>

                <div className="text-sm text-indigo-600 mb-4">
                  {content.hashtags}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => saveToDrafts(content)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Save to Drafts
                  </button>
                  <button
                    onClick={() => deleteContent(content.id)}
                    className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
