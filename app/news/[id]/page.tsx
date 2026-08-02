export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import CommentsSection from "@/app/components/CommentsSection"

import { Inter } from "next/font/google"
import { fetchPostBySlug, fetchRelatedPosts, fetchHomePagePosts, type Post } from "../../../lib/wordpress"
import { getCleanContent } from "@/app/page"
import ImageSlider from "@/app/components/ImageSlider"
import NewsImage from "@/app/components/NewsImage"
import * as cheerio from "cheerio"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

function decodeHtmlEntities(text: string | null): string {
  if (!text) return ""

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
    .replace(/&hellip;/g, "...")

  return decodedText
}

function getCleanTitle(title: string | null): string {
  if (!title) return "Untitled Post"
  const decodedTitle = decodeHtmlEntities(title)
  return decodedTitle
    .replace(/\b\d+\/\d+\b/g, "")
    .replace(/\b\d+ of \d+\b/gi, "")
    .replace(/\[[^\]]*\]/g, "")
    .trim()
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
  if (!content) return []

  const $ = cheerio.load(content)
  const images: string[] = []

  $("img").each((_, img) => {
    let src = $(img).attr("data-src") || $(img).attr("data-lazy-src") || $(img).attr("src")

    if (!src) return

    // ignore placeholder base64
    if (src.startsWith("data:image")) {
      src = $(img).attr("data-src") || $(img).attr("data-lazy-src") || ""
    }

    if (!src) return

    if (src.startsWith("//")) src = `https:${src}`
    if (src.startsWith("/")) src = `http://cms.bodhiberry.com${src}`

    images.push(src)
  })

  return [...new Set(images)]
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
    )
  } catch {
    return ""
  }
}

function removeThumbnailFromContent(content: string | null, thumbnail?: string): string {
  if (!content || !thumbnail) return content || ""

  const $ = cheerio.load(content)
  const thumbName = normalizeImageUrl(thumbnail)

  $("img").each((_, img) => {
    const src = $(img).attr("data-src") || $(img).attr("data-lazy-src") || $(img).attr("src")
    if (!src) return
    const imgName = normalizeImageUrl(src)

    if (imgName && imgName === thumbName) {
      $(img).remove()
    }
  })

  return $.html()
}

