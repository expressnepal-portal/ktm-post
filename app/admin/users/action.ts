"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/get-session";
import { auth } from "@/lib/auth";

export type UserActionState = {
  error?: string | null;
  success?: boolean;
} | null;

async function requireAdmin() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "admin") {
    throw new Error("Forbidden: Only administrators can manage users.");
  }
  return session;
}

export async function createUser(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();
  const role = (formData.get("role") as string) || "editor";

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "A user with this email address already exists" };
    }

    const created = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (created?.user?.id) {
      await prisma.user.update({
        where: { id: created.user.id },
        data: {
          role: role === "admin" ? "admin" : "editor",
          emailVerified: true,
        },
      });
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    console.error("Create user error:", err);
    return { error: err.message || "Failed to create user account" };
  }
}

export async function updateUserRole(
  userId: string,
  newRole: string
): Promise<UserActionState> {
  const session = await requireAdmin();

  if (session.user.id === userId && newRole !== "admin") {
    return { error: "You cannot demote your own administrator account" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole === "admin" ? "admin" : "editor" },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    console.error("Update role error:", err);
    return { error: err.message || "Failed to update user role" };
  }
}

export async function toggleUserBan(
  userId: string,
  currentBanned: boolean
): Promise<UserActionState> {
  const session = await requireAdmin();

  if (session.user.id === userId) {
    return { error: "You cannot suspend or ban your own account" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        banned: !currentBanned,
        banReason: !currentBanned ? "Suspended by administrator" : null,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    console.error("Toggle user ban error:", err);
    return { error: err.message || "Failed to update user status" };
  }
}

export async function deleteUser(userId: string): Promise<UserActionState> {
  const session = await requireAdmin();

  if (session.user.id === userId) {
    return { error: "You cannot delete your own administrator account" };
  }

  try {
    // Delete user (cascades or clears sessions)
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    console.error("Delete user error:", err);
    return { error: err.message || "Failed to delete user account" };
  }
}
