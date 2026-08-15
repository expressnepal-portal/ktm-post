import { BannerAd, HomePagePosts } from "./type";
import { transliterateSlug } from "./transliterate";

const API_URL =
  process.env.API_URL || "https://cms.ktmpost.com/?graphql";

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

export interface PostsResponse {
  data?: {
    posts?: {
      edges: Array<{
        node: Post;
      }>;
    };
  };
  errors?: Array<{
    message: string;
  }>;
}

// Main function to fetch posts
export async function fetchPosts(first: number = 10): Promise<Post[]> {
  console.log(" Fetching posts from WordPress...");

  const query = `
    query GetPosts {
      posts(first: ${first}, where: {orderby: {field: DATE, order: DESC}}) {
        edges {
            node {
              id
              databaseId
              uri
            title(format: RENDERED)
            slug
            status
            link
            date
            content(format: RENDERED)
            excerpt(format: RENDERED)
            featuredImage {
              node {
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query }),
      next: {
        revalidate: 60, // 5 minutes cache
      },
    });

    if (!response.ok) {
      console.warn(`WordPress API unavailable (${response.status}) at ${API_URL}`);
      return [];
    }

    const json: PostsResponse = await response.json();

    // Check for GraphQL errors
    if (json.errors && json.errors.length > 0) {
      console.error("GraphQL Errors:", json.errors);
      throw new Error(`GraphQL query failed: ${json.errors[0].message}`);
    }

    if (!json.data?.posts?.edges) {
      console.error("Invalid response structure:", json);
      return [];
    }

    const posts = json.data.posts.edges.map((edge) => {
      const post = edge.node;

      // Ensure featured image URLs are absolute
      if (post.featuredImage?.node?.sourceUrl) {
        let imageUrl = post.featuredImage.node.sourceUrl;
        if (imageUrl.startsWith("/")) {
          imageUrl = `https://cms.ktmpost.com${imageUrl}`;
          post.featuredImage.node.sourceUrl = imageUrl;
        }
      }

      return post;
    });

    console.log(`Successfully fetched ${posts.length} posts`);

    // Debug: Log image information
    posts.forEach((post, index) => {
      console.log(`Post ${index + 1}:`, {
        title: post.title?.substring(0, 30) + "...",
        hasFeaturedImage: !!post.featuredImage?.node,
        imageUrl: post.featuredImage?.node?.sourceUrl || "No image",
      });
    });

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Fetch posts by category slug
const categorySlugAliases: Record<string, string[]> = {
  "समाचार": ["news", "latest-news", "featured-news", "समाचार"],
  "news": ["news", "latest-news", "featured-news"],
  "खेलकुद": ["sports", "खेलकुद"],
  "sports": ["sports"],
  "राजनीति": ["politics", "राजनीति"],
  "politics": ["politics"],
  "विचार": ["opinion", "विचार"],
  "opinion": ["opinion"],
  "अर्थ": ["business", "economy", "अर्थतन्त्र", "अर्थ"],
  "अर्थतन्त्र": ["business", "economy", "अर्थतन्त्र", "अर्थ"],
  "economy": ["business", "economy"],
  "business": ["business", "economy"],
  "स्वास्थ्य/जीवन शैली": ["health-and-lifestyle", "society"],
  "स्वास्थ्य-जीवन-शैली": ["health-and-lifestyle", "society"],
  "health-and-lifestyle": ["health-and-lifestyle", "society"],
  "society": ["health-and-lifestyle", "society"],
  "कानून": ["legal", "कानून"],
  "legal": ["legal"],
  "मल्टिमिडिया": ["multimedia", "मल्टिमिडिया"],
  "multimedia": ["multimedia"],
  "अन्तराष्ट्रिय": ["international", "world", "अन्तराष्ट्रिय"],
  "international": ["international", "world"],
  "world": ["world", "international"],
  "technology": ["science-and-technology", "technology"],
  "science-and-technology": ["science-and-technology", "technology"],
  "विज्ञान प्रविधि": ["science-and-technology"],
  "कला साहित्य": ["arts"],
  "arts": ["arts"],
  "शिक्षा": ["शिक्षा"]
};

