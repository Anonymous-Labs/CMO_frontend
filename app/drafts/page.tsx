"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api";

interface User {
  email: string;
  id: number;
  full_name?: string | null;
}

interface Draft {
  id: number;
  title: string;
  caption: string;
  hashtags: string;
  mode: "image" | "video";
  original_content_id?: number;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export default function Drafts() {
  const [user, setUser] = useState<User | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
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

        // Load drafts
        const draftsData = await apiClient.get("/api/v1/drafts");
        setDrafts(draftsData);
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

  const deleteDraft = async (draftId: number) => {
    try {
      await apiClient.delete(`/api/v1/drafts/${draftId}`);
      setDrafts(drafts.filter(d => d.id !== draftId));
    } catch (e) {
      setError("Failed to delete draft.");
    }
  };

  const saveDraft = async (draft: Draft) => {
    try {
      const updatedDraft = await apiClient.put(`/api/v1/drafts/${draft.id}`, {
        title: draft.title,
        caption: draft.caption,
        hashtags: draft.hashtags,
      });
      setDrafts(drafts.map(d => d.id === draft.id ? updatedDraft : d));
      setEditingDraft(null);
    } catch (e) {
      setError("Failed to save draft.");
    }
  };

  const publishDraft = async (draft: Draft) => {
    try {
      await apiClient.post("/api/v1/posts", {
        title: draft.title,
        caption: draft.caption,
        hashtags: draft.hashtags,
        mode: draft.mode,
        draft_id: draft.id,
      });

      // Remove from drafts and add to saved posts
      setDrafts(drafts.filter(d => d.id !== draft.id));
      alert("Draft published to saved posts!");
    } catch (e) {
      setError("Failed to publish draft.");
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Drafts</h1>
        <p className="text-gray-600">
          Edit and refine your draft content before publishing
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No drafts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Save content from the library to create drafts.
          </p>
          <div className="mt-6">
            <a
              href="/content-library"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse Content Library
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {drafts.map((draft) => (
            <div key={draft.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                {editingDraft?.id === draft.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={editingDraft.title}
                        onChange={(e) => setEditingDraft({ ...editingDraft, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                      <textarea
                        value={editingDraft.caption}
                        onChange={(e) => setEditingDraft({ ...editingDraft, caption: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                      <input
                        type="text"
                        value={editingDraft.hashtags}
                        onChange={(e) => setEditingDraft({ ...editingDraft, hashtags: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveDraft(editingDraft)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingDraft(null)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{draft.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          draft.mode === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {draft.mode}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingDraft(draft)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => publishDraft(draft)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => deleteDraft(draft.id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      {draft.caption}
                    </div>

                    <div className="text-sm text-indigo-600 mb-3">
                      {draft.hashtags}
                    </div>

                    <div className="text-xs text-gray-500">
                      Created: {new Date(draft.created_at).toLocaleDateString()}
                      {draft.updated_at !== draft.created_at && ` • Updated: ${new Date(draft.updated_at).toLocaleDateString()}`}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
