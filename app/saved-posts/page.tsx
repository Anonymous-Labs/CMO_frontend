"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api";

interface User {
  email: string;
  id: number;
  full_name?: string | null;
}

interface SavedPost {
  id: number;
  title: string;
  caption: string;
  hashtags: string;
  mode: "image" | "video";
  status: "draft" | "scheduled" | "published";
  scheduled_for?: string;
  published_at?: string;
  created_at: string;
  user_id: number;
  platforms?: string[];
}

export default function SavedPosts() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<SavedPost[]>([]);
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

        // Load saved posts
        const postsData = await apiClient.get("/api/v1/posts");
        setPosts(postsData);
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

  const deletePost = async (postId: number) => {
    try {
      await apiClient.delete(`/api/v1/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (e) {
      setError("Failed to delete post.");
    }
  };

  const publishToInstagram = async (post: SavedPost) => {
    try {
      await apiClient.post("/api/v1/instagram/publish", {
        post_id: post.id,
        caption: post.caption,
        hashtags: post.hashtags,
      });

      // Update post status
      setPosts(posts.map(p =>
        p.id === post.id
          ? { ...p, status: "published" as const, published_at: new Date().toISOString() }
          : p
      ));
      alert("Post published to Instagram!");
    } catch (e) {
      setError("Failed to publish to Instagram.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "scheduled": return "bg-yellow-100 text-yellow-800";
      case "published": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Posts</h1>
        <p className="text-gray-600">
          Manage your saved social media posts and publish them
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No saved posts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Save some content from the library to see posts here.
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
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => (
              <li key={post.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.mode === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {post.mode}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {post.caption}
                    </div>

                    <div className="mt-1 text-sm text-indigo-600">
                      {post.hashtags}
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Created: {new Date(post.created_at).toLocaleDateString()}
                      {post.published_at && ` • Published: ${new Date(post.published_at).toLocaleDateString()}`}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    {post.status !== "published" && (
                      <button
                        onClick={() => publishToInstagram(post)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Publish
                      </button>
                    )}

                    <button
                      onClick={() => deletePost(post.id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