export async function fetchPostsByCategory(categorySlug: string, first: number = 12): Promise<Post[]> {
  const normalizedSlug = categorySlug.toLowerCase().trim();
  const slugsToTry = categorySlugAliases[normalizedSlug] || [normalizedSlug];

  for (const targetSlug of slugsToTry) {
    console.log(` Fetching posts for category: ${targetSlug}...`);

    const query = `
      query GetPostsByCategory {
        posts(first: ${first}, where: {categoryName: "${targetSlug}", orderby: {field: DATE, order: DESC}}) {
          edges {
            node {
              id
              databaseId
              uri
              title(format: RENDERED)
              slug
              status
              link
              date
              content(format: RENDERED)
              excerpt(format: RENDERED)
              categories {
                nodes {
                  id
                  name
                  slug
                }
              }
              author {
                node {
                  name
                }
              }
              featuredImage {
                node {
                  sourceUrl
                  altText
                  mediaDetails {
                    width
                    height
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query }),
        next: {
          revalidate: 60, // 5 minutes cache
        },
      });

      if (!response.ok) {
        console.warn(`WordPress API unavailable (${response.status}) at ${API_URL}`);
        continue;
      }

      const json: PostsResponse = await response.json();

      if (json.errors && json.errors.length > 0) {
        console.error("GraphQL Errors:", json.errors);
        continue;
      }

      if (json.data?.posts?.edges && json.data.posts.edges.length > 0) {
        const posts = json.data.posts.edges.map((edge) => {
          const post = edge.node;

          if (post.featuredImage?.node?.sourceUrl) {
            let imageUrl = post.featuredImage.node.sourceUrl;
            if (imageUrl.startsWith("/")) {
              imageUrl = `https://cms.ktmpost.com${imageUrl}`;
              post.featuredImage.node.sourceUrl = imageUrl;
            }
          }

          return post;
        });

        return posts;
      }
    } catch (error) {
      console.error(`Error fetching posts for category ${targetSlug}:`, error);
    }
  }

  // Return empty array if category has no posts assigned in WordPress
  console.log(`No posts found for category '${categorySlug}'.`);
  return [];
}



// Helper function to extract the first image from post content as fallback
export function extractFirstImageFromContent(
  content: string | null
): string | null {
  if (!content) return null;

  try {
    // Multiple patterns to catch different image formats
    const patterns = [
      /<img[^>]+src="([^">]+)"/i,
      /src="([^"]+\.(jpg|jpeg|png|gif|webp)[^"]*)"/i,
      /data-src="([^">]+)"/i,
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(content);
      if (match && match[1]) {
        let imageUrl = match[1];

        // Convert to absolute URL if relative
        if (imageUrl.startsWith("/")) {
          imageUrl = `https://cms.ktmpost.com${imageUrl}`;
        } else if (imageUrl.startsWith("//")) {
          imageUrl = `https:${imageUrl}`;
        } else if (!imageUrl.startsWith("http")) {
          imageUrl = `https://cms.ktmpost.com/${imageUrl}`;
        }

        // console.log("Extracted image from content:", imageUrl);
        return imageUrl;
      }
    }
  } catch (error) {
    console.error("Error extracting image from content:", error);
  }

  return null;
}

