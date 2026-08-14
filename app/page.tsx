export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import * as cheerio from "cheerio";
import NepaliCalendarWidget from "./components/NepaliCalendarWidget";
import UpcomingHolidays from "./components/UpcomingHolidays";
import ForexRatesWidget from "./components/ForexRatesWidget";
import { Suspense } from "react";

import { Inter } from "next/font/google";
import "./globals.css";
import NewsImage from "./components/NewsImage";

import {
    fetchPosts,
    fetchHomePagePosts,
    fetchPostsByCategory,
    type Post as WordPressPost,
} from "@/lib/wordpress";
import BreakingNews from "./components/BreakingNews";
import SidebarAds from "./components/SidebarAds";
import BannerAdSlot from "./components/BannerAdSlot";
import Card from "./components/Card";
import Link from "next/link";
import Image from "next/image";
import React from "react";

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
    author?: {
        node?: {
            name?: string;
        };
    } | null;
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
    maxLength: number = 200,
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
            "",
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
        if (src.startsWith("/")) src = `https://cms.ktmpost.com${src}`;

        images.push(src);
    });

    return [...new Set(images)];
}
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
    categorySlug?: string;
    author?: {           // 👈 add this block
        node?: {
            name?: string;
        };
    } | null;
}

export function mapWpPost(post: WordPressPost): Post {
    const catSlug = post.categories?.nodes?.[0]?.slug;
    const categorySlug =
        catSlug === "business"
            ? "economy"
            : catSlug === "science-and-technology"
                ? "technology"
                : catSlug;

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
        categorySlug: categorySlug || undefined,
        author: post.author,
    };
}

import { transliterateSlug } from "@/lib/transliterate";

