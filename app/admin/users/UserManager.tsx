"use client";

import React, { useState, useActionState } from "react";
import {
  createUser,
  updateUserRole,
  toggleUserBan,
  deleteUser,
} from "./action";
import {
  UserPlus,
  Shield,
  UserCheck,
  Ban,
  Trash2,
  X,
  FileText,
  Mail,
  Calendar,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  createdAt: string | Date;
  _count: {
    posts: number;
  };
}

interface UserManagerProps {
  users: UserItem[];
  currentUserId: string;
}

export default function UserManager({ users, currentUserId }: UserManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addState, addAction, isAdding] = useActionState(createUser, null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    const res = await updateUserRole(userId, newRole);
    if (res?.error) alert(res.error);
    setUpdatingId(null);
  };

  const handleToggleBan = async (userId: string, currentBanned: boolean) => {
    const actionName = currentBanned ? "unban / restore" : "suspend / ban";
    if (!confirm(`Are you sure you want to ${actionName} this user account?`)) return;

    setUpdatingId(userId);
    const res = await toggleUserBan(userId, currentBanned);
    if (res?.error) alert(res.error);
    setUpdatingId(null);
  };

  const handleDelete = async (user: UserItem) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${user.name}" (${user.email})? This action cannot be undone.`
      )
    ) {
      return;
    }

    setUpdatingId(user.id);
    const res = await deleteUser(user.id);
    if (res?.error) alert(res.error);
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Total Users:{" "}
          <span className="font-semibold text-gray-900">{users.length}</span>
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="admin-btn-primary flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-semibold text-gray-900">
                Create Team Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addState?.error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {addState.error}
              </div>
            )}

            <form
              action={async (formData) => {
                await addAction(formData);
                setShowAddModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Full Name / लेखकको नाम *
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Ram Shrestha"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="editor@ktmpost.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Password *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Role & Permissions *
                </label>
                <select
                  name="role"
                  defaultValue="editor"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="editor">Editor (Can write & publish articles)</option>
                  <option value="admin">Administrator (Full dashboard access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="admin-btn-primary text-xs font-semibold"
                >
                  {isAdding ? "Creating User..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User / Author</th>
              <th>Role</th>
              <th>Articles Written</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isAdmin = user.role === "admin";
              const isSelf = user.id === currentUserId;
              const isBanned = !!user.banned;

              return (
                <tr key={user.id} className={isBanned ? "bg-red-50/20" : ""}>
                  <td>
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-gray-900">
                        <span>{user.name}</span>
                        {isSelf && (
                          <span className="text-[10px] bg-red-100 text-nepal-red px-2 py-0.5 rounded-full font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {user.email}
                      </span>
                    </div>
                  </td>
                  <td>
                    {isSelf ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                        <Shield className="w-3.5 h-3.5" /> Administrator
                      </span>
                    ) : (
                      <select
                        value={user.role || "editor"}
                        disabled={updatingId === user.id}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-xs font-medium px-2.5 py-1 border border-gray-200 rounded-lg bg-white"
                      >
                        <option value="editor">Editor</option>
                        <option value="admin">Administrator</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-700 font-medium">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      {user._count.posts} posts
                    </span>
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        isBanned
                          ? "bg-red-100 text-red-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isBanned ? (
                        <>
                          <Ban className="w-3 h-3" /> Suspended
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3" /> Active
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="text-right">
                    {!isSelf && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleBan(user.id, isBanned)}
                          disabled={updatingId === user.id}
                          className={`p-1.5 rounded transition-colors ${
                            isBanned
                              ? "text-emerald-600 hover:bg-emerald-50"
                              : "text-amber-600 hover:bg-amber-50"
                          }`}
                          title={isBanned ? "Restore user access" : "Suspend user access"}
                        >
                          {isBanned ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={updatingId === user.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
