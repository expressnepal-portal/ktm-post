export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import * as cheerio from "cheerio";

import { Inter } from "next/font/google";
import "./globals.css";
import NewsImage from "./components/NewsImage";

import {
  fetchHomePagePosts,
  fetchPosts,
  Post as WordPressPost,
} from "@/lib/wordpress";
import BreakingNews from "./components/BreakingNews";
import Card from "./components/Card";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

interface Post {
  id: string;
  uri: string | null;
  title: string | null;
  slug: string;
  status: string;
  link: string;
  date: string;
  content: string | null;
  featuredImage?: string | null;
  excerpt?: string | null;
  images?: string[];
}

export async function getPosts(page: number = 1): Promise<Post[]> {
  try {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://www.nepalvoices.com"
        : "http://localhost:300x0";

    const apiUrl = `${baseUrl}/api/posts?page=${page}`;
    const res = await fetch(apiUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return [];
    const posts = await res.json();
    if (!Array.isArray(posts)) return [];

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export function decodeHtmlEntities(text: string | null): string {
  if (!text) return "No preview available.";

  const decodedText = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "...");

  return decodedText;
}

export function getCleanContent(
  content: string | null,
  maxLength: number = 200
): string {
  if (!content) return "No preview available.";

  const decodedContent = decodeHtmlEntities(content);
  const cleanText = decodedContent
    .replace(/<[^>]*>/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\b\d+\/\d+\b/g, "")
    .replace(/\b\d+ of \d+\b/gi, "")
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(
      /\b(?:Photo|Image|Source|Credit|Getty|Reuters|AFP|AP|PTI)\b.*/gi,
      ""
    )
    .replace(/\s+\./g, ".")
    .replace(/\s+,/g, ",")
    .trim();

  if (cleanText.length > maxLength) {
    const truncated = cleanText.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf(".");
    const lastQuestion = truncated.lastIndexOf("?");
    const lastExclamation = truncated.lastIndexOf("!");
    const breakPoint = Math.max(lastPeriod, lastQuestion, lastExclamation);

    if (breakPoint > maxLength * 0.5)
      return truncated.substring(0, breakPoint + 1) + "..";
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.7)
      return truncated.substring(0, lastSpace) + "...";
    return truncated + "...";
  }

  return cleanText;
}

export function getCleanTitle(title: string | null): string {
  if (!title) return "Untitled Post";
  const decodedTitle = decodeHtmlEntities(title);
  return decodedTitle
    .replace(/\b\d+\/\d+\b/g, "")
    .replace(/\b\d+ of \d+\b/gi, "")
    .replace(/\[[^\]]*\]/g, "")
    .trim();
}

// export function extractImagesFromContent(content: string | null): string[] {
//   if (!content) return [];
//   const imageUrls: string[] = [];
//   const imgRegex = /<img[^>]+src="([^">]+)"/g;
//   let match;
//   while ((match = imgRegex.exec(content)) !== null)
//     if (match[1] && match[1].startsWith("http")) imageUrls.push(match[1]);
//   return imageUrls;
// }

export function extractImagesFromContent(content: string | null): string[] {
  if (!content) return [];

  const $ = cheerio.load(content);
  const images: string[] = [];

  $("img").each((_, img) => {
    let src =
      $(img).attr("data-src") ||
      $(img).attr("data-lazy-src") ||
      $(img).attr("src");

    if (!src) return;

    // ignore placeholder base64
    if (src.startsWith("data:image")) {
      src = $(img).attr("data-src") || $(img).attr("data-lazy-src") || "";
    }

    if (!src) return;

    if (src.startsWith("//")) src = `https:${src}`;
    if (src.startsWith("/")) src = `http://cms.bodhiberry.com${src}`;

    images.push(src);
  });

  return [...new Set(images)];
}
export function mapWpPost(post: WordPressPost): Post {
  return {
    id: post.id,
    uri: post.uri,
    title: post.title,
    slug: post.slug,
    status: post.status,
    link: post.link,
    date: post.date,
    content: post.content,
    excerpt: post.excerpt,
    featuredImage: post.featuredImage?.node?.sourceUrl || null,
    images: extractImagesFromContent(post.content),
  };
}
export function getPostUrl(post: { slug: string }): string {
  return `/news/${post.slug}`;
}