export function getPostUrl(post: {
    slug: string;
    categorySlug?: string;
}): string {
    const cleanSlug = transliterateSlug(post.slug);
    if (
        post.categorySlug &&
        post.categorySlug !== "latest-news" &&
        post.categorySlug !== "featured-news" &&
        post.categorySlug !== "breaking-news"
    ) {
        return `/${post.categorySlug}/${cleanSlug}`;
    }
    return `/news/${cleanSlug}`;
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
    const {
        featured,
        trending,
        latest,
        breaking,
        economy,
        politics,
        sports,
        international,
        opinion,
        multimedia,
        legal,
        health,
        exclusive,
    } = await fetchHomePagePosts();
    const Posts = await fetchPosts(10);
    const posts = Posts.map(mapWpPost);

    const rawExclusivePosts = await fetchPostsByCategory("exclusive", 7);
    const exclusivePosts =
        rawExclusivePosts && rawExclusivePosts.length > 0
            ? rawExclusivePosts.map(mapWpPost)
            : exclusive && exclusive.length > 0
                ? exclusive.map(mapWpPost)
                : [];

    // Featured hero = first economy post; secondary sidebar = next 3 economy posts
    // (Falls back gracefully to latest posts if economy category has 0 posts in WordPress)
    const economyPool =
        economy && economy.length > 0
            ? economy.map(mapWpPost)
            : latest && latest.length > 0
                ? latest.map(mapWpPost)
                : posts;

    const featuredPost = economyPool[0] || null;
    const secondaryPosts = economyPool.slice(1, 4);

    const rawNewsPosts = await fetchPostsByCategory("news", 7);
    const newsPosts = rawNewsPosts.map(mapWpPost);
    const politicsPosts =
        politics && politics.length > 0
            ? politics.map(mapWpPost)
            : latest.length > 0
                ? latest.map(mapWpPost)
                : posts;
    const sportsPosts = sports && sports.length > 0 ? sports.map(mapWpPost) : [];
    const multimediaPosts =
        multimedia && multimedia.length > 0
            ? multimedia.map(mapWpPost)
            : [];
    const opinionPosts =
        opinion && opinion.length > 0
            ? opinion.map(mapWpPost)
            : posts.slice(0, 4);
    const internationalPosts =
        international && international.length > 0
            ? international.map(mapWpPost)
            : [];
    const healthCategoryPosts = await fetchPostsByCategory("health-and-lifestyle", 5);
    const healthPostsList =
        healthCategoryPosts && healthCategoryPosts.length > 0
            ? healthCategoryPosts.map(mapWpPost)
            : health && health.length > 0
                ? health.map(mapWpPost)
                : [];
    const rawLegalPosts = await fetchPostsByCategory("legal", 3);
    const legalPosts =
        rawLegalPosts && rawLegalPosts.length > 0
            ? rawLegalPosts.map(mapWpPost)
            : legal && legal.length > 0
                ? legal.map(mapWpPost)
                : [];
    return (
        <div
      className= {`${inter.className} min-h-screen text-nepal-black overflow-x-hidden w-full gradient-white-to-orange`
}
    >
{
    exclusivePosts.length > 0 && (
        <section className="w-full pt-4 md:pt-6 mb-8">
            <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">
                {/* ── SINGLE POST: full-width hero ── */ }
            {
    exclusivePosts.length === 1 && (() => {
        const post = exclusivePosts[0];
        const contentImages = extractImagesFromContent(post.content);
        const featuredImageUrl = post.featuredImage;
        const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;

        return (
            <Link href={ getPostUrl(post) } className="block group">
                { thumbnailImage && (
                    <div className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[480px] xl:h-[540px] 2xl:h-[600px] overflow-hidden rounded-xs bg-gray-100 shadow-xs">
                        <img
                        src={ thumbnailImage }
        alt = { getCleanTitle(post.title) }
        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-10">
                <span className="bg-[#9365c4] text-white px-3 py-1.5 text-xs md:text-sm font-bold rounded-xs tracking-wide shadow-md font-nepali-serif">
                    विशेष खबर
                        </span>
                        </div>
                        </div>
                  )
    }
                  <h3 className="mt-4 md:mt-5 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-black tracking-tight group-hover:text-purple-700 transition-colors font-nepali-serif leading-snug">
        { getCleanTitle(post.title) }
        </h3>
        </Link>
              );
}) ()}

{/* ── 2-3 POSTS: equal-width grid, no hero/sidebar split ── */ }
{
    exclusivePosts.length >= 2 && exclusivePosts.length <= 3 && (
        <div className={ `grid grid-cols-1 sm:grid-cols-2 ${exclusivePosts.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-6 lg:gap-8` }>
        {
            exclusivePosts.map((post) => {
                const contentImages = extractImagesFromContent(post.content);
                const featuredImageUrl = post.featuredImage;
                const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;

                return (
                    <Link href={ getPostUrl(post) } key={ post.id } className="flex flex-col group">
                        { thumbnailImage && (
                            <div className="relative w-full h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px] xl:h-[360px] overflow-hidden rounded-xs bg-gray-100 shadow-xs">
                                <img
                            src={ thumbnailImage }
                alt = { getCleanTitle(post.title)
        }
    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
        <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-[#9365c4] text-white px-2.5 py-1 text-xs md:text-sm font-bold rounded-xs tracking-wide shadow-md font-nepali-serif">
                विशेष खबर
                    </span>
                    </div>
                    </div>
                      )
}
<h3 className="mt-3 text-lg sm:text-xl md:text-2xl font-black text-black tracking-tight group-hover:text-purple-700 transition-colors font-nepali-serif leading-snug">
    { getCleanTitle(post.title) }
    </h3>
    </Link>
                  );
                })}
</div>
            )}

{/* ── 4+ POSTS: hero + sidebar grid ── */ }
{
    exclusivePosts.length >= 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT: Hero post */ }
    {
        (() => {
            const post = exclusivePosts[0];
            const contentImages = extractImagesFromContent(post.content);
            const featuredImageUrl = post.featuredImage;
            const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;

            return (
                <Link
                      href={ getPostUrl(post) }
            className="lg:col-span-6 2xl:col-span-7 flex flex-col group h-full"
                >
                { thumbnailImage && (
                    <div className="relative w-full h-[240px] sm:h-[320px] md:h-[380px] lg:h-[400px] xl:h-[460px] 2xl:h-[520px] overflow-hidden rounded-xs bg-gray-100 shadow-xs">
                        <img
                            src={ thumbnailImage }
            alt = { getCleanTitle(post.title) }
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-10">
                    <span className="bg-[#9365c4] text-white px-3 py-1.5 text-xs md:text-sm font-bold rounded-xs tracking-wide shadow-md font-nepali-serif">
                        विशेष खबर
                            </span>
                            </div>
                            </div>
                      )
        }
                      <h3 className="mt-3 md:mt-4 text-xl sm:text-2xl md:text-3xl xl:text-4xl font-black text-black tracking-tight group-hover:text-purple-700 transition-colors font-nepali-serif leading-snug">
            { getCleanTitle(post.title) }
            </h3>
            </Link>
                  );
    }) ()
}

{/* RIGHT: Smaller posts grid */ }
<div className={ `lg:col-span-6 2xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 ${exclusivePosts.length >= 7 ? "xl:grid-cols-3" : "xl:grid-cols-2"} gap-4 lg:gap-5` }>
{
    exclusivePosts.slice(1, 7).map((post) => {
        const contentImages = extractImagesFromContent(post.content);
        const featuredImageUrl = post.featuredImage;
        const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;

        return (
            <Link
                        href={ getPostUrl(post) }
        key={ post.id }
        className="flex flex-col group h-full"
            >
            { thumbnailImage && (
                <div className="relative w-full aspect-video sm:h-[130px] md:h-[140px] lg:h-[150px] overflow-hidden rounded-xs bg-gray-100 shadow-xs">
                    <img
                              src={ thumbnailImage }
        alt = { getCleanTitle(post.title)
}
className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
    />
    <div className="absolute bottom-2 left-2 z-10">
        <span className="bg-[#9365c4] text-white px-1.5 py-0.5 text-[10px] font-bold rounded-xs tracking-wide shadow-sm font-nepali-serif">
            विशेष खबर
                </span>
                </div>
                </div>
                        )}
<h3 className="mt-2 text-sm md:text-base font-bold text-nepal-black group-hover:text-purple-700 transition-colors line-clamp-2 font-nepali-serif leading-snug">
    { getCleanTitle(post.title) }
    </h3>
    </Link>
                    );
                  })}
</div>
    </div>
            )}
</div>
    </section>
      )}

{
    breaking.length > 0 && (
        <div className="pt-2 md:pt-4 w-full max-w-[1920px] mx-auto px-mobile-safe">
        {
            breaking.slice(0, 3).map((item, index) => {
                const contentImages = extractImagesFromContent(item.content);
                const featuredImageUrl = item.featuredImage?.node?.sourceUrl;
                const thumbnailImage =
                    featuredImageUrl ?? contentImages[0] ?? undefined;
                const excerpt = getCleanContent(item.excerpt || item.content, 180);

                return (
                    <React.Fragment key= { item.slug } >
                    <Suspense fallback={ null }>
                        <BannerAdSlot
              index={ index }
                fallbackImage = {
                    index === 0
                    ? "/banner/ncell.gif"
                    : index === 1
                        ? "/banner/bizmandu.gif"
                        : "/banner/banner-3.png"
            }
            />
                </Suspense>
                < BreakingNews
            slug = { item.slug }
            title = { getCleanTitle(item.title)
        }
    image = { thumbnailImage }
    excerpt = { excerpt }
        />
        </React.Fragment>
      );
})}
</div>
)}

<main className="w-full">
    <div className="h-10 md:h-14 lg:h-16 bg-transparent"> </div>
{/*Banner Section*/ }


{/* Breaking News - 100% Width Red Marquee */ }

{/* News Section */ }
<div className="h-6 md:h-8 bg-transparent"> </div>
{
    newsPosts.length > 0 && (
        <section className="w-full">
            <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">
                <div className="flex items-center mb-5 border-b border-gray-200 pb-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-nepal-black font-nepali-serif">
                        समाचार{ " " }
    <span className="text-gray-400 font-poppins text-sm font-normal">
                    / News
        </span>
        </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 md:gap-9 pb-6 md:pb-8">
            {/* LEFT: Big featured post */ }
    {
        newsPosts[0] &&
        (() => {
            const post = newsPosts[0];
            const contentImages = extractImagesFromContent(
                post.content,
            );
            const featuredImageUrl = post.featuredImage;
            const thumbnailImage =
                featuredImageUrl ?? contentImages[0] ?? undefined;

            return (
                <Link
                        href={ getPostUrl(post) }
            className="flex flex-col h-full group"
                >
                { thumbnailImage && (
                    <div className="w-full h-[220px] sm:h-[300px] md:h-[380px] lg:h-[420px] xl:h-[480px] overflow-hidden rounded-sm bg-gray-100">
                        <img
                              src={ thumbnailImage }
            alt = { getCleanTitle(post.title) }
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                </div>
                        )
        }
                        <h3 className="mt-3 text-lg md:text-2xl font-bold text-nepal-black group-hover:text-nepal-red transition-colors font-nepali-serif">
            { getCleanTitle(post.title) }
            </h3>
            <p className="mt-2 text-sm md:text-base text-gray-600 line-clamp-3 leading-relaxed">
                { getCleanContent(post.content, 150) }
                </p>
                </Link>
                    );
    }) ()
}

{/* RIGHT: 6 smaller posts */ }
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
{
    newsPosts.slice(1, 7).map((post) => {
        const contentImages = extractImagesFromContent(
            post.content,
        );
        const featuredImageUrl = post.featuredImage;
        const thumbnailImage =
            featuredImageUrl ?? contentImages[0] ?? undefined;

        return (
            <Link
                        href={ getPostUrl(post) }
        key={ post.id }
        className="flex flex-col group"
            >
            { thumbnailImage && (
                <div className="w-full aspect-video sm:h-[140px] md:h-[150px] overflow-hidden rounded-sm bg-gray-100">
                    <img
                              src={ thumbnailImage }
        alt = { getCleanTitle(post.title)
}
className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
    />
    </div>
                        )}
<h3 className="mt-2.5 text-sm md:text-base font-bold text-nepal-black group-hover:text-nepal-red transition-colors line-clamp-2 font-nepali-serif leading-snug">
    { getCleanTitle(post.title) }
    </h3>
    </Link>
                    );
                  })}
</div>
    </div>
    </div>
    </section>
        )}
{
    featuredPost ? (
        <div>
        {/* Featured + Latest */ }
            {
        featuredPost && (
            <section className="w-full">
                <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">
                    <div className="flex items-center mb-6 md:mb-8 border-b-4 border-nepal-orange pb-3 md:pb-4">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-nepal-black font-nepali-serif">
                            अर्थतन्त्र{ " " }
        <span className="text-gray-500 font-poppins text-lg font-normal">
                        / Economy
            </span>
            </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 w-full">
                <div className="lg:col-span-2 group cursor-pointer w-full">
                    <a
                      href={ getPostUrl(featuredPost) }
        className="block w-full h-full"
            >
            <div className="relative overflow-hidden bg-white border border-gray-200 transition-colors duration-300 w-full h-full min-h-[450px] md:min-h-[550px] lg:min-h-[650px] p-6 md:p-8">
                {(() => {
                    const contentImages = extractImagesFromContent(
                        featuredPost.content,
                    );
                    const featuredImageUrl = featuredPost.featuredImage;
                    const thumbnailImage =
                        featuredImageUrl ?? contentImages[0] ?? undefined;
                    if (thumbnailImage) {
                        return (
                            <div className= "absolute inset-0 w-full h-full">
                            <NewsImage
                                  post={ featuredPost }
                        images = {
                            thumbnailImage? [thumbnailImage]: []
                        }
                        className="w-full h-full object-cover"
                        fallbackGradient = "bg-gradient-to-br from-gray-200 to-gray-300"
                        isFeatured = { true}
                            />
                            </div>
                            );
    }

    return null;
}) ()}

<div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10 z-10 bg-linear-to-t from-nepal-black/90 via-nepal-black/50 to-transparent">
    <span className="bg-nepal-red text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider inline-block mb-4">
        अर्थ
        </span>
        <h2 className="font-nepali-serif text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-nepal-red transition-colors duration-200">
            { getCleanTitle(featuredPost.title) }
            </h2>
            <p className="text-gray-200 font-poppins text-sm md:text-base leading-relaxed mb-4 line-clamp-3">
                { getCleanContent(featuredPost.content, 200) }
                </p>
                </div>
                </div>
                </a>
                </div>

{/* Secondary posts on right */ }
<div className="flex flex-col gap-6 w-full">
{
    secondaryPosts.map((post) => {
        const contentImages = extractImagesFromContent(
            post.content,
        );
        const featuredImageUrl = post.featuredImage;
        const thumbnailImage =
            featuredImageUrl ?? contentImages[0] ?? undefined;

        return (
            <a
                          key= { post.id }
        href = { getPostUrl(post) }
        className="group cursor-pointer bg-white border border-gray-200 transition-colors duration-200 w-full block p-4"
            >
            <div className="flex flex-col h-full">
                <div className="shrink-0 w-full h-40 md:h-44 lg:h-52 bg-gray-100 overflow-hidden">
                    <NewsImage
                                post={ post }
        images = { thumbnailImage? [thumbnailImage]: [] }
        className="w-full h-full object-cover"
        fallbackGradient = "bg-gradient-to-br from-gray-200 to-gray-300"
            />
            </div>
            <div className="flex-1 min-w-0 py-3 flex flex-col">
                <div className="space-y-2">
                    <h3 className="font-nepali-serif font-bold text-lg md:text-xl text-gray-900 leading-tight transition-colors duration-200 line-clamp-2 md:line-clamp-3 group-hover:text-nepal-red">
                        { getCleanTitle(post.title)
}
    </h3>
    </div>
    </div>
    </div>
    </a>
                      );
                    })}
</div>
    </div>
    </div>
    </section>
            )}
</div>
        ) : (
    <section className= "pt-20 md:pt-0 w-full">
    <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">
        <div className="flex items-center mb-6 md:mb-8 border-b-1 border-gray-200 pb-3 md:pb-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-nepal-black font-nepali-serif">
                राजनीति{ " " }
<span className="text-gray-500 font-poppins text-lg font-normal">
                    / Politics
    </span>
    </h2>
    </div>
{/* Section title */ }
<div className="flex items-center mb-6 md:mb-8 border-b-4 border-nepal-orange pb-3 md:pb-4">
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-nepal-black">
        News
        </h2>
        </div>

        <div className="h-4 md:h-6" />

            {/* FLEX GRID: professional cards */ }
            <div className="flex flex-col md:flex-wrap md:flex-row 2xl:grid grid-cols-5 justify-start gap-6 md:gap-8 lg:gap-10">
            {
                posts.length > 0 ? (
                    posts.map((post) => {
                        const contentImages = extractImagesFromContent(
                            post.content,
                        );
                        const featuredImageUrl = post.featuredImage;
                        const thumbnailImage =
                            featuredImageUrl ?? contentImages[0] ?? undefined;

                        return (
                            <Card
                        link= { getPostUrl(post) }
                        key={ post.id }
                        images = { thumbnailImage? [thumbnailImage]: [] }
                        title = { getCleanTitle(post.title)}
content = { getCleanContent(post.content, 150) }
    />
                    );
                  })
                ) : (
    <div className= "text-2xl md:text-3xl text-center text-gray-600 flex items-center justify-center h-[50vh]">
    No Content Available For Now
        </div>
                )}
</div>
    </div>
    </section>
        )}

{/* Politics Section */ }
<div className="h-10 md:h-14 lg:h-16 bg-transparent"> </div>
{
    politicsPosts.length > 0 && (
        <section className="w-full">
            <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">
                <div className="flex items-center mb-6 md:mb-8 border-b-2 border-gray-200 pb-3 md:pb-4">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-nepal-black font-nepali-serif">
                        राजनीति{ " " }
    <span className="text-gray-500 font-poppins text-lg font-normal">
                    / Politics
        </span>
        </h2>
        </div>

        <div className="h-2 md:h-2 bg-transparent"> </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9 md:gap-11 lg:gap-13 w-full">
            {
                politicsPosts.map((post) => {
                    const contentImages = extractImagesFromContent(post.content);
                    const featuredImageUrl = post.featuredImage;
                    const thumbnailImage =
                        featuredImageUrl ?? contentImages[0] ?? undefined;
                    return (
                        <a
                      key= { post.id }
                    href = { getPostUrl(post) }
                    className="group cursor-pointer bg-white border border-gray-200 p-6 md:p-7 transition-colors duration-150 w-full block shadow-xs hover:shadow-md"
                        >
                        <div className="flex gap-5 md:gap-6 w-full items-start">
                            <div className="flex-1 min-w-0 space-y-3 pr-2">
                                <h3 className="font-nepali-serif font-bold text-lg md:text-xl text-gray-900 leading-snug transition-colors duration-150 line-clamp-2 mb-2 group-hover:text-nepal-red">
                                    { getCleanTitle(post.title)
            }
                </h3>
                <p className="text-gray-600 font-poppins text-sm md:text-base leading-relaxed line-clamp-2 pt-1">
                    { getCleanContent(post.content, 120) }
                    </p>
                    </div>

                    <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 lg:w-26 lg:h-26 bg-gray-100 overflow-hidden rounded-sm">
                        <NewsImage
                            post={ post }
    images = { thumbnailImage? [thumbnailImage]: [] }
    className="w-full h-full object-cover"
    fallbackGradient = "bg-gradient-to-br from-gray-200 to-gray-300"
        />
        </div>
        </div>
        </a>
                  );
})}
</div>
    </div>
    </section>
        )}

{/* Three-column Category Sections: Sports, Health & Lifestyle, Multimedia */ }
<div className="h-10 md:h-14 lg:h-16 bg-transparent"> </div>
    <section className="w-full">
        <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-14">
                {/* Sports Column */ }
                <div className="flex flex-col">
                    <div className="flex items-center mb-5 border-b-4 border-nepal-orange pb-3">
                        <h2 className="text-2xl md:text-3xl font-bold text-nepal-black font-nepali-serif">
                            खेलकुद{ " " }
<span className="text-gray-500 font-poppins text-sm font-normal">
                      / Sports
    </span>
    </h2>
    </div>

{
    sportsPosts.length > 0 ? (
        <div className= "flex flex-col gap-0">
        {/* Featured first post with image */ }
                    {
        (() => {
            const post = sportsPosts[0];
            const contentImages = extractImagesFromContent(
                post.content,
            );
            const featuredImageUrl = post.featuredImage;
            const thumbnailImage =
                featuredImageUrl ?? contentImages[0] ?? undefined;
            return (
                <a href={ getPostUrl(post) } className="group block mb-5">
                    <div className="w-full h-48 md:h-52 bg-gray-100 overflow-hidden mb-3">
                        <NewsImage
                              post={ post }
            images = { thumbnailImage? [thumbnailImage]: [] }
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackGradient = "bg-gradient-to-br from-gray-200 to-gray-300"
                />
                </div>
                <h3 className="font-nepali-serif font-bold text-lg md:text-xl text-gray-900 leading-tight group-hover:text-nepal-red transition-colors duration-150 line-clamp-2">
                    { getCleanTitle(post.title) }
                    </h3>
                    </a>
                      );
        })()
    }

    {/* Remaining posts as compact list */ }
    {
        sportsPosts.slice(1, 5).map((post) => (
            <a
                        key= { post.id }
                        href = { getPostUrl(post) }
                        className="group block py-3 border-t border-gray-100"
            >
            <h3 className="font-nepali-serif font-bold text-xl text-gray-900 leading-snug group-hover:text-nepal-red transition-colors duration-150 line-clamp-2">
        { getCleanTitle(post.title)
    }
    </h3>
        </a>
                    ))
}
</div>
                ) : (
    <p className= "text-gray-400 font-poppins text-sm py-8">
    No content available
        </p>
                )}
</div>

{/* Health & Lifestyle Column */ }
<div className="flex flex-col">
    <div className="flex items-center mb-5 border-b-4 border-nepal-orange pb-3">
        <h2 className="text-2xl md:text-3xl font-bold text-nepal-black font-nepali-serif">
            स्वास्थ्य{ " " }
<span className="text-gray-500 font-poppins text-sm font-normal">
                      / Health & Lifestyle
    </span>
    </h2>
    </div>

{
    (() => {
        const healthPosts = healthPostsList;
        return healthPosts.length > 0 ? (
            <div className= "flex flex-col gap-0">
            {/* Featured first post with image */ }
                      {
            (() => {
                const post = healthPosts[0];
                const contentImages = extractImagesFromContent(
                    post.content,
                );
                const featuredImageUrl = post.featuredImage;
                const thumbnailImage =
                    featuredImageUrl ?? contentImages[0] ?? undefined;
                return (
                    <a
                            href={ getPostUrl(post) }
                className="group block mb-5"
                    >
                    <div className="w-full h-48 md:h-52 bg-gray-100 overflow-hidden mb-3">
                        <NewsImage
                                post={ post }
                images = { thumbnailImage? [thumbnailImage]: [] }
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                fallbackGradient = "bg-gradient-to-br from-gray-200 to-gray-300"
                    />
                    </div>
                    <h3 className="font-nepali-serif font-bold text-lg md:text-xl text-gray-900 leading-tight group-hover:text-nepal-red transition-colors duration-150 line-clamp-2">
                        { getCleanTitle(post.title) }
                        </h3>
                        </a>
                        );
            })()
        }

        {/* Remaining posts as compact list */ }
        {
            healthPosts.slice(1, 5).map((post) => (
                <a
                          key= { post.id }
                          href = { getPostUrl(post) }
                          className="group block py-3 border-t border-gray-100"
                >
                <h3 className="font-nepali-serif text-xl font-bold text-gray-900 leading-snug group-hover:text-nepal-red transition-colors duration-150 line-clamp-2">
            { getCleanTitle(post.title)
        }
        </h3>
            </a>
                      ))
    }
                    </div>
                  ) : (
        <p className= "text-gray-400 font-poppins text-sm py-8">
        No content available
            </p>
                  );
}) ()}
</div>

{/* International Column */ }
<div className="flex flex-col">
    <div className="flex items-center mb-5 border-b-4 border-nepal-orange pb-3">
        <h2 className="text-2xl md:text-3xl font-bold text-nepal-black font-nepali-serif">
            अन्तराष्ट्रिय{ " " }
<span className="text-gray-500 font-poppins text-sm font-normal">
                      / International
    </span>
    </h2>
    </div>

{
    internationalPosts.length > 0 ? (
        <div className= "flex flex-col gap-0">
        {/* Featured first post with image */ }
                    {
        (() => {
            const post = internationalPosts[0];
            const contentImages = extractImagesFromContent(
                post.content,
            );
            const featuredImageUrl = post.featuredImage;
            const thumbnailImage =
                featuredImageUrl ?? contentImages[0] ?? undefined;
            return (
                <a href={ getPostUrl(post) } className="group block mb-5">
                    <div className="w-full h-48 md:h-52 bg-gray-100 overflow-hidden mb-3">
                        <NewsImage
                              post={ post }
            images = { thumbnailImage? [thumbnailImage]: [] }
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackGradient = "bg-gradient-to-br from-gray-200 to-gray-300"
                />
                </div>
                <h3 className="font-nepali-serif font-bold text-lg md:text-xl text-gray-900 leading-tight group-hover:text-nepal-red transition-colors duration-150 line-clamp-2">
                    { getCleanTitle(post.title) }
                    </h3>
                    </a>
                      );
        })()
    }

    {/* Remaining posts as compact list */ }
    {
        internationalPosts.slice(1, 5).map((post) => (
            <a
                        key= { post.id }
                        href = { getPostUrl(post) }
                        className="group block py-3 border-t border-gray-100"
            >
            <h3 className="font-nepali-serif font-bold text-xl text-gray-900 leading-snug group-hover:text-nepal-red transition-colors duration-150 line-clamp-2">
        { getCleanTitle(post.title)
    }
    </h3>
        </a>
                    ))
}
</div>
                ) : (
    <p className= "text-gray-400 font-poppins text-sm py-8">
    No content available
        </p>
                )}
</div>
    </div>
    </div>
    </section>
{/* Opinion Section - 4-Column Layout */ }
<div className="h-10 md:h-14 lg:h-16 bg-transparent"> </div>
{
    opinionPosts.length > 0 && (
        <section className="w-full">
            <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">
                <div className="flex items-center mb-6 md:mb-8 border-b-4 border-nepal-orange pb-3 md:pb-4">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-nepal-black font-nepali-serif">
                        विचार{ " " }
    <span className="text-gray-500 font-poppins text-lg font-normal">
                    / Opinion
        </span>
        </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
        {
            opinionPosts.slice(0, 4).map((post) => {
                const contentImages = extractImagesFromContent(post.content);
                const featuredImageUrl = post.featuredImage;
                const thumbnailImage =
                    featuredImageUrl ?? contentImages[0] ?? undefined;
                const formattedDate = new Date(post.date).toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "numeric",
                    },
                );

                return (
                    <a
                      key= { post.id }
                href = { getPostUrl(post) }
                className="group flex flex-col cursor-pointer bg-white border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
                    >
                    {/* Image container */ }
                    <div className="w-full aspect-[4/5] bg-gray-100 overflow-hidden mb-4 border border-gray-100 relative">
                        <NewsImage
                          post={ post }
                images = { thumbnailImage? [thumbnailImage]: [] }
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                fallbackGradient = "bg-gradient-to-br from-gray-200 to-gray-300"
                    />
                    </div>

                {/* Content */ }
                <div className="flex flex-col flex-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-nepal-red mb-1.5 font-poppins">
                        विचार
                        </span>
                        <h3 className="font-nepali-serif font-bold text-lg md:text-xl text-gray-900 leading-snug group-hover:text-nepal-red transition-colors duration-150 mb-2">
                            { getCleanTitle(post.title)
        }
            </h3>
            <div className="mt-auto pt-1 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-poppins font-medium">
                <span>
                {(() => {
                    const authorName = post.author?.node?.name?.trim();
                    const isValidAuthor =
                        authorName && authorName.toLowerCase() !== "news";
                    return isValidAuthor ? authorName : "KTM Time Opinions";
                })()
}
</span>
    </div>
    </div>
    </a>
                  );
                })}
</div>
    </div>
    </section>
        )}