// Enhanced version that includes image fallback
export async function fetchPostsWithImages(
  first: number = 10
): Promise<Array<Post & { imageUrl: string | null }>> {
  try {
    const posts = await fetchPosts(first);

    // Transform posts to include a reliable image URL
    const postsWithImages = posts.map((post) => {
      let imageUrl = null;

      // Priority 1: Use featured image
      if (post.featuredImage?.node?.sourceUrl) {
        imageUrl = post.featuredImage.node.sourceUrl;
      }
      // Priority 2: Extract first image from content
      else if (post.content) {
        imageUrl = extractFirstImageFromContent(post.content);
      }

      return {
        ...post,
        imageUrl,
      };
    });

    console.log("Posts with processed images:");
    postsWithImages.forEach((post, index) => {
      // console.log(
      //   `   ${index + 1}. "${post.title}" - Image: ${
      //     post.imageUrl ? "✅" : "❌"
      //   }`
      // );
      if (post.imageUrl) {
        // console.log(`${post.imageUrl}`);
      }
    });

    return postsWithImages;
  } catch (error) {
    console.error(" Error fetching posts with images:", error);
    return [];
  }
}

// Simple version for direct use in components
export async function getPostsForHomepage() {
  return await fetchPostsWithImages(12);
}

export async function fetchPostBySlug(slug: string, categorySlug?: string): Promise<Post | null> {
  const decodedSlug = decodeURIComponent(slug).trim();
  console.log(`Fetching post with slug: ${decodedSlug}...`);

  const escapedSlug = decodedSlug
    .replace(/"/g, '\\"')
    .replace(/\n/g, "")
    .replace(/\r/g, "");

  const fixImage = (p: Post | null): Post | null => {
    if (p?.featuredImage?.node?.sourceUrl?.startsWith("/")) {
      p.featuredImage.node.sourceUrl = `https://cms.ktmpost.com${p.featuredImage.node.sourceUrl}`;
    }
    return p;
  };

  const postFields = `
    id
    databaseId
    uri
    title(format: RENDERED)
    slug
    status
    link
    date
    content(format: RENDERED)
    excerpt(format: RENDERED)
    categories {
      nodes { id name slug }
    }
    featuredImage {
      node { sourceUrl altText mediaDetails { width height } }
    }
  `;

  try {
    // 1. Try extracting numeric database ID from slug (e.g. "1381-tarai-ko..." or "1381")
    const numericIdMatch = decodedSlug.match(/^(\d+)(?:-|$)/) || decodedSlug.match(/(?:^|-)(\d+)$/);
    if (numericIdMatch) {
      const dbId = parseInt(numericIdMatch[1], 10);
      if (!isNaN(dbId)) {
        const idQuery = `
          query GetPostByDbId {
            post(id: "${dbId}", idType: DATABASE_ID) {
              ${postFields}
            }
          }
        `;
        const idRes = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: idQuery }),
          next: { revalidate: 60 },
        });
        if (idRes.ok) {
          const idJson = await idRes.json();
          if (idJson.data?.post) {
            return fixImage(idJson.data.post);
          }
        }
      }
    }

    // 2. Direct slug lookup via postBy(slug)
    const query = `
      query GetPostBySlug {
        postBy(slug: "${escapedSlug}") {
          ${postFields}
        }
      }
    `;
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
      next: { revalidate: 60 },
    });
    if (response.ok) {
      const json = await response.json();
      if (json.data?.postBy) return fixImage(json.data.postBy);
    }

    // 3. Fallback slug lookup via post(id, SLUG)
    const uriQuery = `
      query GetPostByUri {
        post(id: "${escapedSlug}", idType: SLUG) {
          ${postFields}
        }
      }
    `;
    const uriRes = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: uriQuery }),
      next: { revalidate: 60 },
    });
    if (uriRes.ok) {
      const uriJson = await uriRes.json();
      if (uriJson.data?.post) return fixImage(uriJson.data.post);
    }

    // 4. Multi-category and universal scan for transliterated or Nepali slug match
    const targetWords = escapedSlug.toLowerCase().split("-").filter((w) => w.length >= 2);

    const matchesPost = (p: Post): boolean => {
      if (!p.slug) return false;
      if (p.slug === escapedSlug) return true;
      const transliterated = transliterateSlug(p.slug).toLowerCase();
      if (transliterated === escapedSlug.toLowerCase()) return true;

      // Fuzzy match if 50%+ words match
      if (targetWords.length >= 2) {
        const matches = targetWords.filter((w) => transliterated.includes(w) || p.slug.includes(w));
        if (matches.length / targetWords.length >= 0.5) {
          return true;
        }
      } else if (targetWords.length === 1) {
        if (transliterated.includes(targetWords[0]) || p.slug.includes(targetWords[0])) {
          return true;
        }
      }
      return false;
    };

    // Determine category filters to check (if any)
    const normalizedCategory = categorySlug ? categorySlug.toLowerCase().trim() : undefined;
    const catAliasesToTry = normalizedCategory
      ? (categorySlugAliases[normalizedCategory] || [normalizedCategory])
      : [];

    // Scan with category filter first if category is known
    for (const catName of catAliasesToTry) {
      const catQueryStr = `
        query GetPostsByCategoryPage {
          posts(first: 100, where: { orderby: { field: DATE, order: DESC }, categoryName: "${catName}" }) {
            nodes {
              ${postFields}
            }
          }
        }
      `;
      try {
        const catRes = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: catQueryStr }),
          next: { revalidate: 60 },
        });
        if (catRes.ok) {
          const catJson = await catRes.json();
          const posts: Post[] = catJson.data?.posts?.nodes || [];
          for (const p of posts) {
            if (matchesPost(p)) return fixImage(p);
          }
        }
      } catch (err) {
        console.warn(`Failed scanning category ${catName}:`, err);
      }
    }

    // 5. Global scan (across all categories) if not found in category
    let hasNext = true;
    let endCursor: string | null = null;
    let page = 0;

    while (hasNext && page < 10) {
      page++;
      const cursorParam: string = endCursor ? `, after: "${endCursor}"` : "";
      const pageQueryStr: string = `
        query GetPostsGlobalPage {
          posts(first: 100${cursorParam}, where: { orderby: { field: DATE, order: DESC } }) {
            pageInfo { hasNextPage endCursor }
            nodes {
              ${postFields}
            }
          }
        }
      `;
      const pRes: Response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: pageQueryStr }),
        next: { revalidate: 60 },
      });

      if (!pRes.ok) break;

      const pJson: {
        data?: {
          posts?: {
            pageInfo?: { hasNextPage?: boolean; endCursor?: string };
            nodes?: Post[];
          };
        };
      } = await pRes.json();
      const posts: Post[] = pJson.data?.posts?.nodes || [];

      for (const p of posts) {
        if (matchesPost(p)) return fixImage(p);
      }

      hasNext = pJson.data?.posts?.pageInfo?.hasNextPage ?? false;
      endCursor = pJson.data?.posts?.pageInfo?.endCursor ?? null;
    }

    return null;
  } catch (error) {
    console.error(" Error fetching post by slug:", error);
    return null;
  }
}

