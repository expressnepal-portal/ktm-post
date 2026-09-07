import { prisma } from "./prisma";
import { BannerAd, HomePagePosts } from "./type";
import { transliterateSlug } from "./transliterate";

export interface FeaturedImage {
  sourceUrl: string;
  altText: string;
  mediaDetails?: {
    width: number;
    height: number;
  };
}

export interface Post {
  id: string;
  databaseId?: number;
  uri: string;
  title: string | null;
  slug: string;
  status: string;
  link: string;
  date: string;
  content: string | null;
  excerpt?: string | null;
  featuredImage?: {
    node: FeaturedImage;
  } | null;
  categories?: {
    nodes?: Array<{
      id?: string;
      name?: string;
      slug?: string;
    }>;
  } | null;
  author?: {
    node?: {
      name?: string;
    };
  } | null;
}

export interface WPCategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface WPFooterPage {
  id: string;
  title: string;
  slug: string;
  uri?: string;
}

export interface NavbarMenuItem {
  id: string;
  title: string;
  slug: string;
  menuOrder?: number | null;
}

/** Helper: Map a Prisma Post record to the frontend Post interface */
function mapPrismaPostToPost(p: any): Post {
  const publishedDate = (p.publishedAt || p.createdAt || new Date()).toISOString();
  const primaryCat = p.categories?.[0]?.category;
  const authorName = p.authorName || p.author?.name || "KTM Post";

  return {
    id: p.id,
    uri: `/news/${p.slug}`,
    title: p.title,
    slug: p.slug,
    status: p.status || "PUBLISHED",
    link: `/news/${p.slug}`,
    date: publishedDate,
    content: p.content || "",
    excerpt: p.excerpt || "",
    featuredImage: p.featuredImage
      ? {
          node: {
            sourceUrl: p.featuredImage.url || "",
            altText: p.featuredImage.alt || p.title || "",
            mediaDetails: {
              width: p.featuredImage.width || 800,
              height: p.featuredImage.height || 600,
            },
          },
        }
      : null,
    categories: {
      nodes: (p.categories || []).map((pc: any) => ({
        id: pc.category?.id || pc.categoryId,
        name: pc.category?.nepaliName || pc.category?.name || "समाचार",
        slug: pc.category?.slug || "news",
      })),
    },
    author: {
      node: {
        name: authorName,
      },
    },
  };
}

/** Standard Prisma Post include query for reuse */
const defaultPostInclude = {
  featuredImage: true,
  author: { select: { name: true, image: true } },
  categories: { include: { category: true } },
};

/** Category Aliases mapping for flexible lookups */
const categoryAliases: Record<string, string[]> = {
  "news": ["news", "समाचार", "latest-news"],
  "latest-news": ["latest-news", "news", "समाचार"],
  "featured-news": ["featured-news", "विशेष", "featured"],
  "breaking-news": ["breaking-news", "ताजा", "breaking"],
  "politics": ["politics", "राजनीति"],
  "economy": ["economy", "business", "अर्थ", "अर्थतन्त्र"],
  "business": ["economy", "business", "अर्थ", "अर्थतन्त्र"],
  "sports": ["sports", "खेलकुद"],
  "opinion": ["opinion", "विचार", "दृष्टिकोण"],
  "technology": ["technology", "science-technology", "विज्ञान प्रविधि", "technology-science"],
  "science-technology": ["technology", "science-technology", "विज्ञान प्रविधि", "technology-science"],
  "world": ["world", "international", "अन्तराष्ट्रिय", "विश्व"],
  "international": ["world", "international", "अन्तराष्ट्रिय", "विश्व"],
  "society": ["society", "समाज"],
  "arts": ["arts", "कला साहित्य", "कला"],
  "multimedia": ["multimedia", "मल्टिमिडिया", "भिडियो"],
  "legal": ["legal", "कानून", "ऐन"],
  "health-and-lifestyle": ["health-and-lifestyle", "health", "स्वास्थ्य/जीवन शैली", "स्वास्थ्य"],
  "health": ["health-and-lifestyle", "health", "स्वास्थ्य/जीवन शैली", "स्वास्थ्य"],
  "exclusive": ["exclusive", "एक्सक्लुसिभ", "विशेष"],
  "podcast": ["podcast", "पोडकास्ट"],
};

