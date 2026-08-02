import Link from "next/link";
import ImageSlider from "./ImageSlider";
import { CardType } from "@/lib/type";


export default function Card({link,images,title,content}:CardType){
  return(

    <Link
    href={link}
    className="
      group cursor-pointer bg-white
      border border-gray-200
      transition-colors duration-200
      flex flex-col
      flex-1
      gap-4
      min-w-[280px] md:min-w-[300px] lg:min-w-[320px]
      max-w-full
      p-5
    "
  >
    {/* IMAGE SLIDER */}
    <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
      <ImageSlider
        images={images}
        title={title ?? "News image"}
      />
    </div>

    {/* CONTENT */}
    <div className="flex-1 flex flex-col gap-2 mt-2">
      <h3 className="font-nepali-serif font-bold text-lg md:text-xl text-gray-900 leading-snug line-clamp-2 mb-2
        group-hover:text-nepal-red transition-colors duration-200">
       {title}
      </h3>

      <p className="text-gray-600 font-poppins text-sm md:text-base leading-relaxed line-clamp-4 flex-1">
       {content}
      </p>
    </div>
  </Link>
  )
}