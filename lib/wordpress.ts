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
  economy: ["business", "economy"],
  business: ["business", "economy"],
  technology: ["science-and-technology", "technology"],
  "science-and-technology": ["science-and-technology", "technology"],
  international: ["international", "world"],
  world: ["world", "international"],
  "health-and-lifestyle": ["health-and-lifestyle", "society"],
  news: ["news"],
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
  const decodedSlug = decodeURIComponent(slug);
  console.log(`Fetching post with slug: ${decodedSlug}...`);

  const escapedSlug = decodedSlug
    .replace(/"/g, '\\"')
    .replace(/\n/g, "")
    .replace(/\r/g, "");

  const query = `
    query GetPostBySlug {
      postBy(slug: "${escapedSlug}") {
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
        revalidate: 60,
      },
    });

    if (!response.ok) {
      console.warn(`WordPress API unavailable (${response.status}) at ${API_URL}`);
      return null;
    }

    const json: {
      data?: { postBy: Post | null };
      errors?: Array<{ message: string }>;
    } = await response.json();

    if (json.data?.postBy) {
      const post = json.data.postBy;
      if (post.featuredImage?.node?.sourceUrl?.startsWith("/")) {
        post.featuredImage.node.sourceUrl = `https://cms.ktmpost.com${post.featuredImage.node.sourceUrl}`;
      }
      return post;
    }

    // Fallback: try querying by post URI if slug lookup failed
    const uriQuery = `
      query GetPostByUri {
        post(id: "${escapedSlug}", idType: SLUG) {
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
    `;

    const uriRes = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: uriQuery }),
      next: { revalidate: 60 },
    });

    if (uriRes.ok) {
      const uriJson = await uriRes.json();
      if (uriJson.data?.post) {
        const post = uriJson.data.post;
        if (post.featuredImage?.node?.sourceUrl?.startsWith("/")) {
          post.featuredImage.node.sourceUrl = `https://cms.ktmpost.com${post.featuredImage.node.sourceUrl}`;
        }
        return post;
      }
    }

    // Fallback 3: try querying by DATABASE_ID if input is numeric or database ID
    const databaseId = parseInt(escapedSlug, 10);
    if (!isNaN(databaseId)) {
      const idQuery = `
        query GetPostById {
          post(id: "${databaseId}", idType: DATABASE_ID) {
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
          const post = idJson.data.post;
          if (post.featuredImage?.node?.sourceUrl?.startsWith("/")) {
            post.featuredImage.node.sourceUrl = `https://cms.ktmpost.com${post.featuredImage.node.sourceUrl}`;
          }
          return post;
        }
      }
    }

    // Fallback 4: If input is a transliterated Latin slug, search recent posts and match by transliterateSlug
    const searchRes = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetRecentPostsForSlugMatch {
            posts(first: 300, where: { orderby: { field: DATE, order: DESC } }) {
              nodes {
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
                  nodes { id name slug }
                }
                featuredImage {
                  node {
                    sourceUrl
                    altText
                    mediaDetails { width height }
                  }
                }
              }
            }
          }
        `,
      }),
      next: { revalidate: 60 },
    });

    if (searchRes.ok) {
      const searchJson = await searchRes.json();
      const posts: Post[] = searchJson.data?.posts?.nodes || [];
      const match = posts.find((p) => {
        if (!p.slug) return false;
        const roman = transliterateSlug(p.slug);
        return roman === escapedSlug.toLowerCase() || p.slug === escapedSlug;
      });

      if (match) {
        if (match.featuredImage?.node?.sourceUrl?.startsWith("/")) {
          match.featuredImage.node.sourceUrl = `https://cms.ktmpost.com${match.featuredImage.node.sourceUrl}`;
        }
        return match;
      }
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
  const query = `
    query RelatedPosts {
      posts(
        first: ${limit}
        where: {
          categoryName: "${categorySlug}"
          notIn: ["${excludedPostId}"]
          orderby: { field: DATE, order: DESC }
        }
      ) {
        nodes {
          id
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
  `;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    next: { revalidate: 60 },
  });
  const json = await res.json();
  const nodes = (json.data?.posts?.nodes as Post[]) ?? [];

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



