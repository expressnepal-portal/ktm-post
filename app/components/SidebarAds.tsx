import { prisma } from "@/lib/prisma";

interface SidebarAdsProps {
  category?: string;
  maxAds?: number;
  startIndex?: number;
}

export default async function SidebarAds({
  category,
  maxAds = 3,
  startIndex = 0,
}: SidebarAdsProps) {
  let sponsors: any[] = [];

  try {
    sponsors = await prisma.sponsor.findMany({
      where: {
        active: true,
        ...(category
          ? {
              category: {
                slug: category.toLowerCase(),
              },
            }
          : {}),
      },
      orderBy: { priority: "desc" },
      skip: startIndex,
      take: maxAds,
      include: {
        bannerImage: true,
      },
    });
  } catch (error) {
    console.error("Error fetching sponsors from DB:", error);
  }

  // Fallback placeholder cards if no ads are currently in the database
  const displayAds =
    sponsors.length > 0
      ? sponsors.map((s) => ({
          id: s.id,
          title: s.title,
          adTitle: s.title,
          adImage: s.bannerImage?.url || null,
          link: s.link || "#",
        }))
      : Array.from({ length: Math.min(maxAds, 2) }).map((_, i) => ({
          id: `placeholder-${i}`,
          title: "Advertisement",
          adTitle: "विज्ञापन स्थान",
          adImage: null,
          link: "#",
        }));

  return (
    <div className="flex flex-col gap-3">
      {displayAds.map((ad) => (
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
            <a href={ad.link} target="_blank" rel="noopener noreferrer" className="w-full overflow-hidden block">
              <img
                src={ad.adImage}
                alt={ad.adTitle || ad.title || "Advertisement"}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </a>
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
