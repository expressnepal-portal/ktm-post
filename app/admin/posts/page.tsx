import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";

export default async function AdminPostsPage() {
  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        categories: { include: { category: true } },
      },
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="admin-page-header" style={{ marginBottom: 0 }}>
          <h1>Articles</h1>
          <p>Create, publish, and manage news posts</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 bg-nepal-red hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {posts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <h3 className="text-base font-semibold text-gray-900">
              No articles yet
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Get started by publishing your first article.
            </p>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 bg-nepal-red hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="py-3.5 px-6">Title</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {posts.map((post) => (
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
                    <td className="py-4 px-4 text-gray-500 text-xs">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="inline-flex p-2 text-gray-500 hover:text-nepal-red hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