export async function fetchHomePagePosts(): Promise<HomePagePosts> {
  const postFields = `
    id
    databaseId
    uri
    title(format: RENDERED)
    slug
    status
    link
    date
    content(format: RENDERED)
    excerpt(format: RENDERED)
    categories {
      nodes {
        id
        name
        slug
      }
    }
    author {
      node {
        name
      }
    }
    featuredImage {
      node {
        sourceUrl
        altText
        mediaDetails { width height }
      }
    }
  `;

  const query = `
    query HomePagePosts {
      featured: posts(
        first: 1
        where: { categoryName: "featured-news", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      politics: posts(
        first: 6
        where: { categoryName: "politics", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      society: posts(
        first: 6
        where: { categoryName: "society", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      breaking: posts(
        first: 6
        where: { categoryName: "breaking-news", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      economy: posts(
        first: 10
        where: { categoryName: "business", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      technology: posts(
        first: 6
        where: { categoryName: "technology-science", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      arts: posts(
        first: 6
        where: { categoryName: "arts", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      sports: posts(
        first: 6
        where: { categoryName: "sports", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      world: posts(
        first: 6
        where: { categoryName: "world", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      podcast: posts(
        first: 6
        where: { categoryName: "podcast", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      latest: posts(
        first: 12
        where: { categoryName: "latest-news", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      multimedia: posts(
        first: 6
        where: { categoryName: "multimedia", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      international: posts(
        first: 6
        where: { categoryName: "international", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      opinion: posts(
        first: 4
        where: { categoryName: "opinion", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      legal: posts(
        first: 6
        where: { categoryName: "legal", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      health: posts(
        first: 6
        where: { categoryName: "health-and-lifestyle", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }

      exclusive: posts(
        first: 7
        where: { categoryName: "exclusive", orderby: { field: DATE, order: DESC } }
      ) {
        nodes { ${postFields} }
      }
    }
  `;

  const emptyResult: HomePagePosts = {
    featured: [], trending: [], latest: [], politics: [], society: [],
    breaking: [], world: [], sports: [], podcast: [], technology: [], arts: [], economy: [],
    multimedia: [], international: [], opinion: [], legal: [], health: [], exclusive: [],
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`Fetch homepage posts HTTP error: ${response.status}`);
      return emptyResult;
    }

    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse JSON response from GraphQL:", text.substring(0, 200));
      return emptyResult;
    }

    if (json.errors) {
      console.error("GraphQL errors:", json.errors);
      return emptyResult;
    }

    const normalize = (posts: Post[]) =>
      posts.map((post) => {
        if (post.featuredImage?.node?.sourceUrl?.startsWith("/")) {
          post.featuredImage.node.sourceUrl = `https://cms.ktmpost.com${post.featuredImage.node.sourceUrl}`;
        }
        return post;
      });

    return {
      featured: normalize(json.data.featured.nodes),
      trending: normalize(json.data.politics.nodes),
      latest: normalize(json.data.latest.nodes),
      politics: normalize(json.data.politics.nodes),
      society: normalize(json.data.society.nodes),
      breaking: normalize(json.data.breaking.nodes),
      world: normalize(json.data.world.nodes),
      sports: normalize(json.data.sports.nodes),
      podcast: normalize(json.data.podcast.nodes),
      technology: normalize(json.data.technology.nodes),
      arts: normalize(json.data.arts.nodes),
      economy: normalize(json.data.economy.nodes),
      multimedia: normalize(json.data.multimedia?.nodes || []),
      international: normalize(json.data.international?.nodes || []),
      opinion: normalize(json.data.opinion?.nodes || []),
      legal: normalize(json.data.legal?.nodes || []),
      health: normalize(json.data.health?.nodes || []),
      exclusive: normalize(json.data.exclusive?.nodes || []),
    };
  } catch (error) {
    // Catches DNS failures, network errors, timeouts, etc.
    console.error("Error fetching homepage posts:", error);
    return emptyResult;
  }
}