/** Fetch recent published posts from DB */
export async function fetchPosts(first: number = 10): Promise<Post[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: first,
      include: defaultPostInclude,
    });
    return posts.map(mapPrismaPostToPost);
  } catch (error) {
    console.error("fetchPosts DB error:", error);
    return [];
  }
}

/** Fetch posts by category slug or alias */
export async function fetchPostsByCategory(
  categorySlug: string,
  first: number = 12
): Promise<Post[]> {
  try {
    const normalized = categorySlug.toLowerCase().trim();
    const aliases = categoryAliases[normalized] || [normalized];

    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        categories: {
          some: {
            category: {
              slug: { in: aliases },
            },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: first,
      include: defaultPostInclude,
    });

    return posts.map(mapPrismaPostToPost);
  } catch (error) {
    console.error(`fetchPostsByCategory [${categorySlug}] error:`, error);
    return [];
  }
}

/** Extract first image URL from HTML content */
export function extractFirstImageFromContent(content: string | null): string | null {
  if (!content) return null;
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

/** Fetch a single post by slug */
export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    let post = await prisma.post.findUnique({
      where: { slug },
      include: defaultPostInclude,
    });

    if (!post) {
      const transliterated = transliterateSlug(slug);
      if (transliterated !== slug) {
        post = await prisma.post.findUnique({
          where: { slug: transliterated },
          include: defaultPostInclude,
        });
      }
    }

    return post ? mapPrismaPostToPost(post) : null;
  } catch (error) {
    console.error(`fetchPostBySlug [${slug}] error:`, error);
    return null;
  }
}

/** Fetch all structured sections for the Homepage from DB */
export async function fetchHomePagePosts(): Promise<HomePagePosts> {
  try {
    // 1. Fetch featured, breaking, and general recent posts
    const [allRecent, breakingPosts, featuredPosts] = await Promise.all([
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 50,
        include: defaultPostInclude,
      }),
      prisma.post.findMany({
        where: { status: "PUBLISHED", isBreaking: true },
        orderBy: { publishedAt: "desc" },
        take: 6,
        include: defaultPostInclude,
      }),
      prisma.post.findMany({
        where: { status: "PUBLISHED", isFeatured: true },
        orderBy: { publishedAt: "desc" },
        take: 6,
        include: defaultPostInclude,
      }),
    ]);

    // Helper to filter posts matching category aliases from the loaded pool
    const getCatPosts = (slug: string, limit: number = 6): Post[] => {
      const aliases = categoryAliases[slug] || [slug];
      const matched = allRecent.filter((p) =>
        p.categories?.some((pc: any) => aliases.includes(pc.category?.slug))
      );
      return matched.slice(0, limit).map(mapPrismaPostToPost);
    };

    const mappedRecent = allRecent.map(mapPrismaPostToPost);
    const mappedFeatured =
      featuredPosts.length > 0
        ? featuredPosts.map(mapPrismaPostToPost)
        : mappedRecent.slice(0, 1);

    // Combine isBreaking: true posts with any posts having breaking category
    const breakingCatPosts = getCatPosts("breaking-news", 10);
    const directBreaking = breakingPosts.map(mapPrismaPostToPost);
    const breakingMap = new Map<string, Post>();
    for (const post of [...directBreaking, ...breakingCatPosts]) {
      breakingMap.set(post.id, post);
    }
    const mappedBreaking = Array.from(breakingMap.values());

    return {
      featured: mappedFeatured,
      trending: getCatPosts("politics", 6),
      latest: mappedRecent.slice(0, 12),
      politics: getCatPosts("politics", 6),
      society: getCatPosts("society", 6),
      breaking: mappedBreaking,
      economy: getCatPosts("economy", 10),
      technology: getCatPosts("technology", 6),
      arts: getCatPosts("arts", 6),
      sports: getCatPosts("sports", 6),
      world: getCatPosts("world", 6),
      podcast: getCatPosts("podcast", 6),
      multimedia: getCatPosts("multimedia", 6),
      international: getCatPosts("world", 6),
      opinion: getCatPosts("opinion", 4),
      legal: getCatPosts("legal", 6),
      health: getCatPosts("health-and-lifestyle", 6),
      exclusive: getCatPosts("exclusive", 7),
    };
  } catch (error) {
    console.error("fetchHomePagePosts DB error:", error);
    return {
      featured: [],
      trending: [],
      latest: [],
      politics: [],
      society: [],
      breaking: [],
      economy: [],
      technology: [],
      arts: [],
      sports: [],
      world: [],
      podcast: [],
      multimedia: [],
      international: [],
      opinion: [],
      legal: [],
      health: [],
      exclusive: [],
    };
  }
}