export default async function HomePage() {
  // let initialPosts: Post[] = [];

  // try {
  //   initialPosts = await getPosts(1);
  //   initialPosts = initialPosts.map((post) => ({
  //     ...post,
  //     images: extractImagesFromContent(post.content),
  //   }));
  // } catch (error) {
  //   console.error("Error in HomePage:", error);
  // }

  // if (initialPosts.length === 0) {
  //   return (
  //     <div
  //       className={`${inter.className} min-h-screen text-nepal-black w-full gradient-white-to-orange`}
  //     >
  //       <div className="pt-32 md:pt-48 lg:pt-64"></div>
  //       <div className="flex items-center justify-center min-h-[60vh] w-full px-mobile-safe">
  //         <div className="text-center">
  //           <h1 className="text-3xl md:text-4xl font-bold mb-4">
  //             <span className="text-nepal-black">Nepal</span>
  //             <span className="text-nepal-orange"> Voices</span>
  //           </h1>
  //           <p className="text-gray-600">
  //             Unable to load news content. Please check the console for errors.
  //           </p>
  //         </div>
  //       </div>
  //       <div className="h-24 bg-transparent"></div>
  //       <Footer />
  //     </div>
  //   );
  // }
  // const { featured, trending, latest } = await fetchHomePagePosts();

  // const featuredPost = initialPosts[0];
  // const secondaryPosts = initialPosts.slice(1, 4);
  // const trendingPosts = initialPosts.slice(4, 10);
  // const latestPosts = initialPosts.slice(10);
  const { featured, trending, latest, breaking } = await fetchHomePagePosts();

  const featuredPost = featured[0] ? mapWpPost(featured[0]) : null;

  const secondaryPosts = latest.slice(1, 4).map(mapWpPost);

  const Posts = await fetchPosts(6);
  const posts = Posts.map(mapWpPost);
  const trendingPosts = trending.map(mapWpPost);
  const latestPosts = latest.map(mapWpPost);
  console.log("this is images form content ", posts);
  return (
    <div
      className={`${inter.className} min-h-screen text-nepal-black overflow-x-hidden w-full gradient-white-to-orange`}
    >
{breaking.length > 0 && (
  <div className="pt-28 md:pt-8 lg:pt-16">
    {breaking.slice(0, 3).map((item) => {

      return (
        <BreakingNews
          key={item.slug}
          slug={item.slug}
          title={getCleanTitle(item.title)}
        />
      );
    })}
  </div>
)}

      <div></div>
      <main className="w-full">
        <div className="h-8 md:h-12 lg:h-20 bg-transparent"></div>

        {featuredPost ? (
          <div>
            {/* Featured + Latest */}
            {featuredPost && (
            <section className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-14 w-full max-w-[1920px] mx-auto px-mobile-safe">
              <div className="lg:col-span-2 group cursor-pointer w-full">
                <a href={getPostUrl(featuredPost)} className="block w-full h-full">
                  <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-white shadow-lg md:shadow-2xl hover:shadow-xl md:hover:shadow-3xl transition-all duration-500 w-full h-full min-h-[450px] md:min-h-[550px] lg:min-h-[650px] border-2 border-gray-300 p-6 md:p-7 lg:p-8">
                    {(() => {
  const contentImages = extractImagesFromContent(featuredPost.content); // use similar helper
  const featuredImageUrl = featuredPost.featuredImage;
  const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;
                      if (thumbnailImage) {
                        return (
                          <div className="absolute inset-0 w-full h-full">
                            <NewsImage
                              post={featuredPost}
                              images={thumbnailImage ? [thumbnailImage] : []}
                              className="w-full h-full object-cover"
                              fallbackGradient="bg-gradient-to-br from-gray-200 to-gray-300"
                              isFeatured={true}
                            />
                          </div>
                        );
                      }
        
                      return null;
                    })()}
        
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12 z-10 bg-linear-to-t from-nepal-black/90 via-nepal-black/50 to-transparent">
                      <span className="bg-nepal-orange text-white px-5 py-2 md:px-7 md:py-3 rounded-lg text-sm md:text-base font-bold uppercase tracking-wide inline-block mb-5 md:mb-7 shadow-lg">
                        Featured Story
                      </span>
                      <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white mb-5 md:mb-7 lg:mb-9 leading-tight">
                        {getCleanTitle(featuredPost.title)}
                      </h2>
                      <p className="text-gray-200 text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed mb-5 md:mb-7 lg:mb-9 line-clamp-3 md:line-clamp-4">
                        {getCleanContent(featuredPost.content, 200)}
                      </p>
                    </div>
                  </div>
                </a>
              </div>
        
              {/* Secondary posts on right */}
              <div className="flex flex-col gap-2 space-y-10 md:space-y-12 w-full">
                {secondaryPosts.map((post) => {
                  const contentImages = extractImagesFromContent(post.content);
                  const featuredImageUrl = post.featuredImage;
                  const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;
        
                  return (
                    <a
                      key={post.id}
                      href={getPostUrl(post)}
                      className="group cursor-pointer bg-transparent rounded-xl md:rounded-2xl shadow-sm md:shadow-md hover:shadow-xl md:hover:shadow-2xl transition-all duration-100 overflow-hidden w-full block px-2 md:px-3 lg:px-4 py-2 lg:py-4"
                    >
                      <div className="flex flex-col h-full">
                        <div className="shrink-0 w-full h-40 md:h-44 lg:h-52 bg-gray-100 overflow-hidden">
                          <NewsImage
                            post={post}
                            images={thumbnailImage ? [thumbnailImage] : []}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-100"
                            fallbackGradient="bg-gradient-to-br from-gray-200 to-gray-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0 py-4 px-2 flex flex-col">
                          <div className="space-y-3 md:space-y-4">
                            <h3 className="font-bold text-lg md:text-xl leading-tight transition-colors duration-300 line-clamp-2 md:line-clamp-3 group-hover:bg-linear-to-r group-hover:from-[#CC0001] group-hover:to-[#004AAD] group-hover:text-transparent group-hover:bg-clip-text">
                              {getCleanTitle(post.title)}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
            )}
          </div>
        ) : (
          <section className="pt-20 md:pt-0 w-full">
            <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">
              {/* Section title */}
              <div className="flex items-center mb-6 md:mb-8 border-b-4 border-nepal-orange pb-3 md:pb-4">
                <h2 className="text-2xl md:text-3xl pl-6 md:pl-0 lg:text-4xl font-bold text-nepal-black">
                  News
                </h2>
              </div>

              <div className="h-4 md:h-6" />

              {/* FLEX GRID: professional cards */}
              <div className="flex flex-col md:flex-wrap md:flex-row 2xl:grid grid-cols-5 justify-start gap-6 md:gap-8 lg:gap-10">
                {posts.length > 0 ? (
                  posts.map((post) => {
                   
              const contentImages = extractImagesFromContent(post.content);
              const featuredImageUrl = post.featuredImage;
              const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;

                    return (
                      <Card
                        link={getPostUrl(post)}
                        key={post.id}
                        images={thumbnailImage ? [thumbnailImage] : []}
                        title={getCleanTitle(post.title)}
                        content={getCleanContent(post.content, 150)}
                      />
                    );
                  })
                ) : (
                  <div className="text-2xl md:text-3xl text-center text-gray-600 flex items-center justify-center h-[50vh]">
                    No Content Available For Now
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Trending */}
        <div className="h-12 md:h-16 lg:h-20 bg-transparent"></div>
        {trendingPosts.length > 0 && (
          <section className="w-full">
            <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">
              <div className="flex items-center mb-6 md:mb-8 border-b-4 border-nepal-orange pb-3 md:pb-4">
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-nepal-black">
                  Trending Now
                </h2>
              </div>

              <div className="h-4 md:h-6 bg-transparent"></div>

              <div className="relative w-full">
                <div className="flex overflow-x-auto pb-6 md:pb-8 gap-7 md:gap-9 scrollbar-hide">
                  {trendingPosts.map((post) =>{
                    const contentImages = extractImagesFromContent(post.content);
                    const featuredImageUrl = post.featuredImage;
                    const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;
                    return (
                      <Card
                      link={getPostUrl(post)}
                      key={post.id}
                      images={thumbnailImage ? [thumbnailImage] : []}
                      title={getCleanTitle(post.title)}
                      content={getCleanContent(post.content, 150)}
                    />
                    )
                    
                  })}
                </div>

                <div className="absolute top-0 right-0 w-8 md:w-12 lg:w-16 h-full bg-linear-to-l from-white to-transparent pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-8 md:w-12 lg:w-16 h-full bg-linear-to-r from-white to-transparent pointer-events-none"></div>
              </div>
            </div>
          </section>
        )}

        {/* Latest */}
        <div className="h-12 md:h-16 lg:h-20 bg-transparent"></div>
        {latestPosts.length > 0 && (
          <section className="w-full">
            <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">
              <div className="flex items-center mb-6 md:mb-8 border-b-4 border-nepal-black pb-3 md:pb-4">
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-nepal-black">
                  Latest Stories
                </h2>
              </div>

              <div className="h-4 md:h-6 bg-transparent"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9 md:gap-11 lg:gap-13 w-full">
                {latestPosts.map((post) => {
                                const contentImages = extractImagesFromContent(post.content);
                                const featuredImageUrl = post.featuredImage;
                                const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;
                  return(

                  <a
                    key={post.id}
                    href={getPostUrl(post)}
                    className="group cursor-pointer bg-white rounded-xl md:rounded-2xl p-7 md:p-8 lg:p-9 shadow-sm md:shadow-lg hover:shadow-md md:hover:shadow-lg transition-all duration-100 hover:border-nepal-orange/50 w-full block"
                  >
                    <div className="flex gap-5 md:gap-6 lg:gap-7 w-full items-start">
                      <div className="flex-1 min-w-0 space-y-4 md:space-y-5">
                        <h3 className="font-bold text-base md:text-lg leading-tight transition-colors duration-100 line-clamp-2 mb-3 md:mb-4 group-hover:bg-linear-to-r group-hover:from-[#CC0001] group-hover:to-[#004AAD] group-hover:text-transparent group-hover:bg-clip-text">
                          {getCleanTitle(post.title)}
                        </h3>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3">
                          {getCleanContent(post.content, 120)}
                        </p>
                      </div>

                      <div className="shrink-0 w-18 h-18 md:w-20 md:h-20 lg:w-22 lg:h-22 bg-gray-100 rounded-lg md:rounded-xl overflow-hidden shadow-md md:shadow-lg group-hover:shadow-xl md:group-hover:shadow-xl transition-shadow duration-100">
                        <NewsImage
                          post={post}
                          images={thumbnailImage ? [thumbnailImage] : []}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-100"
                          fallbackGradient="bg-gradient-to-br from-gray-200 to-gray-300"
                        />
                      </div>
                    </div>
                  </a>
                )})}
              </div>
            </div>
          </section>
        )}

        <div className="h-16 md:h-12 lg:h-24 bg-transparent"></div>
      </main>
    </div>
  );
}
