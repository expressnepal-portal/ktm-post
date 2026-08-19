export const runtime = "nodejs";
export const revalidate = 60;

import ArticleShareBar from "@/app/components/ArticleShareBar";
import NepaliCalendarWidget from "@/app/components/NepaliCalendarWidget";
import UpcomingHolidays from "@/app/components/UpcomingHolidays";
import ForexRatesWidget from "@/app/components/ForexRatesWidget";
import SidebarAds from "@/app/components/SidebarAds";
import { Suspense } from "react";

import { Inter } from "next/font/google";
import {
  fetchPostBySlug,
  fetchRelatedPosts,
  fetchHomePagePosts,
  type Post,
} from "../../../lib/wordpress";
import { getCleanContent, getPostUrl } from "@/app/page";
import ImageSlider from "@/app/components/ImageSlider";
import NewsImage from "@/app/components/NewsImage";
import { transliterateSlug } from "@/lib/transliterate";
import * as cheerio from "cheerio";
import NepaliDate from "bikram-sambat-js";

const nepaliMonths = [
  "बैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भदौ",
  "आश्विन",
  "कार्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फाल्गुण",
  "चैत्र",
];

const toNepaliDigits = (num: number | string) => {
  const nepali = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return num.toString().replace(/\d/g, (d) => nepali[parseInt(d)]);
};

function getFormattedNepaliDate(dateStr: string): string {
  try {
    const dateObj = new Date(dateStr);
    const bsDate = new NepaliDate(dateObj);
    const [bsYear, bsMonth, bsDay] = bsDate.toBS().split("-").map(Number);
    const monthName = nepaliMonths[bsMonth - 1] || "";
    const hours = toNepaliDigits(
      dateObj.getHours().toString().padStart(2, "0"),
    );
    const minutes = toNepaliDigits(
      dateObj.getMinutes().toString().padStart(2, "0"),
    );
    return `${toNepaliDigits(bsYear)} ${monthName} ${toNepaliDigits(bsDay)} गते ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

function decodeHtmlEntities(text: string | null): string {
  if (!text) return "";

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

function getCleanTitle(title: string | null): string {
  if (!title) return "Untitled Post";
  const decodedTitle = decodeHtmlEntities(title);
  return decodedTitle
    .replace(/\b\d+\/\d+\b/g, "")
    .replace(/\b\d+ of \d+\b/gi, "")
    .replace(/\[[^\]]*\]/g, "")
    .trim();
}

// function extractImagesFromContent(content: string | null): string[] {
//   if (!content) return [];
//   const imageUrls: string[] = [];
//   const imgRegex = /<img[^>]+src="([^">]+)"/g;
//   let match;
//   while ((match = imgRegex.exec(content)) !== null) {
//     if (match[1]) {
//       let imageUrl = match[1];
//       if (imageUrl.startsWith("/")) {
//         imageUrl = `https://news.nepalvoices.com${imageUrl}`;
//       } else if (imageUrl.startsWith("//")) {
//         imageUrl = `https:${imageUrl}`;
//       } else if (!imageUrl.startsWith("http")) {
//         imageUrl = `https://news.nepalvoices.com/${imageUrl}`;
//       }
//       imageUrls.push(imageUrl);
//     }
//   }
//   return imageUrls;
// }

function extractImagesFromContent(content: string | null): string[] {
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

function normalizeImageUrl(url: string): string {
  try {
    return (
      url
        .split("/")
        .pop() // get filename
        ?.replace(/-\d+x\d+(?=\.)/, "") // remove size suffix
        .split("?")[0] // remove query params
        .replace(/^https?:/, "") || ""
    );
  } catch {
    return "";
  }
}

function removeThumbnailFromContent(
  content: string | null,
  thumbnail?: string,
): string {
  if (!content || !thumbnail) return content || "";

  const $ = cheerio.load(content);
  const thumbName = normalizeImageUrl(thumbnail);

  $("img").each((_, img) => {
    const src =
      $(img).attr("data-src") ||
      $(img).attr("data-lazy-src") ||
      $(img).attr("src");
    if (!src) return;
    const imgName = normalizeImageUrl(src);

    if (imgName && imgName === thumbName) {
      $(img).remove();
    }
  });

  return $.html();
}

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; category?: string }>;
}): Promise<Metadata> {
  const { id, category } = await params;
  const post = await fetchPostBySlug(id, category);

  if (!post) {
    return {
      title: "समाचार भेटिएन - KTM Post",
      description: "समाचार पृष्ठ उपलब्ध छैन।",
    };
  }

  const cleanTitle = getCleanTitle(post.title);
  const rawContent = post.content || "";
  const cleanDescription = getCleanContent(rawContent, 160);

  const contentImages = extractImagesFromContent(rawContent);
  const featuredImageUrl = post.featuredImage?.node?.sourceUrl || undefined;
  const heroImage =
    featuredImageUrl ||
    (contentImages.length > 0 ? contentImages[0] : undefined);

  const images = heroImage ? [{ url: heroImage }] : [];

  return {
    title: `${cleanTitle} - KTM Post`,
    description: cleanDescription,
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      type: "article",
      siteName: "KTM Post",
      images: images,
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: cleanDescription,
      images: images.map((i) => i.url),
    },
  };
}