{/* Multimedia / Videos Section - Dark Layout */ }
<div className="h-10 md:h-14 lg:h-16 bg-transparent"> </div>
{
    multimediaPosts.length > 0 && (
        <section className="w-full bg-[#1a1a1a] py-10 md:py-14">
            <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">
                {/* Header */ }
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                        <span className="text-white"> मल्टिमिडिया </span>{" "}
                            <span className="text-nepal-red"> भिडियो </span>
                                </h2>
                                <Link
    href = "/multimedia"
    className="hidden md:flex items-center gap-2 text-white text-sm font-bold uppercase tracking-wider hover:text-nepal-red transition-colors"
        >
        View More <span aria-hidden="true">→</span>
            </Link>
            </div>

    {/* Grid */ }
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
    {
        multimediaPosts.slice(0, 4).map((post) => {
            const contentImages = extractImagesFromContent(post.content);
            const featuredImageUrl = post.featuredImage;
            const thumbnailImage =
                featuredImageUrl ?? contentImages[0] ?? undefined;
            const authorName = post.author?.node?.name?.trim();
            const displayAuthor =
                authorName && authorName.toLowerCase() !== "news"
                    ? authorName
                    : "KTM Post";

            return (
                <Link
              href={ getPostUrl(post) }
            key={ post.id }
            className="group flex flex-col"
                >
                {/* Thumbnail with play button */ }
                <div className="relative w-full aspect-video bg-gray-800 overflow-hidden">
                    { thumbnailImage && (
                        <img
                    src={ thumbnailImage }
            alt = { getCleanTitle(post.title)
    }
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
                )
}
{/* Play button overlay */ }
<div className="absolute inset-0 flex items-center justify-center">
    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white transition-colors">
        <svg
                      viewBox="0 0 24 24"
className="w-5 h-5 md:w-6 md:h-6 text-black ml-0.5"
fill = "currentColor"
    >
    <path d="M8 5v14l11-7z" />
        </svg>
        </div>
        </div>
        </div>

{/* Title + author */ }
<h3 className="mt-4 text-base md:text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-nepal-red transition-colors">
    { getCleanTitle(post.title) }
    </h3>

    </Link>
          );
        })}
</div>

{/* Mobile "View More" */ }
<Link
        href="/multimedia"
className="md:hidden flex items-center justify-center gap-2 mt-8 text-white text-sm font-bold uppercase tracking-wider hover:text-nepal-red transition-colors"
    >
    View More <span aria-hidden="true">→</span>
        </Link>
        </div>
        </section>
)}

