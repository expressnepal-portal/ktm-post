"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import Image from "next/image";

interface MediaItem {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
}

interface ImageUploadProps {
  /** Called when an image is successfully uploaded */
  onUpload: (media: MediaItem) => void;
  /** Currently selected image URL */
  currentUrl?: string | null;
  /** Label text */
  label?: string;
  /** Compact mode for inline usage */
  compact?: boolean;
}

export default function ImageUpload({
  onUpload,
  currentUrl,
  label = "Upload Image",
  compact = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("alt", file.name.replace(/\.[^.]+$/, ""));

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        let data: any = {};
        try {
          data = await res.json();
        } catch {
          throw new Error(`Server returned status ${res.status}`);
        }

        if (!res.ok) {
          throw new Error(data.error || `Upload failed with status ${res.status}`);
        }

        setPreview(data.url);
        onUpload(data);
      } catch (err: any) {
        setError(err.message || "Upload failed");
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="image-upload-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        style={{ display: "none" }}
      />

      {preview ? (
        <div className="image-upload-preview">
          <Image
            src={preview}
            alt="Preview"
            width={400}
            height={250}
            className="image-upload-preview__img"
            unoptimized
          />
          <button
            type="button"
            onClick={clearImage}
            className="image-upload-preview__remove"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
          {uploading && (
            <div className="image-upload-preview__loading">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <div
          className={`image-upload-dropzone ${dragOver ? "image-upload-dropzone--active" : ""} ${compact ? "image-upload-dropzone--compact" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          ) : (
            <>
              <div className="image-upload-dropzone__icon">
                {compact ? (
                  <ImagePlus className="w-5 h-5" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>
              <p className="image-upload-dropzone__text">
                {compact ? label : "Drag & drop an image here"}
              </p>
              {!compact && (
                <p className="image-upload-dropzone__hint">
                  or click to browse files
                </p>
              )}
            </>
          )}
        </div>
      )}

      {error && <p className="image-upload-error">{error}</p>}
    </div>
  );
}
