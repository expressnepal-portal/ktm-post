"use client";

import React, { useState, useActionState } from "react";
import { createStaticPage, updateStaticPage, type PageActionState } from "./action";
import RichTextEditor from "../posts/RichTextEditor";
import { transliterateSlug } from "@/lib/transliterate";
import { Sparkles, ArrowLeft, Globe, Eye } from "lucide-react";
import Link from "next/link";

interface PageFormProps {
  page?: {
    id: string;
    title: string;
    slug: string;
    content: string;
    menuOrder: number;
    isFooter: boolean;
    isNavbar: boolean;
  };
}

export function PageForm({ page }: PageFormProps) {
  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [content, setContent] = useState(page?.content || "");
  const [menuOrder, setMenuOrder] = useState<number>(page?.menuOrder || 0);
  const [isFooter, setIsFooter] = useState(page?.isFooter ?? true);
  const [isNavbar, setIsNavbar] = useState(page?.isNavbar ?? false);

  const handleGenerateSlug = () => {
    if (!title.trim()) return;
    const generated = transliterateSlug(title);
    setSlug(generated);
  };

  const action = page ? updateStaticPage.bind(null, page.id) : createStaticPage;
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {state.error}
        </div>
      )}

      {/* Action Header bar */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
        <Link
          href="/admin/pages"
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pages
        </Link>
        <div className="flex items-center gap-3">
          {page?.slug && (
            <Link
              href={`/${page.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview Page
            </Link>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="admin-btn-primary px-5 py-2 text-sm font-semibold rounded-lg flex items-center gap-2"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : page ? (
              "Save Changes"
            ) : (
              "Publish Page"
            )}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: Editor */}
        <div className="flex-1 space-y-5">
          {/* Title */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
              Page Title (पृष्ठको शीर्षक) *
            </label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. About Us / हाम्रो बारेमा"
              required
              className="w-full px-4 py-3 text-lg font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-nepal-red focus:ring-1 focus:ring-nepal-red font-nepali-serif"
            />
          </div>

          {/* Slug input */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                URL Slug (स्लग)
              </label>
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="flex items-center gap-1 text-xs text-nepal-red hover:underline font-medium cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Slug
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 font-mono bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200">
                /
              </span>
              <input
                type="text"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="about-us"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-nepal-red font-mono text-sm"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
              Page Content (पृष्ठको विस्तृत विवरण)
            </label>
            <input type="hidden" name="content" value={content} />
            <RichTextEditor
              initialContent={content}
              onChange={setContent}
              placeholder="Write the static page content here..."
            />
          </div>
        </div>

        {/* Right Sidebar: Settings & Placement */}
        <div className="w-full xl:w-[320px] space-y-5 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              Page Placement & Settings
            </h3>

            {/* Menu Order */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Display Order (क्रम संख्या)
              </label>
              <input
                type="number"
                name="menuOrder"
                value={menuOrder}
                onChange={(e) => setMenuOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Lower numbers appear first in lists.
              </p>
            </div>

            {/* Placement Toggles */}
            <div className="pt-2 border-t border-gray-100 space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800">
                <input
                  type="checkbox"
                  name="isFooter"
                  value="true"
                  checked={isFooter}
                  onChange={(e) => setIsFooter(e.target.checked)}
                  className="rounded border-gray-300 text-nepal-red focus:ring-nepal-red w-4 h-4"
                />
                <span>Show in Website Footer (फुटरमा देखाउने)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800">
                <input
                  type="checkbox"
                  name="isNavbar"
                  value="true"
                  checked={isNavbar}
                  onChange={(e) => setIsNavbar(e.target.checked)}
                  className="rounded border-gray-300 text-nepal-red focus:ring-nepal-red w-4 h-4"
                />
                <span>Show in Top Navigation (हेडरमा देखाउने)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
