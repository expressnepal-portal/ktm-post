"use client";

import React, { useState, useActionState } from "react";
import Image from "next/image";
import {
  createSponsor,
  updateSponsor,
  deleteSponsor,
  toggleSponsorActive,
} from "./action";
import ImageUpload from "../components/ImageUpload";
import { Plus, Edit2, Trash2, X, Check, ExternalLink } from "lucide-react";

interface Category {
  id: string;
  name: string;
  nepaliName: string | null;
}

interface Sponsor {
  id: string;
  title: string;
  link: string | null;
  active: boolean;
  priority: number;
  categoryId: string | null;
  category: { id: string; name: string; nepaliName: string | null } | null;
  bannerImage: {
    id: string;
    url: string;
    alt: string | null;
  };
}

interface SponsorManagerProps {
  sponsors: Sponsor[];
  categories: Category[];
}

export default function SponsorManager({
  sponsors,
  categories,
}: SponsorManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bannerImageId, setBannerImageId] = useState("");

  const [addState, addAction, isAdding] = useActionState(createSponsor, null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Total Ads / Sponsors:{" "}
          <span className="font-semibold text-gray-900">{sponsors.length}</span>
        </p>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setBannerImageId("");
          }}
          className="admin-btn-primary flex items-center gap-2"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Cancel" : "Add Sponsor Banner"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Add Sponsor Advertisement
          </h3>
          {addState?.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {addState.error}
            </div>
          )}
          <form
            action={async (formData) => {
              await addAction(formData);
              setShowAddForm(false);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Sponsor / Ad Title *
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Nepal Telecom Summer Campaign"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Target Link (URL)
                </label>
                <input
                  name="link"
                  type="url"
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Target Category (Optional)
                </label>
                <select
                  name="categoryId"
                  defaultValue="all"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="all">Global / All Pages</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nepaliName || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Priority / Sort Order
                </label>
                <input
                  name="priority"
                  type="number"
                  defaultValue={0}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Status
                </label>
                <select
                  name="active"
                  defaultValue="true"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="true">Active (Live)</option>
                  <option value="false">Paused / Inactive</option>
                </select>
              </div>
            </div>

            {/* Banner Image Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Banner Graphic / Image *
              </label>
              <ImageUpload
                onUpload={(media) => setBannerImageId(media.id)}
                label="Drop banner image (PNG, JPG, WebP)"
              />
              <input type="hidden" name="bannerImageId" value={bannerImageId} />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isAdding || !bannerImageId}
                className="admin-btn-primary text-sm disabled:opacity-50"
              >
                {isAdding ? "Saving..." : "Create Sponsor Ad"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sponsors Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "120px" }}>Banner</th>
              <th>Title</th>
              <th>Target URL</th>
              <th>Category</th>
              <th style={{ width: "80px" }}>Priority</th>
              <th style={{ width: "90px" }}>Status</th>
              <th style={{ width: "120px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sponsors.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No sponsors found. Click &quot;Add Sponsor Banner&quot; to create one.
                </td>
              </tr>
            ) : (
              sponsors.map((sponsor) => (
                <SponsorRow
                  key={sponsor.id}
                  sponsor={sponsor}
                  categories={categories}
                  isEditing={editingId === sponsor.id}
                  onStartEdit={() => setEditingId(sponsor.id)}
                  onCancelEdit={() => setEditingId(null)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SponsorRow({
  sponsor,
  categories,
  isEditing,
  onStartEdit,
  onCancelEdit,
}: {
  sponsor: Sponsor;
  categories: Category[];
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}) {
  const [updateState, updateAction, isUpdating] = useActionState(
    updateSponsor.bind(null, sponsor.id),
    null
  );
  const [bannerId, setBannerId] = useState(sponsor.bannerImage.id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete sponsor ad "${sponsor.title}"?`)) return;
    setIsDeleting(true);
    await deleteSponsor(sponsor.id);
    setIsDeleting(false);
  };

  const handleToggle = async () => {
    setIsToggling(true);
    await toggleSponsorActive(sponsor.id, sponsor.active);
    setIsToggling(false);
  };

  if (isEditing) {
    return (
      <tr className="bg-red-50/40">
        <td colSpan={7} className="p-4">
          <form
            action={async (formData) => {
              await updateAction(formData);
              onCancelEdit();
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                name="title"
                required
                defaultValue={sponsor.title}
                className="px-2.5 py-1.5 border border-gray-300 rounded text-xs"
                placeholder="Title"
              />
              <input
                name="link"
                type="url"
                defaultValue={sponsor.link || ""}
                className="px-2.5 py-1.5 border border-gray-300 rounded text-xs"
                placeholder="https://..."
              />
              <select
                name="categoryId"
                defaultValue={sponsor.categoryId || "all"}
                className="px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
              >
                <option value="all">Global (All Pages)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nepaliName || c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <input
                name="priority"
                type="number"
                defaultValue={sponsor.priority}
                className="px-2.5 py-1.5 border border-gray-300 rounded text-xs"
                placeholder="Priority"
              />
              <select
                name="active"
                defaultValue={sponsor.active ? "true" : "false"}
                className="px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <div className="flex items-center gap-2">
                <input type="hidden" name="bannerImageId" value={bannerId} />
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div>
              <ImageUpload
                currentUrl={sponsor.bannerImage.url}
                onUpload={(m) => setBannerId(m.id)}
                compact
                label="Replace Banner Graphic"
              />
            </div>
            {updateState?.error && (
              <p className="text-xs text-red-600">{updateState.error}</p>
            )}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>
        <div className="relative w-20 h-10 rounded border overflow-hidden bg-gray-100">
          <Image
            src={sponsor.bannerImage.url}
            alt={sponsor.bannerImage.alt || sponsor.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </td>
      <td className="font-semibold text-gray-900">{sponsor.title}</td>
      <td>
        {sponsor.link ? (
          <a
            href={sponsor.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            Visit <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-gray-400 text-xs">No link</span>
        )}
      </td>
      <td>
        <span className="text-xs text-gray-700">
          {sponsor.category
            ? sponsor.category.nepaliName || sponsor.category.name
            : "Global (All)"}
        </span>
      </td>
      <td className="font-mono text-xs text-gray-500">#{sponsor.priority}</td>
      <td>
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
            sponsor.active
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {sponsor.active ? "Active" : "Paused"}
        </button>
      </td>
      <td className="text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onStartEdit}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit Sponsor"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Delete Sponsor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
