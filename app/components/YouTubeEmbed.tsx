import React from "react";
import { getYouTubeEmbedUrl, getYouTubeVideoId } from "@/lib/youtube";
import { Play } from "lucide-react";

interface YouTubeEmbedProps {
  url?: string | null;
  title?: string;
  className?: string;
}

export default function YouTubeEmbed({
  url,
  title = "Video Content",
  className = "",
}: YouTubeEmbedProps) {
  const embedUrl = getYouTubeEmbedUrl(url);
  const videoId = getYouTubeVideoId(url);

  if (!embedUrl || !videoId) return null;

  return (
    <div className={`w-full my-8 ${className}`}>
      <div className="bg-gray-900 text-white rounded-2xl overflow-hidden shadow-lg border border-gray-800">
        {/* Header bar */}
        <div className="px-4 py-3 bg-gray-950 flex items-center justify-between border-b border-gray-800/80">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </span>
            <span className="font-semibold text-sm tracking-wide text-gray-100 font-poppins">
              भिडियो (Video)
            </span>
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-red-400 transition-colors font-poppins flex items-center gap-1"
          >
            YouTube मा हेर्नुहोस् ↗
          </a>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={`${embedUrl}?rel=0&modestbranding=1&enablejsapi=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
