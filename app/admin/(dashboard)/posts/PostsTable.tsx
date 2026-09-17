"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, Edit, X, Filter } from "lucide-react";
import DeletePostButton from "./DeletePostButton";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  authorName?: string | null;
  author?: { name: string } | null;
  createdAt: string | Date;
  categories?: { category: { id: string; name: string; nepaliName: string | null } }[];
}

interface PostsTableProps {
  initialPosts: PostItem[];
}

export default function PostsTable({ initialPosts }: PostsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Extract unique categories from posts for filter dropdown
  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    initialPosts.forEach((post) => {
      post.categories?.forEach((catRel) => {
        if (catRel.category) {
          map.set(
            catRel.category.id,
            catRel.category.nepaliName || catRel.category.name
          );
        }
      });
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [initialPosts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      // Status filter
      if (statusFilter !== "ALL" && post.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "ALL") {
        const hasCategory = post.categories?.some(
          (c) => c.category?.id === selectedCategory
        );
        if (!hasCategory) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const authorStr = (post.authorName || post.author?.name || "KTM Post").toLowerCase();
        const titleMatch = post.title.toLowerCase().includes(query);
        const slugMatch = post.slug.toLowerCase().includes(query);
        const authorMatch = authorStr.includes(query);
        const categoryMatch = post.categories?.some((c) =>
          (c.category?.name.toLowerCase().includes(query) ||
           (c.category?.nepaliName && c.category.nepaliName.toLowerCase().includes(query)))
        );

        return titleMatch || slugMatch || authorMatch || categoryMatch;
      }

      return true;
    });
  }, [initialPosts, searchTerm, statusFilter, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search articles by title, slug, author or category (लेख खोज्नुहोस्)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-nepal-red bg-gray-50/50 text-gray-900 transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-xs font-medium border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:border-nepal-red cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>

          {/* Category filter */}
          {categoryOptions.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 text-xs font-medium border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:border-nepal-red cursor-pointer max-w-[150px] truncate"
            >
              <option value="ALL">All Categories</option>
              {categoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {(searchTerm || statusFilter !== "ALL" || selectedCategory !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
                setSelectedCategory("ALL");
              }}
              className="text-xs text-gray-500 hover:text-nepal-red font-medium px-2 py-2 cursor-pointer transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results summary if filtered */}
      {(searchTerm || statusFilter !== "ALL" || selectedCategory !== "ALL") && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>
            Showing <strong className="text-gray-900">{filteredPosts.length}</strong> of {initialPosts.length} articles
          </span>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <h3 className="text-base font-semibold text-gray-900">
              {initialPosts.length === 0 ? "No articles yet" : "No matching articles found"}
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              {initialPosts.length === 0
                ? "Get started by publishing your first article."
                : `No results for your active search or filters.`}
            </p>
            {initialPosts.length === 0 ? (
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center gap-2 bg-nepal-red hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Article
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setSelectedCategory("ALL");
                }}
                className="inline-flex items-center gap-1.5 text-xs text-nepal-red hover:underline font-semibold"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="py-3.5 px-6">Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50/75 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900 line-clamp-1 max-w-md">
                        {post.title}
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        /{post.slug}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-xs">
                      {post.categories && post.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {post.categories.slice(0, 2).map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-gray-100 rounded text-[11px] font-medium text-gray-700"
                            >
                              {c.category?.nepaliName || c.category?.name}
                            </span>
                          ))}
                          {post.categories.length > 2 && (
                            <span className="text-[10px] text-gray-400 self-center">
                              +{post.categories.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Uncategorized</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-700 font-medium text-xs">
                      {post.authorName || post.author?.name || "KTM Post"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                          post.status === "PUBLISHED"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="inline-flex p-2 text-gray-500 hover:text-nepal-red hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeletePostButton
                          postId={post.id}
                          postTitle={post.title}
                          variant="icon"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
