"use client";

import React, { useState } from "react";
import { DownloadCloud, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ImportManager() {
  const [count, setCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    imported?: number;
    skipped?: number;
    total?: number;
    error?: string;
  } | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, mode: "wordpress" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || "Failed to import data" });
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setResult({ error: err.message || "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1>Import Articles & Data</h1>
        <p>Migrate articles, categories, and media from WordPress GraphQL CMS into your local database</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WordPress GraphQL Importer Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-nepal-red flex items-center justify-center">
                <DownloadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  WordPress CMS Importer
                </h3>
                <p className="text-xs text-gray-500">
                  cms.ktmpost.com GraphQL API
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Fetches posts, featured images, categories, and romanized slugs directly from your WordPress CMS endpoint and inserts them into your Neon PostgreSQL database.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Number of Articles to Fetch
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  disabled={loading}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium"
                >
                  <option value={10}>10 Articles</option>
                  <option value={20}>20 Articles (Recommended)</option>
                  <option value={50}>50 Articles</option>
                  <option value={100}>100 Articles</option>
                </select>
                <span className="text-xs text-gray-400">
                  Duplicates with same slug are safely skipped.
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleImport}
              disabled={loading}
              className="w-full admin-btn-primary flex items-center justify-center gap-2 py-3 rounded-xl disabled:opacity-50 text-sm shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing from WordPress...
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4" />
                  Start WordPress Import
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results / Status Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Import Status & Summary
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Track results of your recent migration jobs
            </p>

            {loading && (
              <div className="p-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-nepal-red mx-auto" />
                <p className="text-sm font-medium text-gray-700">
                  Fetching posts, transforming Nepali slugs, and saving media...
                </p>
                <p className="text-xs text-gray-400">This may take 5–15 seconds</p>
              </div>
            )}

            {result?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Import Error</strong>
                  <span>{result.error}</span>
                </div>
              </div>
            )}

            {result?.success && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Import Complete!</strong>
                    <span>Successfully processed {result.total} articles from WordPress.</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                    <span className="text-xs uppercase text-gray-500 font-semibold block">
                      New Imported
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      +{result.imported}
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                    <span className="text-xs uppercase text-gray-500 font-semibold block">
                      Skipped (Existing)
                    </span>
                    <span className="text-2xl font-bold text-gray-600">
                      {result.skipped}
                    </span>
                  </div>
                </div>

                <div className="pt-3">
                  <Link
                    href="/admin/posts"
                    className="text-xs text-nepal-red font-semibold hover:underline flex items-center gap-1"
                  >
                    View All Articles in Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {!loading && !result && (
              <div className="p-8 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl">
                Select count and click &quot;Start WordPress Import&quot; to import posts into your database.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
