"use client";

import React, { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteStaticPage } from "./action";

export default function DeletePageButton({
  pageId,
  pageTitle,
}: {
  pageId: string;
  pageTitle: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete the static page "${pageTitle}"? This cannot be undone.`
      )
    ) {
      startTransition(async () => {
        await deleteStaticPage(pageId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
      title="Delete page"
    >
      {isPending ? (
        <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin inline-block" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