export async function fetchRelatedPosts(
  categorySlug: string,
  excludedPostId: string,
  limit = 4
): Promise<Post[]> {
  const normalizedSlug = categorySlug ? categorySlug.toLowerCase().trim() : "";
  const slugsToTry = normalizedSlug ? (categorySlugAliases[normalizedSlug] || [normalizedSlug]) : [""];

  for (const targetSlug of slugsToTry) {
    const catFilter = targetSlug ? `categoryName: "${targetSlug}"` : "";
    const notInFilter = excludedPostId ? `notIn: ["${excludedPostId}"]` : "";
    const whereConditions = [catFilter, notInFilter, `orderby: { field: DATE, order: DESC }`]
      .filter(Boolean)
      .join("\n          ");

    const query = `
      query RelatedPosts {
        posts(
          first: ${limit}
          where: {
            ${whereConditions}
          }
        ) {
          nodes {
            id
            databaseId
            uri
            title(format: RENDERED)
            slug
            status
            link
            date
            content(format: RENDERED)
            excerpt(format: RENDERED)
            categories {
              nodes { id name slug }
            }
            featuredImage {
              node {
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                }
              }
            }
          }
        }
      }
    `;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const json = await res.json();
        const nodes = (json.data?.posts?.nodes as Post[]) ?? [];

        if (nodes.length > 0) {
          nodes.forEach((post) => {
            if (post.featuredImage?.node?.sourceUrl) {
              let imageUrl = post.featuredImage.node.sourceUrl;
              if (imageUrl.startsWith("/")) {
                imageUrl = `https://cms.ktmpost.com${imageUrl}`;
                post.featuredImage.node.sourceUrl = imageUrl;
              }
            }
          });

          return nodes;
        }
      }
    } catch (err) {
      console.error("Error in fetchRelatedPosts:", err);
    }
  }

  return [];
}


