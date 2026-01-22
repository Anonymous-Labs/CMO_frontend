"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api";

interface User {
  email: string;
  id: number;
  full_name?: string | null;
}

interface InstagramAccount {
  id: string;
  username: string;
  account_type: string;
  connected_at: string;
}

export default function InstagramConnection() {
  const [user, setUser] = useState<User | null>(null);
  const [instagramAccount, setInstagramAccount] = useState<InstagramAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error_param = urlParams.get('error');

    const bootstrap = async () => {
      try {
        setError("");
        // Validate token + load user
        const me = await apiClient.get("/api/v1/users/me");
        setUser(me);

        // Check if Instagram is already connected
        try {
          const instagramData = await apiClient.get("/api/v1/instagram/status");
          setInstagramAccount(instagramData);
        } catch (e) {
          // Instagram not connected yet, that's fine
        }

        // Handle OAuth callback if present
        if (code) {
          await handleOAuthCallback(code, token);
        } else if (error_param) {
          setError("Instagram connection failed. Please try again.");
        }
      } catch (e) {
        setError("Failed to load Instagram connection. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  const handleOAuthCallback = async (code: string, token: string) => {
    try {
      const accountData = await apiClient.post("/api/v1/instagram/oauth/callback", { code });
      setInstagramAccount(accountData);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      setError("Failed to connect Instagram account.");
    }
  };

  const connectInstagram = async () => {
    setConnecting(true);
    setError("");

    try {
      const data = await apiClient.get("/api/v1/instagram/oauth/url");
      window.location.href = data.authorization_url;
    } catch (e) {
      setError("Failed to initiate Instagram connection.");
    } finally {
      setConnecting(false);
    }
  };

  const disconnectInstagram = async () => {
    try {
      await apiClient.delete("/api/v1/instagram/disconnect");
      setInstagramAccount(null);
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
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Instagram Connection</h1>
        <p className="text-gray-600">
          Connect your Instagram Business account to post content directly
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-8">
        {instagramAccount ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Instagram Connected</h3>
            <p className="text-gray-600 mb-4">
              Connected to <span className="font-medium">@{instagramAccount.username}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Account Type: {instagramAccount.account_type} • Connected: {new Date(instagramAccount.connected_at).toLocaleDateString()}
            </p>
            <button
              onClick={disconnectInstagram}
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Disconnect Instagram
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-pink-100 mb-4">
              <svg className="h-8 w-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Instagram</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your Instagram Business account to automatically post your generated content.
              Make sure you have an Instagram Business account connected to a Facebook Page.
            </p>
            <button
              onClick={connectInstagram}
              disabled={connecting}
              className="bg-pink-600 text-white px-8 py-3 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {connecting ? "Connecting..." : "Connect Instagram"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