export default async function NewsSlugPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // const ads = await fetchAdsBanner();
  // const activeBanners = ads.filter((banner) => banner.active);

  const post = await fetchPostBySlug(id)

  if (!post) {
    return (
      <div className={`${inter.className} min-h-screen text-nepal-black w-full gradient-white-to-orange margin-auto `}>
        <div className="pt-32 md:pt-48 lg:pt-64"></div>
        <div className="flex items-center justify-center min-h-[60vh] w-full px-mobile-safe">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-nepal-black">Post Not Found</span>
            </h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
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
    )
  }
  console.log("this is the content images", extractImagesFromContent(post.content))
  const $ = cheerio.load(post.content || "")
  console.log("IMG COUNT:", $("img").length)
  console.log(
    "SRC LIST:",
    $("img")
      .map((_, i) => $(i).attr("src"))
      .get(),
  )

  const categorySlugs = post.categories?.nodes?.map((cat) => cat?.slug).filter((slug): slug is string => !!slug) ?? []

  const metaCategorySlugs = ["featured-news", "latest-news"]
  const nonMetaCategorySlugs = categorySlugs.filter((slug) => !metaCategorySlugs.includes(slug))

  // Prefer "real" topical categories (e.g. politics, society) over meta flags.
  // If there are only meta categories or none, we'll fall back to trending posts.
  const selectedCategorySlug = nonMetaCategorySlugs[0] ?? undefined

  let relatedPosts: Post[] = []

  if (selectedCategorySlug) {
    relatedPosts = await fetchRelatedPosts(selectedCategorySlug, post.id)
  } else {
    const homePosts = await fetchHomePagePosts()
    relatedPosts = homePosts.trending.filter((p) => p.id !== post.id).slice(0, 4)
  }

  console.log("this is realted posts ", relatedPosts)
  const contentImages = extractImagesFromContent(post.content)
  const featuredImageUrl = post.featuredImage?.node?.sourceUrl || undefined

  // Determine thumbnail for card
  let cardThumbnail: string | undefined
  let conditionalFeaturedImage: string | undefined
  if (featuredImageUrl) {
    cardThumbnail = featuredImageUrl
    conditionalFeaturedImage = undefined // card uses featured
  } else if (contentImages.length > 0) {
    cardThumbnail = contentImages[0] // card uses first content image
  }

  // Determine which image to show in post content (NewsImage)
  let postThumbnail: string[] = []

  // If card uses featured image, don't show it in NewsImage — show remaining content images
  if (featuredImageUrl && cardThumbnail === featuredImageUrl) {
    postThumbnail = contentImages // remove the featured image if it exists
  }
  // If card uses first content image, remove that from content images for NewsImage
  else if (!featuredImageUrl && contentImages.length > 0 && cardThumbnail === contentImages[0]) {
    postThumbnail = contentImages.slice(1) // skip first content image
  }

  // Remove card thumbnail from post content
  const cleanedContent = removeThumbnailFromContent(post.content, cardThumbnail)

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div
      className={`${inter.className} min-h-screen text-nepal-black w-full border-2 border-blue-200 gradient-white-to-orange`}
    >
      <div className="pt-18 sm:pt-14 md:pt-4 lg:pt-0"></div>

      <main className="w-full flex items-center justify-center" style={{ paddingTop: "var(--header-height)" }}>
        <article className="w-full max-w-[1500px] mx-auto px-mobile-safe flex flex-col  gap-10">
          {/* Main content + Advertisement side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(320px,380px)] gap-10 items-start ">
            {/* Main Content */}
            <div className="flex flex-col gap-8">
              <header className="flex flex-col gap-3 justify-center items-center text-center">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-nepal-black">
                  {getCleanTitle(post.title)}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-gray-600 text-sm md:text-base">
                  <time dateTime={post.date} className="font-medium">
                    {formattedDate}
                  </time>
                  {post.excerpt && (
                    <>
                      <span>•</span>
                    </>
                  )}
                </div>
              </header>

              <div className="bg-white/90 rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 ">
                {conditionalFeaturedImage && (
                  <div className=" w-full mb-8 md:mb-12">
                    <div className="\ w-full h-64 md:h-96 lg:h-[500px] xl:h-[600px] overflow-hidden">
                      <NewsImage
                        post={{
                          id: post.id,
                          title: post.title,
                          featuredImage: featuredImageUrl,
                          content: post.content,
                          images: postThumbnail,
                        }}
                        images={postThumbnail}
                        className="w-full h-full object-cover"
                        fallbackGradient="bg-gradient-to-br from-gray-200 to-gray-300"
                      />
                    </div>
                  </div>
                )}

                <div
                  className="prose prose-lg max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{
                    __html: cleanedContent || "<p>No content available.</p>",
                  }}
                  style={{ lineHeight: "1.8", fontSize: "1.125rem" }}
                />
              </div>


            </div>

            {/* Advertisement Sidebar */}
            <aside className="flex flex-col gap-6 w-full">
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                    Advertisement
                  </div>
                  <div className="aspect-4/5 w-full rounded-lg bg-linear-to-br from-gray-100 via-white to-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm"></div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Sponsored</div>
                  <div className="aspect-2/1 w-full rounded-lg bg-linear-to-br from-gray-100 via-white to-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                    {/* <img src={activeBanners[0].adImage || "/placeholder.svg"} alt="" /> */}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Sponsored</div>
                  <div className="aspect-2/1 w-full rounded-lg bg-linear-to-br from-gray-100 via-white to-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                    {/* <img src={activeBanners[1].adImage || "/placeholder.svg"} alt="" /> */}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Related News - full width below content + ads */}
          {relatedPosts.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-nepal-black">सम्बन्धित समाचार</h2>
              </div>

              {/* Cards grid */}
              {/* Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4  ">
                {relatedPosts.map((item) => {
                  const contentImages = extractImagesFromContent(item.content)
                  const featuredImageUrl = item.featuredImage?.node?.sourceUrl

                  // Merge featured + content images
                  const images = contentImages.length > 0 ? contentImages : featuredImageUrl ? [featuredImageUrl] : []
                  console.log("This is post url fetching ", item.slug)
                  return (
                    <a
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="
        group cursor-pointer bg-white
        rounded-xl md:rounded-2xl
        shadow-sm md:shadow-md
        hover:shadow-lg
        transition-all duration-200
        flex flex-col
        flex-1
        min-w-[280px] md:min-w-[300px] lg:min-w-[320px]
        max-w-full
        p-6 md:p-7 lg:p-8
      "
                    >
                      {/* IMAGE SLIDER */}
                      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden rounded-lg">
                        <ImageSlider images={images} title={post.title ?? "News image"} />
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 flex flex-col mt-4">
                        <h3
                          className="font-bold text-base md:text-lg leading-snug line-clamp-2 mb-2
          group-hover:bg-linear-to-r group-hover:from-[#CC0001] group-hover:to-[#004AAD]
          group-hover:text-transparent group-hover:bg-clip-text"
                        >
                          {getCleanTitle(item.title)}
                        </h3>

                        <p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-4 flex-1">
                          {getCleanContent(item.content, 150)}
                        </p>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </article>


      </main>

      {/* Spacer */}
      <div className="h-16 md:h-20 lg:h-24 bg-transparent"></div>
    </div>
  )
}
