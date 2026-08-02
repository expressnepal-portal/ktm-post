export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import * as cheerio from "cheerio";
import {
  extractImagesFromContent,
  getCleanContent,
  getCleanTitle,
  getPostUrl,
  mapWpPost,
} from "../page"
import { fetchPosts } from "@/lib/wordpress";
import Card from "../components/Card";


export default async function NewsPage() {
  const news = await fetchPosts(10);
  const posts = news.map(mapWpPost)


  return (
    <section className="pt-44   w-full">
      <div className="w-full max-w-[1920px] mx-auto px-mobile-safe">

        {/* Section title */}
        <div className="flex justify-center mb-6 md:mb-8 pb-3 md:pb-4 flex-col" >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-nepal-black">
            News
          </h2>
          <h1 className="bg-nepal-orange h-[3px] rounded-full w-[20%]"></h1>
        </div>

        {/* FLEX GRID: professional cards */}
        <div className="flex flex-col md:flex-wrap md:flex-row 2xl:grid grid-cols-5 justify-start gap-y-6 md:gap-8 lg:gap-10 mb-10 ">
          {posts.length > 0 ? (
            posts.map((post) =>{

              const contentImages = extractImagesFromContent(post.content);
              const featuredImageUrl = post.featuredImage;
              const thumbnailImage = featuredImageUrl ?? contentImages[0] ?? undefined;
              return(
                <Card key={post.id}
                  link={getPostUrl(post)}
                  images={thumbnailImage ? [thumbnailImage] : []}
                  title={getCleanTitle(post.title)}
                  content={getCleanContent(post.content, 150)}
                />
              )
            })
          ) : (
            <div className=" w-screen text-2xl md:text-3xl text-center text-gray-600 flex items-center justify-center h-[50vh]">
              No Content Available For Now
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
