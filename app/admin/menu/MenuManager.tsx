"use client";

import React, { useState, useActionState } from "react";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  type MenuActionState,
} from "./action";
import { Plus, Edit2, Trash2, X, Check, Link2, ExternalLink } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  nepaliName: string | null;
  slug: string;
}

interface MenuItemData {
  id: string;
  label: string;
  nepaliLabel: string | null;
  url: string;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    nepaliName: string | null;
    slug: string;
  } | null;
}

interface MenuManagerProps {
  menuItems: MenuItemData[];
  categories: CategoryOption[];
}

export default function MenuManager({ menuItems, categories }: MenuManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form action
  const [addState, addAction, isAdding] = useActionState(createMenuItem, null);

  // Form helper: when category is chosen in add form, auto-fill fields
  const [selectedCatId, setSelectedCatId] = useState("");
  const [labelVal, setLabelVal] = useState("");
  const [nepaliLabelVal, setNepaliLabelVal] = useState("");
  const [urlVal, setUrlVal] = useState("");

  const handleCategorySelect = (catId: string) => {
    setSelectedCatId(catId);
    if (!catId) return;
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      setLabelVal(cat.name);
      setNepaliLabelVal(cat.nepaliName || cat.name);
      setUrlVal(`/${cat.slug}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            Total Menu Links:{" "}
            <span className="font-semibold text-gray-900">{menuItems.length}</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="admin-btn-primary flex items-center gap-2"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Cancel" : "Add New Menu Link"}
        </button>
      </div>

      {/* Add New Menu Link Card */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Add Navbar Item (नयाँ मेनु लिङ्क थप्नुहोस्)
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Pick an existing category to automatically link, or type any custom internal/external link.
          </p>

          {addState?.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {addState.error}
            </div>
          )}

          <form
            action={async (formData) => {
              await addAction(formData);
              setShowAddForm(false);
              setLabelVal("");
              setNepaliLabelVal("");
              setUrlVal("");
              setSelectedCatId("");
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Link to Category (Optional)
                </label>
                <select
                  name="categoryId"
                  value={selectedCatId}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="">-- Custom Link / None --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nepaliName || c.name} ({c.name}) → /{c.slug}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Nepali Display Label *
                </label>
                <input
                  name="nepaliLabel"
                  required
                  value={nepaliLabelVal}
                  onChange={(e) => setNepaliLabelVal(e.target.value)}
                  placeholder="e.g. समाचार, विचार, सम्पर्क"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  style={{ fontFamily: '"Noto Serif Devanagari", "Poppins", sans-serif' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  English Label / Identifier *
                </label>
                <input
                  name="label"
                  required
                  value={labelVal}
                  onChange={(e) => setLabelVal(e.target.value)}
                  placeholder="e.g. News, Opinion, Contact"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Target URL / Path *
                </label>
                <input
                  name="url"
                  required
                  value={urlVal}
                  onChange={(e) => setUrlVal(e.target.value)}
                  placeholder="e.g. /news, /politics, https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <div>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700">
                    Order (#):
                    <input
                      name="order"
                      type="number"
                      defaultValue={menuItems.length + 1}
                      className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                    />
                  </label>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <input
                    name="openInNewTab"
                    type="checkbox"
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  Open in new tab
                </label>
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="admin-btn-primary text-sm px-5 py-2"
              >
                {isAdding ? "Saving..." : "Save Menu Item"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "70px" }}>Order</th>
              <th>Nepali Display Label</th>
              <th>English Label</th>
              <th>Target URL / Route</th>
              <th>Category Link</th>
              <th style={{ width: "90px" }}>Status</th>
              <th style={{ width: "120px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  No menu items created yet. Click &quot;Add New Menu Link&quot; to build your header navigation.
                </td>
              </tr>
            ) : (
              menuItems.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  categories={categories}
                  isEditing={editingId === item.id}
                  onStartEdit={() => setEditingId(item.id)}
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

function MenuItemRow({
  item,
  categories,
  isEditing,
  onStartEdit,
  onCancelEdit,
}: {
  item: MenuItemData;
  categories: CategoryOption[];
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}) {
  const [updateState, updateAction, isUpdating] = useActionState(
    updateMenuItem.bind(null, item.id),
    null
  );

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove "${item.nepaliLabel || item.label}" from the navigation menu?`)) {
      return;
    }
    setIsDeleting(true);
    await deleteMenuItem(item.id);
    setIsDeleting(false);
  };

  if (isEditing) {
    return (
      <tr className="bg-red-50/40">
        <td colSpan={7} className="p-3">
          <form
            action={async (formData) => {
              await updateAction(formData);
              onCancelEdit();
            }}
            className="flex flex-wrap items-center gap-3"
          >
            <input
              name="order"
              type="number"
              defaultValue={item.order}
              className="w-16 px-2.5 py-1.5 border border-gray-300 rounded text-xs"
              title="Order in Navbar"
            />
            <input
              name="nepaliLabel"
              required
              defaultValue={item.nepaliLabel || ""}
              className="px-2.5 py-1.5 border border-gray-300 rounded text-xs flex-1 min-w-[120px]"
              placeholder="Nepali label"
              style={{ fontFamily: '"Noto Serif Devanagari", "Poppins", sans-serif' }}
            />
            <input
              name="label"
              required
              defaultValue={item.label}
              className="px-2.5 py-1.5 border border-gray-300 rounded text-xs flex-1 min-w-[120px]"
              placeholder="English label"
            />
            <input
              name="url"
              required
              defaultValue={item.url}
              className="px-2.5 py-1.5 border border-gray-300 rounded text-xs font-mono flex-1 min-w-[110px]"
              placeholder="URL e.g. /news"
            />
            <select
              name="categoryId"
              defaultValue={item.categoryId || ""}
              className="px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white min-w-[130px]"
            >
              <option value="">No linked category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nepaliName || c.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-xs text-gray-700 select-none cursor-pointer bg-white px-2 py-1.5 border border-gray-300 rounded">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={item.isActive}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span>Active</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="submit"
                disabled={isUpdating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 font-medium"
                title="Save Changes"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1.5 rounded text-xs"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {updateState?.error && (
              <p className="w-full text-xs text-red-600 mt-1">{updateState.error}</p>
            )}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="font-mono text-gray-500 text-xs">#{item.order}</td>
      <td
        className="font-bold text-gray-900 text-base"
        style={{ fontFamily: '"Noto Serif Devanagari", "Poppins", sans-serif' }}
      >
        {item.nepaliLabel || item.label}
      </td>
      <td className="font-medium text-gray-600 text-sm">{item.label}</td>
      <td>
        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono inline-flex items-center gap-1">
          <Link2 className="w-3 h-3 text-gray-400" />
          {item.url}
          {item.openInNewTab && <ExternalLink className="w-3 h-3 text-blue-500 ml-0.5" />}
        </span>
      </td>
      <td>
        {item.category ? (
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-medium">
            Category: {item.category.nepaliName || item.category.name}
          </span>
        ) : (
          <span className="text-xs text-gray-400 font-normal">Custom Link</span>
        )}
      </td>
      <td>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            item.isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-gray-100 text-gray-500 border border-gray-200"
          }`}
        >
          {item.isActive ? "Active" : "Disabled"}
        </span>
      </td>
      <td className="text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onStartEdit}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit Menu Item"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Delete Menu Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
