export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { fetchPostsByCategory, fetchWPCategories } from "@/lib/wordpress";
import { extractImagesFromContent, getCleanContent, getCleanTitle, getPostUrl, mapWpPost } from "../page";
import Card from "../components/Card";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category).toLowerCase();
  
  // Fetch all WP categories to find matching category details dynamically
  const allCategories = await fetchWPCategories();
  const matchedCategory = allCategories.find((c) => c.slug === decodedCategory);

  // Use matching category slug or fallback to decodedCategory
  const wpCategorySlug = matchedCategory ? matchedCategory.slug : decodedCategory;
  const categoryDisplayName = matchedCategory ? matchedCategory.name : decodedCategory.toUpperCase();
  
  // Fetch posts dynamically by category slug
  const rawPosts = await fetchPostsByCategory(wpCategorySlug, 15);
  const posts = rawPosts.map(mapWpPost);

  return (
    <div className="w-full min-h-screen bg-white">
      <main className="w-full" style={{ paddingTop: "var(--header-height)" }}>
        <div className="w-full max-w-[1920px] mx-auto px-mobile-safe pt-6 pb-16">

          {/* Section title */}
          <div className="flex justify-center mb-8 border-b-4 border-nepal-red pb-4 flex-col items-start">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-nepal-black font-nepali-serif">
              {categoryDisplayName}
            </h1>
          </div>

          {/* Grid cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.length > 0 ? (
              posts.map((post) => {
                const contentImages = extractImagesFromContent(post.content);
                const featuredImageUrl = post.featuredImage;
                const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;

                return (
                  <Card
                    key={post.id}
                    link={getPostUrl(post)}
                    images={thumbnailImage ? [thumbnailImage] : []}
                    title={getCleanTitle(post.title)}
                    content={getCleanContent(post.content, 150)}
                  />
                );
              })
            ) : (
              <div className="col-span-full w-full text-center text-gray-500 font-poppins py-20">
                No Content Available For Now
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
