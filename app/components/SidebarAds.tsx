// Server component — fetches active ad banners from WordPress CMS
// and renders them in the article sidebar as clickable image ads.

import { fetchAdsBanner } from "@/lib/wordpress"

interface SidebarAdsProps {
  /** Optional: only show ads matching this category slug */
  category?: string
  /** Max number of ads to show (default: 3) */
  maxAds?: number
  /** Starting index for offset pagination (default: 0) */
  startIndex?: number
}

export default async function SidebarAds({ category, maxAds = 3, startIndex = 0 }: SidebarAdsProps) {
  let ads = await fetchAdsBanner()

  // Filter: active only
  ads = ads.filter((ad) => ad.active !== false)

  // Filter by category if specified and matches
  if (category && ads.length > 0) {
    const catFiltered = ads.filter(
      (ad) => !ad.category || ad.category.toLowerCase() === category.toLowerCase()
    )
    if (catFiltered.length > 0) ads = catFiltered
  }

  // Offset & Limit
  ads = ads.slice(startIndex, startIndex + maxAds)

  // If no CMS ads active, display elegant ad placeholder slots so section is visible
  const displayAds = ads.length > 0 ? ads : Array.from({ length: Math.min(maxAds, 2) }).map((_, i) => ({
    id: `placeholder-${i}`,
    title: "Advertisement",
    adTitle: "विज्ञापन स्थान",
    adImage: null,
    link: "#",
    active: true,
  }))

  return (
    <div className="flex flex-col gap-3">
      {displayAds.map((ad, index) => (
        <div
          key={ad.id}
          className="block w-full overflow-hidden border border-gray-200 bg-white"
          title={ad.adTitle || ad.title}
        >
          {/* "Ad" label */}
          <div className="px-2 py-1 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-poppins font-semibold text-gray-400 uppercase tracking-widest">
              विज्ञापन
            </span>
            <span className="text-[10px] font-poppins text-gray-300">Ad</span>
          </div>

          {/* Ad image */}
          {ad.adImage ? (
            <div className="w-full overflow-hidden">
              <img
                src={ad.adImage}
                alt={ad.adTitle || ad.title || "Advertisement"}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            // Placeholder when no image is set
            <div className="w-full h-28 bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center gap-1">
              <span className="text-gray-300 text-2xl">📢</span>
              <p className="text-gray-400 text-xs font-poppins">
                {ad.adTitle || "Advertisement"}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
