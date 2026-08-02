export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { fetchPostsByCategory } from "@/lib/wordpress";
import { extractImagesFromContent, getCleanContent, getCleanTitle, getPostUrl, mapWpPost } from "../page";
import Card from "../components/Card";

const categoryNames: Record<string, { nepali: string; english: string }> = {
  news: { nepali: "समाचार", english: "News" },
  politics: { nepali: "राजनीति", english: "Politics" },
  society: { nepali: "समाज", english: "Society" },
  economy: { nepali: "अर्थतन्त्र", english: "Economy" },
  technology: { nepali: "विज्ञान प्रविधि", english: "Technology" },
  arts: { nepali: "कला साहित्य", english: "Arts" },
  sports: { nepali: "खेलकुद", english: "Sports" },
  world: { nepali: "विश्व", english: "World" },
  podcast: { nepali: "पोडकास्ट", english: "Podcast" },
  opinion: { nepali: "विचार", english: "Opinion" },
  multimedia: { nepali: "मल्टिमिडिया", english: "Multimedia" },
  others: { nepali: "अन्य", english: "Others" },
  international: { nepali: "अन्तराष्ट्रिय", english: "International" },
  "health-and-lifestyle": { nepali: "स्वास्थ्य/जीवन शैली", english: "Health & Lifestyle" },
};

// Maps URL slugs to WordPress category slugs when they differ
const wpSlugMap: Record<string, string> = {
  economy: "business",
  technology: "science-and-technology",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category).toLowerCase();
  
  // Map URL slug to the actual WordPress category slug
  const wpCategorySlug = wpSlugMap[decodedCategory] || decodedCategory;
  
  // Fetch posts dynamically by category name
  const rawPosts = await fetchPostsByCategory(wpCategorySlug, 15);
  const posts = rawPosts.map(mapWpPost);
  
  const displayNames = categoryNames[decodedCategory] || {
    nepali: decodedCategory.toUpperCase(),
    english: decodedCategory,
  };

  return (
    <section className="pt-44 w-full">
      <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">

        {/* Section title */}
        <div className="flex justify-center mb-6 md:mb-8 pb-3 md:pb-4 flex-col">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-nepal-black font-nepali-serif">
            {displayNames.nepali} <span className="text-gray-500 font-poppins text-lg font-normal">/ {displayNames.english}</span>
          </h2>
          <h1 className="bg-nepal-red h-[3px] rounded-none w-[20%] mt-2"></h1>
        </div>

        {/* Grid cards */}
        <div className="flex flex-col md:flex-wrap md:flex-row lg:grid grid-cols-3 xl:grid-cols-4 justify-start gap-6 md:gap-8">
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
    </section>
  );
}