export default async function NewsSlugPage({
  params,
}: {
  params: Promise<{ id: string; category?: string }>;
}) {
  const { id, category } = await params;
  // const ads = await fetchAdsBanner();
  // const activeBanners = ads.filter((banner) => banner.active);

  const post = await fetchPostBySlug(id, category);

  if (!post) {
    return (
      <div
        className={`${inter.className} min-h-screen text-nepal-black w-full gradient-white-to-orange margin-auto `}
      >
        <div className="pt-32 md:pt-48 lg:pt-64"></div>
        <div className="flex items-center justify-center min-h-[60vh] w-full px-mobile-safe">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-nepal-black">Post Not Found</span>
            </h1>
            <p className="text-gray-600 mb-6">
              The article you're looking for doesn't exist.
            </p>
            <a
              href="/"
              className=" mt-10 inline-block bg-nepal-orange text-white px-6 py-3 rounded-lg hover:bg-[#d32a2a] transition-all font-bold"
            >
              Go Back Home
            </a>
          </div>
        </div>
        <div className="h-24 bg-transparent"></div>
      </div>
    );
  }
  console.log(
    "this is the content images",
    extractImagesFromContent(post.content),
  );
  const $ = cheerio.load(post.content || "");
  console.log("IMG COUNT:", $("img").length);
  console.log(
    "SRC LIST:",
    $("img")
      .map((_, i) => $(i).attr("src"))
      .get(),
  );

  const categorySlugs =
    post.categories?.nodes
      ?.map((cat) => cat?.slug)
      .filter((slug): slug is string => !!slug) ?? [];

  const metaCategorySlugs = ["featured-news", "latest-news"];
  const nonMetaCategorySlugs = categorySlugs.filter(
    (slug) => !metaCategorySlugs.includes(slug),
  );

  // Prefer "real" topical categories (e.g. politics, society) over meta flags.
  // If there are only meta categories or none, we'll fall back to trending posts.
  const selectedCategorySlug = nonMetaCategorySlugs[0] ?? undefined;

  let relatedPosts: Post[] = [];

  if (selectedCategorySlug) {
    relatedPosts = await fetchRelatedPosts(selectedCategorySlug, post.id);
  } else {
    const homePosts = await fetchHomePagePosts();
    relatedPosts = homePosts.trending
      .filter((p) => p.id !== post.id)
      .slice(0, 4);
  }

  console.log("this is realted posts ", relatedPosts);
  const contentImages = extractImagesFromContent(post.content);
  const featuredImageUrl = post.featuredImage?.node?.sourceUrl || undefined;

  // Main hero image to show on the detail page (prefer featured image, fallback to first content image)
  const heroImage =
    featuredImageUrl ||
    (contentImages.length > 0 ? contentImages[0] : undefined);

  // Clean content (remove hero image from body text if embedded)
  const cleanedContent = removeThumbnailFromContent(post.content, heroImage);

  const formattedDate = getFormattedNepaliDate(post.date);

  return (
    <div
      className={`${inter.className} min-h-screen text-nepal-black w-full bg-white`}
    >
      <main
        className="w-full flex items-center justify-center pt-3 lg:pt-4"
        style={{ paddingTop: "var(--header-height)" }}
      >
        <article className="w-full max-w-[1500px] mx-auto px-mobile-safe flex flex-col gap-6">
          {/* Main content + Advertisement side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(320px,380px)] gap-8 items-start">
            {/* Main Content */}
            <div className="flex flex-col gap-6">
              <header className="flex flex-col gap-2 justify-center items-center text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-snug text-nepal-black font-nepali-serif">
                  {getCleanTitle(post.title)}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-gray-600 text-sm md:text-base font-poppins">
                  <time dateTime={post.date} className="font-medium">
                    {formattedDate}
                  </time>
                  {post.author?.node?.name && (
                    <>
                      <span>•</span>
                      <span className="font-medium">
                        {post.author.node.name}
                      </span>
                    </>
                  )}
                </div>
              </header>

              <div className="bg-white p-3 sm:p-4 md:p-6">
                {heroImage && (
                  <div className="w-full mb-5 md:mb-8">
                    <div className="w-full relative overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                      <NewsImage
                        post={{
                          id: post.id,
                          title: post.title,
                          featuredImage: heroImage,
                          content: post.content,
                          images: contentImages,
                        }}
                        images={[heroImage]}
                        className="w-full h-auto object-contain block mx-auto"
                        fallbackGradient="bg-gradient-to-br from-gray-200 to-gray-300"
                      />
                    </div>
                  </div>
                )}

                <div
                  className="prose prose-lg md:prose-xl max-w-none text-gray-800 font-poppins
                    prose-p:text-base prose-p:sm:text-lg prose-p:md:text-xl prose-p:leading-[1.9]
                    prose-headings:font-nepali-serif prose-headings:text-nepal-black
                    prose-li:text-base prose-li:sm:text-lg prose-li:md:text-xl
                    prose-img:rounded-lg prose-img:mx-auto"
                  dangerouslySetInnerHTML={{
                    __html: cleanedContent || "<p>No content available.</p>",
                  }}
                  style={{
                    lineHeight: "1.9",
                    fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)",
                  }}
                />

                {/* Social Share & Published Date Bar */}
                <ArticleShareBar
                  title={getCleanTitle(post.title)}
                  publishedDate={formattedDate}
                  authorName={post.author?.node?.name}
                />

                {/* Related News - directly below content */}
                {relatedPosts.length > 0 && (
                  <div className="border-t border-gray-200 pt-8 mt-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl md:text-2xl font-bold text-nepal-black font-nepali-serif">
                        सम्बन्धित समाचार
                      </h2>
                    </div>

                    {/* Cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                      {relatedPosts.map((item) => {
                        const contentImages = extractImagesFromContent(
                          item.content,
                        );
                        const featuredImageUrl =
                          item.featuredImage?.node?.sourceUrl;

                        const images =
                          contentImages.length > 0
                            ? contentImages
                            : featuredImageUrl
                              ? [featuredImageUrl]
                              : [];
                        return (
                          <a
                            key={item.id}
                            href={getPostUrl({
                              slug: item.slug,
                              databaseId: item.databaseId,
                              categorySlug: item.categories?.nodes?.[0]?.slug,
                            })}
                            className="
                              group cursor-pointer bg-white
                              border border-gray-200
                              transition-colors duration-200
                              flex flex-col
                              gap-4
                              p-5
                            "
                          >
                            {/* IMAGE SLIDER */}
                            <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                              <ImageSlider
                                images={images}
                                title={item.title ?? "News image"}
                              />
                            </div>

                            {/* CONTENT */}
                            <div className="flex-1 flex flex-col gap-2 mt-2">
                              <h3
                                className="font-nepali-serif font-bold text-lg md:text-xl text-gray-900 leading-snug line-clamp-2 mb-2
                                group-hover:text-nepal-red transition-colors duration-200"
                              >
                                {getCleanTitle(item.title)}
                              </h3>

                              <p className="text-gray-600 font-poppins text-sm md:text-base leading-relaxed line-clamp-4 flex-1">
                                {getCleanContent(item.content, 150)}
                              </p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Ads + Calendar + Holidays + Forex (After content & related news on mobile/tablet, right sidebar on desktop xl) */}
            <aside className="flex flex-col md:grid md:grid-cols-2 xl:flex xl:flex-col gap-6 w-full mt-8 xl:mt-0">
              {/* ── CMS Banner Ads ── */}
              <div className="w-full md:col-span-2 xl:col-span-1">
                <Suspense fallback={null}>
                  <SidebarAds category={nonMetaCategorySlugs[0]} maxAds={2} />
                </Suspense>
              </div>

              {/* Nepali Calendar */}
              <div className="w-full">
                <NepaliCalendarWidget compact />
              </div>

              {/* Upcoming Holidays */}
              <div className="w-full">
                <UpcomingHolidays maxItems={4} />
              </div>

              {/* Forex Rates */}
              <div className="w-full md:col-span-2 xl:col-span-1">
                <Suspense
                  fallback={
                    <div className="border border-gray-200 h-40 flex items-center justify-center text-gray-400 text-xs font-poppins">
                      विनिमय दर लोड हुँदैछ...
                    </div>
                  }
                >
                  <ForexRatesWidget />
                </Suspense>
              </div>

              {/* ── Additional Ads ── */}
              <div className="w-full md:col-span-2 xl:col-span-1">
                <Suspense fallback={null}>
                  <SidebarAds
                    category={nonMetaCategorySlugs[0]}
                    maxAds={1}
                    startIndex={2}
                  />
                </Suspense>
              </div>
            </aside>
          </div>
        </article>
      </main>

      {/* Spacer */}
      <div className="h-16 md:h-20 lg:h-24 bg-transparent"></div>
    </div>
  );
}
