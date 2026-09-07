"use client";

import React, { useState } from "react";
import Image from "next/image";
import ImageUpload from "../components/ImageUpload";
import { Plus, Trash2, Copy, Check, ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface MediaItem {
  id: string;
  url: string;
  publicId: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
  createdAt: string | Date;
  _count: {
    posts: number;
    sponsors: number;
  };
}

interface MediaLibraryProps {
  initialMedia: MediaItem[];
}

export default function MediaLibrary({ initialMedia }: MediaLibraryProps) {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (item: MediaItem) => {
    if (item._count.posts > 0 || item._count.sponsors > 0) {
      alert(
        `Cannot delete: This image is actively used in ${item._count.posts} article(s) and ${item._count.sponsors} sponsor ad(s).`
      );
      return;
    }
    if (!confirm("Are you sure you want to delete this media asset?")) return;

    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/upload?id=${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete media");
      } else {
        router.refresh();
      }
    } catch {
      alert("Network error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Total Uploads:{" "}
          <span className="font-semibold text-gray-900">{initialMedia.length}</span>
        </p>
        <button
          onClick={() => setShowUploadModal(true)}
          className="admin-btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Upload New Image
        </button>
      </div>

      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-semibold text-gray-900">
                Upload Media to Cloudinary
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ImageUpload
              onUpload={() => {
                setShowUploadModal(false);
                router.refresh();
              }}
              label="Drop images to upload to Media Library"
            />
          </div>
        </div>
      )}

      {/* Grid of Media Cards */}
      {initialMedia.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">Your media library is empty.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="admin-btn-primary"
          >
            Upload your first image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {initialMedia.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <Image
                  src={item.url}
                  alt={item.alt || "Media item"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  unoptimized
                />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between text-xs text-gray-500">
                <p className="truncate font-medium text-gray-800" title={item.alt || item.url}>
                  {item.alt || "Untitled Media"}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="font-mono text-[11px]">
                    {item.width && item.height ? `${item.width}×${item.height}` : item.format || "IMG"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(item.url, item.id)}
                      className="p-1 text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50"
                      title="Open full size"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
