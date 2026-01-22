"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api";

interface User {
  email: string;
  id: number;
  full_name?: string | null;
}

interface ImageAsset {
  id: number;
  filename: string;
  url: string;
  size: number;
  uploaded_at: string;
  user_id: number;
}

export default function Images() {
  const [user, setUser] = useState<User | null>(null);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [uploading, setUploading] = useState(false);
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

        // Load images
        const imagesData = await apiClient.get("/api/v1/images");
        setImages(imagesData);
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

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const newImages = await apiClient.upload("/api/v1/images", formData);
      setImages([...images, ...newImages]);
    } catch (e) {
      setError("Failed to upload images.");
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: number) => {
    try {
      await apiClient.delete(`/api/v1/images/${imageId}`);
      setImages(images.filter(img => img.id !== imageId));
    } catch (e) {
      setError("Failed to delete image.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Images</h1>
        <p className="text-gray-600">
          Upload and manage your product photos and assets
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Images</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {uploading ? "Uploading..." : "Click to upload images"}
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && uploadImages(e.target.files)}
                  disabled={uploading}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No images uploaded</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload some images to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={image.url}
                  alt={image.filename}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 truncate" title={image.filename}>
                  {image.filename}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(image.size)} • {new Date(image.uploaded_at).toLocaleDateString()}
                </p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => window.open(image.url, '_blank')}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => deleteImage(image.id)}
                    className="flex-1 bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-200 transition-colors"
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
