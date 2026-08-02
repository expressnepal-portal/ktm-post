import { BreakingNewsType } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";



export default function BreakingNews({ title, slug, image, excerpt }: BreakingNewsType) {
  return (
    <Link href={`/news/${slug}`}>
      <div className="w-full max-w-[1920px] mx-auto px-mobile-safe py-6 border-b border-gray-200">
        <div className="flex flex-col items-center gap-3 max-w-5xl mx-auto group cursor-pointer">
        {/* Title */}
        <h1 className="font-nepali-serif text-2xl md:text-3xl lg:text-4xl text-center font-bold text-gray-900 group-hover:text-nepal-red transition-colors">
          {title}
        </h1>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <Image src="/logo.jpeg" width={30} height={20} alt="KTM Post" className="h-5 w-auto object-contain" />
          <p className="text-xs font-semibold tracking-wide text-gray-700 font-poppins">KTM Post</p>
        </div>

        {/* Image (below logo) */}
        {image && (
          <div className="w-full max-w-5xl aspect-video relative overflow-hidden bg-gray-100 mt-1 border border-gray-200">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          </div>
        )}

        {/* Excerpt */}
        {excerpt && (
          <p className="text-gray-600 font-poppins text-sm md:text-base text-center line-clamp-3 max-w-2xl leading-relaxed mt-1">
            {excerpt}
          </p>
        )}
        </div>
      </div>
    </Link>
  );
}