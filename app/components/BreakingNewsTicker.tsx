"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface BreakingNewsTickerProps {
  headlines?: string[];
  link?: string;
}

const DEFAULT_HEADLINES = [
  "रसुवा बाढी अपडेट: उद्धार तथा खोजी कार्य जारी",
  "कुलमानसँधी प्रधानमन्त्री बालेनलेसँधि– मुख्यमंत्रि फर्काए...",
  "कृषमिरको सडक खुलाउन रुख काटन थालियो, पहिरो प...",
  "ग्रिन आर्मीको भूमिकामाथि संसदमा प्रश्न, छानविन गर्न सा...",
];

export default function BreakingNewsTicker({
  headlines = DEFAULT_HEADLINES,
  link = "https://www.ktmpost.com",
}: BreakingNewsTickerProps) {
  const tickerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="w-full bg-gradient-to-r from-[#DC241F] via-[#003893] to-[#DC241F] border-b border-red-900 overflow-hidden">
      <div className="max-w-[1920px] mx-auto flex items-center justify-center">
        {/* BREAKING NEWS Label */}
        <Link
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-[#DC241F] text-white font-bold text-xs sm:text-sm px-3 sm:px-5 py-2.5 tracking-wider uppercase font-poppins flex items-center gap-2 hover:bg-red-700 transition-colors z-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="hidden sm:inline ">Rasuwa Floods</span>
          <span className="sm:hidden">ब्रेकिंग</span>
        </Link>

        {/* Scrolling Ticker */}
        <div
          className="flex-1 overflow-hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={tickerRef}
            className={`flex whitespace-nowrap justify-center ticker-scroll ${isPaused ? "ticker-paused" : ""}`}
          >
            {/* Duplicate headlines for seamless loop */}
            {[...headlines, ...headlines].map((headline, index) => (
              <Link
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-white hover:text-yellow-200 text-sm font-nepali-serif px-4 transition-colors"
              >
                <span className="text-white mr-3 text-lg">•</span>
                {headline}
              </Link>
            ))}
          </div>
        </div>

        {/* Right arrow nav hint */}
        <Link
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-white/20 hover:bg-white/30 text-white px-3 py-2.5 transition-colors flex items-center"
          title="रसुवा बाढी अपडेट हेर्नुहोस्"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </Link>
      </div>
    </div>
  );
}
