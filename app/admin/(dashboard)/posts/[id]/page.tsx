import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { PostForm } from "../PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [post, categories, users, session] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        featuredImage: true,
        author: true,
      },
    }),
    prisma.category.findMany({ orderBy: { menuOrder: "asc" } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    getServerSession(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <>
      <div className="admin-page-header">
        <h1>Edit Article</h1>
        <p className="line-clamp-1">{post.title}</p>
      </div>
      <PostForm
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          status: post.status,
          isBreaking: post.isBreaking,
          isFeatured: post.isFeatured,
          isExclusive: post.isExclusive,
          authorId: post.authorId,
          authorName: post.authorName,
          author: post.author,
          categoryIds: post.categories.map((c) => c.categoryId),
          featuredImageId: post.featuredImageId,
          featuredImage: post.featuredImage,
        }}
        categories={categories}
        users={users}
        currentUserId={session?.user?.id}
      />
    </>
  );
}
