"use client";

import { useEffect, useState } from "react";
import { fetchAdsBanner } from "@/lib/wordpress";
import { BannerAd } from "@/lib/type";
import Link from "next/link";

interface BannerAdsTopProps {
  maxHeight?: number; // optional, limit banner height
}

export default function BannerAdsTop({ maxHeight = 200 }: BannerAdsTopProps) {
  const [ads, setAds] = useState<BannerAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await fetchAdsBanner();
        // Filter active banners
        const activeBanners = data.filter((ad) => ad.active);
        setAds(activeBanners);
      } catch (error) {
        console.error("Error fetching top banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading || ads.length === 0) return null;

  const ad = ads[1]; // Take the first banner

  return (
    <div className="w-full bg-gray-100 flex items-center py-2 mt-44 -mb-40">
      <div className="block w-full max-w-7xl px-4">
        <div
          className="w-full overflow-hidden rounded-lg flex justify-center items-center"
          style={{ maxHeight }}
        >
          <img
            src={ad.adImage || ""}
            alt={ad.adTitle || ad.title}
            className="w-full h-[100px] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