export async function getBannerAds(): Promise<BannerAd[]> {
  // Matches the exact schema confirmed in WPGraphQL IDE
  const query = `
    query GetBannerAds {
      bannerAds {
        nodes {
          title
          featuredImage {
            node {
              sourceUrl
            }
          }
          bannerAdDetails {
            link
            active
            priority
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });

    if (!res.ok) return [];
    const json = await res.json();
    if (json.errors || !json.data?.bannerAds?.nodes) return [];

    const banners: BannerAd[] = json.data.bannerAds.nodes
      .filter((node: any) => node.bannerAdDetails?.active)
      .map((node: any) => ({
        id: node.title,
        title: node.title,
        adTitle: node.title,
        adImage: node.featuredImage?.node?.sourceUrl || null,
        link: node.bannerAdDetails?.link || "",
        active: true,
        priority: Number(node.bannerAdDetails?.priority || 0),
        category: null,
      }));

    banners.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return banners;
  } catch {
    return [];
  }
}

export async function fetchAdsBanner(): Promise<BannerAd[]> {
  try {
    // 1. Try bannerAds (confirmed working in WPGraphQL IDE — Snickers ad)
    const newAds = await getBannerAds();
    if (newAds.length > 0) return newAds;

    // 2. Fallback to finalbannerads (legacy CPT)
    const queryFinal = `
      query GetFinalBannerAds {
        finalbannerads {
          nodes {
            id
            title
            date
            finalBannerFields {
              adimage { node { title sourceUrl } }
              link
              addtitle
              priority
              active
              category
              slug
            }
          }
        }
      }
    `;

    const resFinal = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: queryFinal }),
      cache: "no-store",
    });

    if (resFinal.ok) {
      const jsonFinal = await resFinal.json();
      if (jsonFinal?.data?.finalbannerads?.nodes?.length > 0) {
        const banners: BannerAd[] = jsonFinal.data.finalbannerads.nodes.map((node: any) => ({
          id: node.id,
          title: node.title,
          slug: node.finalBannerFields?.slug ?? null,
          category: node.finalBannerFields?.category ?? null,
          adTitle: node.finalBannerFields?.addtitle || node.title || "",
          adImage: node.finalBannerFields?.adimage?.node?.sourceUrl ?? null,
          link: node.finalBannerFields?.link ?? "",
          priority: Number(node.finalBannerFields?.priority ?? 0),
          active: node.finalBannerFields?.active !== undefined ? Boolean(node.finalBannerFields?.active) : true,
        }));
        banners.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        return banners;
      }
    }

    return [];
  } catch (error) {
    console.error("Error fetching banner ads:", error);
    return [];
  }
}

// ── WordPress-native search (supports Nepali + English) ──────────────────────
export async function searchPosts(query: string, first: number = 15): Promise<Post[]> {
  if (!query || query.trim().length === 0) return [];

  const gql = `
    query SearchPosts($search: String!) {
      posts(first: ${first}, where: { search: $search, orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            id
            uri
            title(format: RENDERED)
            slug
            status
            link
            date
            content(format: RENDERED)
            excerpt(format: RENDERED)
            categories {
              nodes {
                id
                name
                slug
              }
            }
            author {
              node {
                name
              }
            }
            featuredImage {
              node {
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: gql, variables: { search: query.trim() } }),
      next: { revalidate: 60 },
    });

    if (!response.ok) return [];
    const json: PostsResponse = await response.json();
    if (json.errors) return [];
    if (!json.data?.posts?.edges) return [];

    return json.data.posts.edges.map((edge) => {
      const post = edge.node;
      if (post.featuredImage?.node?.sourceUrl?.startsWith("/")) {
        post.featuredImage.node.sourceUrl = `https://cms.ktmpost.com${post.featuredImage.node.sourceUrl}`;
      }
      return post;
    });
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

// ── WordPress Categories & Footer Pages ───────────────────────────────────────
export interface WPCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface WPFooterPage {
  id: string;
  title: string;
  slug: string;
  uri: string;
}

export async function fetchWPCategories(): Promise<WPCategory[]> {
  const query = `
    query GetCategories {
      categories(first: 50, where: { hideEmpty: true }) {
        nodes {
          id
          name
          slug
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
      next: { revalidate: 60, tags: ["layout"] },
    });

    if (!response.ok) return [];
    const json = await response.json();
    return json.data?.categories?.nodes || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function fetchFooterPages(): Promise<WPFooterPage[]> {
  const query = `
    query GetFooterPages {
      pages(where: { name: "footer-links" }, first: 1) {
        nodes {
          children(first: 50, where: { status: PUBLISH }) {
            nodes {
              ... on Page {
                id
                title
                slug
                uri
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
      next: { revalidate: 60, tags: ["layout"] },
    });

    if (!response.ok) return [];
    const json = await response.json();
    const childNodes = json.data?.pages?.nodes?.[0]?.children?.nodes;
    return childNodes || [];
  } catch (error) {
    console.error("Error fetching footer pages:", error);
    return [];
  }
}

export interface NavbarMenuItem {
  id: string;
  title: string;
  slug: string;
  menuOrder?: number | null;
}

export async function fetchNavbarMenu(): Promise<NavbarMenuItem[]> {
  const query = `
    query GetNavbarMenu {
      navbarMenu: pages(where: { name: "navbar-menu" }, first: 1) {
        nodes {
          children(first: 50, where: { status: PUBLISH }) {
            nodes {
              ... on Page {
                id
                title
                slug
                menuOrder
              }
            }
          }
        }
      }
      topPages: pages(first: 100, where: { status: PUBLISH }) {
        nodes {
          id
          title
          slug
          menuOrder
          parent {
            node {
              slug
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
      next: { revalidate: 60, tags: ["layout"] },
    });

    if (!response.ok) return [];
    const json = await response.json();
    const childNodes: NavbarMenuItem[] = json.data?.navbarMenu?.nodes?.[0]?.children?.nodes || [];
    const topNodes: NavbarMenuItem[] = json.data?.topPages?.nodes || [];

    const map = new Map<string, NavbarMenuItem>();

    // Add pages with menuOrder set or pages under navbar-menu
    topNodes.forEach((node) => {
      if (
        (node.menuOrder !== null && node.menuOrder !== undefined && node.menuOrder > 0) ||
        (node as any).parent?.node?.slug === "navbar-menu"
      ) {
        map.set(node.slug, {
          id: node.id,
          title: node.title,
          slug: node.slug,
          menuOrder: node.menuOrder,
        });
      }
    });

    childNodes.forEach((node) => {
      if (!map.has(node.slug)) {
        map.set(node.slug, {
          id: node.id,
          title: node.title,
          slug: node.slug,
          menuOrder: node.menuOrder,
        });
      }
    });

    const result = Array.from(map.values());
    result.sort((a, b) => {
      const orderA = a.menuOrder && a.menuOrder > 0 ? a.menuOrder : 999;
      const orderB = b.menuOrder && b.menuOrder > 0 ? b.menuOrder : 999;
      return orderA - orderB;
    });

    return result;
  } catch (error) {
    console.error("Error fetching navbar menu pages:", error);
    return [];
  }
}



