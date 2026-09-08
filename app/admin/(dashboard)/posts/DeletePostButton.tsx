"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { deletePost } from "./action";

export default function DeletePostButton({
  postId,
  postTitle,
  variant = "icon",
}: {
  postId: string;
  postTitle?: string;
  variant?: "icon" | "button";
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      `के तपाईं यो समाचार पक्का मेटाउन चाहनुहुन्छ?\n\n"${postTitle || "यो समाचार"}"`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deletePost(postId);
    } catch (err) {
      console.error("Delete failed:", err);
      setIsDeleting(false);
    }
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        {isDeleting ? "Deleting..." : "Delete Article (मेटाउनुहोस्)"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
      title="Delete Article"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
