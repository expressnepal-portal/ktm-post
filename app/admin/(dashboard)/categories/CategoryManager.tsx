"use client";

import React, { useState, useActionState } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryActionState,
} from "./action";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  nepaliName: string | null;
  slug: string;
  menuOrder: number;
  _count: {
    posts: number;
    sponsors: number;
  };
}

interface CategoryManagerProps {
  categories: Category[];
}

export default function CategoryManager({ categories }: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form action
  const [addState, addAction, isAdding] = useActionState(createCategory, null);

  return (
    <div className="space-y-6">
      {/* Top action */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Total Categories: <span className="font-semibold text-gray-900">{categories.length}</span>
        </p>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="admin-btn-primary flex items-center gap-2"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Cancel" : "Add New Category"}
        </button>
      </div>

      {/* Add Form Accordion / Card */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Create Category (नयाँ विधा थप्नुहोस्)
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
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                English Name / Identifier *
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Politics"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Nepali Display Name (नेपाली नाम)
              </label>
              <input
                name="nepaliName"
                placeholder="e.g. राजनीति"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                style={{ fontFamily: '"Noto Serif Devanagari", "Poppins", sans-serif' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Slug
              </label>
              <input
                name="slug"
                placeholder="auto-generated"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Priority Order
              </label>
              <div className="flex gap-2">
                <input
                  name="menuOrder"
                  type="number"
                  defaultValue={0}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <button
                  type="submit"
                  disabled={isAdding}
                  className="admin-btn-primary flex-1 whitespace-nowrap text-sm"
                >
                  {isAdding ? "Saving..." : "Save Category"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>Order</th>
              <th>English Name</th>
              <th>Nepali Name</th>
              <th>Slug / URL</th>
              <th style={{ width: "100px" }}>Articles</th>
              <th style={{ width: "100px" }}>Sponsors</th>
              <th style={{ width: "120px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No categories found. Click &quot;Add New Category&quot; to create one.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  isEditing={editingId === cat.id}
                  onStartEdit={() => setEditingId(cat.id)}
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

function CategoryRow({
  category,
  isEditing,
  onStartEdit,
  onCancelEdit,
}: {
  category: Category;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}) {
  const [updateState, updateAction, isUpdating] = useActionState(
    updateCategory.bind(null, category.id),
    null
  );

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${category.name}"? Articles in this category will not be deleted.`
      )
    ) {
      return;
    }
    setIsDeleting(true);
    await deleteCategory(category.id);
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
              name="menuOrder"
              type="number"
              defaultValue={category.menuOrder}
              className="w-16 px-2.5 py-1.5 border border-gray-300 rounded text-xs"
              title="Order"
            />
            <input
              name="name"
              required
              defaultValue={category.name}
              className="px-2.5 py-1.5 border border-gray-300 rounded text-xs flex-1 min-w-[120px]"
              placeholder="English name"
            />
            <input
              name="nepaliName"
              defaultValue={category.nepaliName || ""}
              className="px-2.5 py-1.5 border border-gray-300 rounded text-xs flex-1 min-w-[120px]"
              placeholder="Nepali name"
              style={{ fontFamily: '"Noto Serif Devanagari", "Poppins", sans-serif' }}
            />
            <input
              name="slug"
              required
              defaultValue={category.slug}
              className="px-2.5 py-1.5 border border-gray-300 rounded text-xs font-mono flex-1 min-w-[100px]"
              placeholder="Slug"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="submit"
                disabled={isUpdating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded text-xs flex items-center gap-1"
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
      <td className="font-mono text-gray-500 text-xs">#{category.menuOrder}</td>
      <td className="font-semibold text-gray-900">{category.name}</td>
      <td
        className="text-gray-800"
        style={{ fontFamily: '"Noto Serif Devanagari", "Poppins", sans-serif' }}
      >
        {category.nepaliName || "—"}
      </td>
      <td>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">
          /{category.slug}
        </span>
      </td>
      <td>
        <span className="font-medium text-gray-700">{category._count.posts}</span>
      </td>
      <td>
        <span className="font-medium text-gray-700">{category._count.sponsors}</span>
      </td>
      <td className="text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onStartEdit}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit Category"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