/** Related posts helper */
export async function fetchRelatedPosts(
  postId: string,
  categorySlug?: string,
  limit: number = 4
): Promise<Post[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: postId },
        ...(categorySlug
          ? {
              categories: {
                some: {
                  category: { slug: categorySlug },
                },
              },
            }
          : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: defaultPostInclude,
    });

    return posts.map(mapPrismaPostToPost);
  } catch (error) {
    console.error("fetchRelatedPosts DB error:", error);
    return [];
  }
}

/** Fetch active banner ads directly from Neon DB */
export async function fetchAdsBanner(categorySlug?: string): Promise<BannerAd[]> {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: {
        active: true,
        ...(categorySlug
          ? {
              category: {
                slug: categorySlug.toLowerCase(),
              },
            }
          : {}),
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        bannerImage: true,
        category: true,
      },
    });

    return sponsors.map((s) => ({
      id: s.id,
      title: s.title,
      adTitle: s.title,
      adImage: s.bannerImage?.url || undefined,
      link: s.link || "#",
      priority: s.priority,
      active: s.active,
      category: s.category?.slug,
    }));
  } catch (error) {
    console.error("fetchAdsBanner DB error:", error);
    return [];
  }
}

export async function getBannerAds(): Promise<BannerAd[]> {
  return fetchAdsBanner();
}

/** Search posts in Neon DB by title, content, or excerpt */
export async function searchPosts(query: string, first: number = 15): Promise<Post[]> {
  if (!query || query.trim().length === 0) return [];
  const cleanQ = query.trim();

  try {
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: cleanQ, mode: "insensitive" } },
          { excerpt: { contains: cleanQ, mode: "insensitive" } },
          { content: { contains: cleanQ, mode: "insensitive" } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: first,
      include: defaultPostInclude,
    });

    return posts.map(mapPrismaPostToPost);
  } catch (error) {
    console.error("searchPosts DB error:", error);
    return [];
  }
}

/** Fetch categories from Neon DB */
export async function fetchWPCategories(): Promise<WPCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { menuOrder: "asc" },
      include: {
        _count: { select: { posts: true } },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.nepaliName || c.name,
      slug: c.slug,
      count: c._count.posts,
    }));
  } catch (error) {
    console.error("fetchWPCategories DB error:", error);
    return [];
  }
}

/** Fetch footer static pages from Neon DB */
export async function fetchFooterPages(): Promise<WPFooterPage[]> {
  try {
    const pages = await prisma.staticPage.findMany({
      where: { isFooter: true },
      orderBy: { menuOrder: "asc" },
      select: { id: true, title: true, slug: true },
    });

    return pages.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      uri: `/${p.slug}`,
    }));
  } catch (error) {
    console.error("fetchFooterPages DB error:", error);
    return [];
  }
}

/** Fetch navbar menu items from Neon DB */
export async function fetchNavbarMenu(): Promise<NavbarMenuItem[]> {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { category: true },
    });

    return items.map((item) => ({
      id: item.id,
      title: item.nepaliLabel || item.label,
      slug: item.url.startsWith("/") ? item.url.slice(1) : item.url,
      menuOrder: item.order,
    }));
  } catch (error) {
    console.error("fetchNavbarMenu DB error:", error);
    return [];
  }
}
