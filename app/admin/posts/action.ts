"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

import { transliterateSlug } from "@/lib/transliterate";

export type ActionState = {
  error?: string | null;
  success?: boolean;
} | null;

async function requireSession() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function createPost(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string) || null;
  const featuredImageId = (formData.get("featuredImageId") as string) || null;
  const categoryIds = formData.getAll("categoryIds") as string[];
  const status = (formData.get("status") as "DRAFT" | "PUBLISHED") || "DRAFT";
  const authorId = (formData.get("authorId") as string)?.trim() || null;
  const authorName = (formData.get("authorName") as string)?.trim() || null;

  if (!title) return { error: "Title is required" };
  if (!content) return { error: "Content is required" };

  const rawSlug = (formData.get("slug") as string)?.trim();
  let slug = rawSlug ? transliterateSlug(rawSlug) : transliterateSlug(title);
  if (!slug) slug = `article-${Date.now().toString(36)}`;

  // Ensure slug uniqueness — append timestamp if taken
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const isBreakingInput = formData.get("isBreaking") === "true" || formData.get("isBreaking") === "on";
  const isFeaturedInput = formData.get("isFeatured") === "true" || formData.get("isFeatured") === "on";

  // Check if categories include breaking or featured categories
  const selectedCategories = categoryIds.length > 0
    ? await prisma.category.findMany({ where: { id: { in: categoryIds } } })
    : [];
  const hasBreakingCat = selectedCategories.some(c => c.slug === "breaking-news" || c.nepaliName?.includes("ताजा"));
  const hasFeaturedCat = selectedCategories.some(c => c.slug === "featured-news" || c.nepaliName?.includes("विशेष"));

  const isBreaking = isBreakingInput || hasBreakingCat;
  const isFeatured = isFeaturedInput || hasFeaturedCat;

  let postId: string;
  try {
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        status,
        isBreaking,
        isFeatured,
        authorName: authorName || undefined,
        featuredImage: featuredImageId ? { connect: { id: featuredImageId } } : undefined,
        author: authorId ? { connect: { id: authorId } } : undefined,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        categories:
          categoryIds.length > 0
            ? {
                create: categoryIds.map((categoryId) => ({ categoryId })),
              }
            : undefined,
      },
    });
    postId = post.id;
  } catch (err: any) {
    console.error("Create post error:", err);
    return { error: err.message || "Failed to create post" };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${postId}`);
}

export async function updatePost(
  postId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string) || null;
  const featuredImageId = (formData.get("featuredImageId") as string) || null;
  const categoryIds = formData.getAll("categoryIds") as string[];
  const status = (formData.get("status") as "DRAFT" | "PUBLISHED") || "DRAFT";
  const authorId = (formData.get("authorId") as string)?.trim() || null;
  const authorName = (formData.get("authorName") as string)?.trim() || null;
  const rawSlug = (formData.get("slug") as string)?.trim();

  if (!title || !content) {
    return { error: "Title and content are required" };
  }

  let slug = rawSlug ? transliterateSlug(rawSlug) : transliterateSlug(title);
  if (!slug) slug = `article-${Date.now().toString(36)}`;

  const current = await prisma.post.findUnique({ where: { id: postId } });
  if (!current) return { error: "Post not found" };

  // If slug changed, verify no clash
  if (slug !== current.slug) {
    const clash = await prisma.post.findUnique({ where: { slug } });
    if (clash && clash.id !== postId) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
  }

  const isBreakingInput = formData.has("isBreaking") ? (formData.get("isBreaking") === "true" || formData.get("isBreaking") === "on") : undefined;
  const isFeaturedInput = formData.has("isFeatured") ? (formData.get("isFeatured") === "true" || formData.get("isFeatured") === "on") : undefined;

  // Check categories for breaking/featured
  const selectedCategories = categoryIds.length > 0
    ? await prisma.category.findMany({ where: { id: { in: categoryIds } } })
    : [];
  const hasBreakingCat = selectedCategories.some(c => c.slug === "breaking-news" || c.nepaliName?.includes("ताजा"));
  const hasFeaturedCat = selectedCategories.some(c => c.slug === "featured-news" || c.nepaliName?.includes("विशेष"));

  const isBreaking = isBreakingInput !== undefined ? (isBreakingInput || hasBreakingCat) : hasBreakingCat;
  const isFeatured = isFeaturedInput !== undefined ? (isFeaturedInput || hasFeaturedCat) : hasFeaturedCat;

  try {
    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        slug,
        content,
        excerpt,
        status,
        isBreaking,
        isFeatured,
        authorName: authorName || null,
        author: authorId ? { connect: { id: authorId } } : { disconnect: true },
        featuredImage: featuredImageId ? { connect: { id: featuredImageId } } : { disconnect: true },
        publishedAt:
          status === "PUBLISHED"
            ? current.publishedAt ?? new Date()
            : current.publishedAt,
        categories: {
          deleteMany: {}, // Clear existing joins
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });
  } catch (err: any) {
    console.error("Update post error:", err);
    return { error: err.message || "Failed to update post" };
  }

  revalidatePath(`/admin/posts/${postId}`);
  revalidatePath(`/${current.slug}`);
  if (slug !== current.slug) revalidatePath(`/${slug}`);
  redirect(`/admin/posts/${postId}`);
}

export async function deletePost(postId: string): Promise<ActionState> {
  const session = await requireSession();

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post not found" };

  try {
    await prisma.post.delete({ where: { id: postId } });
  } catch (err: any) {
    console.error("Delete post error:", err);
    return { error: err.message || "Failed to delete post" };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath(`/${post.slug}`);
  redirect("/admin/posts");
}