{/* Legal Section + Calendar & Nepal at a Glance Row */ }
<div className="h-10 md:h-14 lg:h-16 bg-transparent"> </div>
    <section className="w-full">
        <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 md:gap-10">
                {/* LEFT: Legal Section (3 posts) */ }
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-6 border-b-2 border-gray-200 pb-3">
                        <h2 className="text-2xl md:text-3xl font-bold text-nepal-black font-nepali-serif">
                            कानून{ " " }
<span className="text-gray-500 font-poppins text-lg font-normal"> / Legal</span >
    </h2>
    <Link
href = "/legal"
className="text-xs font-bold text-nepal-red uppercase tracking-wider hover:underline"
    >
    थप हेर्नुहोस् →
</Link>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {
        legalPosts.map((post) => {
            const contentImages = extractImagesFromContent(post.content);
            const featuredImageUrl = post.featuredImage;
            const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;

            return (
                <Link
                        key= { post.id }
            href = { getPostUrl(post) }
            className="group flex flex-col cursor-pointer bg-white border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
                >
                <div className="w-full h-40 bg-gray-100 overflow-hidden mb-3">
                    <NewsImage
                            post={ post }
            images = { thumbnailImage? [thumbnailImage]: [] }
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackGradient = "bg-gradient-to-br from-gray-200 to-gray-300"
                />
                </div>
                <h3 className="font-nepali-serif font-bold text-base md:text-lg text-gray-900 leading-snug group-hover:text-nepal-red transition-colors line-clamp-2 mb-2">
                    { getCleanTitle(post.title)
    }
        </h3>
        <p className="text-xs text-gray-600 font-poppins line-clamp-2">
            { getCleanContent(post.content, 90) }
            </p>
            </Link>
                    );
                  })}
