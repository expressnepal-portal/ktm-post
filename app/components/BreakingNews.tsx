import { BreakingNewsType } from "@/lib/type";
import { transliterateSlug } from "@/lib/transliterate";
import Image from "next/image";
import Link from "next/link";

export default function BreakingNews({ title, slug, image, excerpt }: BreakingNewsType) {
  const cleanSlug = transliterateSlug(slug);
  return (
    <Link href={`/news/${cleanSlug}`}>
      <div className="w-full max-w-[1920px] mx-auto px-mobile-safe py-6 border-b border-gray-200">
        <div className="flex flex-col items-center gap-3 max-w-5xl mx-auto group cursor-pointer">
        {/* Title */}
        <h1 className="font-nepali-serif text-2xl md:text-3xl lg:text-4xl text-center font-bold text-gray-900 group-hover:text-nepal-red transition-colors">
          {title}
        </h1>

        {/* KTM POST Red Badge */}
        <div className="flex items-center justify-center mt-1">
          <span className="bg-[#E93B32] text-white font-bold text-xs md:text-sm px-3 py-1 rounded-sm uppercase tracking-wide">
            KTM POST
          </span>
        </div>

        {/* Image (below badge) - uncropped original ratio */}
        {image && (
          <div className="w-full max-w-5xl relative overflow-hidden bg-gray-100 mt-2 border border-gray-200 rounded-md">
            <img
              src={image}
              alt={title}
              className="w-full h-auto object-contain block mx-auto group-hover:scale-[1.01] transition-transform duration-300"
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