</div>
    </div>

{/* RIGHT: Nepali Calendar & Holidays */ }
<div className="flex flex-col gap-4">
    <div className="flex items-center mb-2 border-b-2 border-gray-200 pb-2">
        <h3 className="text-xl font-bold text-nepal-black font-nepali-serif">
            पात्रो र बिदाहरू{ " " }
<span className="text-gray-400 font-poppins text-xs font-normal"> / Calendar</span >
    </h3>
    </div>
    < NepaliCalendarWidget />
    <UpcomingHolidays maxItems={ 3 } />
        </div>
        </div>

{/* Bottom Row: Nepal at a Glance / Forex */ }
<div className="mt-12 pt-8 border-t border-gray-200">
    <div className="flex items-center mb-6 border-b-2 border-gray-200 pb-3">
        <h2 className="text-2xl md:text-3xl font-bold text-nepal-black font-nepali-serif">
            नेपाल एक नजरमा{ " " }
<span className="text-gray-500 font-poppins text-lg font-normal"> / Nepal at a Glance</span >
    </h2>
    </div>
    < Suspense fallback = {
                <div className="border border-gray-200 h-64 flex items-center justify-center text-gray-400 text-sm font-poppins">
    दर लोड हुँदैछ...
</div>
              }>
    <ForexRatesWidget />
    </Suspense>
    </div>
    </div>
    </section>

    <div className="h-10 md:h-14 lg:h-16 bg-transparent"> </div>
        </main>
        </div>
  );
}
