import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "https://cms.bodhiberry.com/?graphql";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    
    
    const query = `
      query GetPosts {
        posts(first: 50, where: {orderby: {field: DATE, order: DESC}}) {
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
                }
              }
            }
          }
        }
      }
    `;
  

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ query }),
    });


    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    if (json.errors) {
      console.error("GraphQL errors:", json.errors);
      return NextResponse.json(
        { error: "GraphQL query failed", details: json.errors },
        { status: 500 }
      );
    }

    const posts = json.data?.posts?.edges?.map((edge: any) => {
      const post = edge.node;
      
      // Ensure featured image URLs are absolute
      if (post.featuredImage?.node?.sourceUrl) {
        let imageUrl = post.featuredImage.node.sourceUrl;
        if (imageUrl.startsWith('/')) {
          imageUrl = `http://cms.bodhiberry.com${imageUrl}`;
        }
        post.featuredImage.node.sourceUrl = imageUrl;
      }
      
      // Extract additional images from content
      const images: string[] = [];
      if (post.content) {
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        let match;
        while ((match = imgRegex.exec(post.content)) !== null) {
          if (match[1]) {
            let imageUrl = match[1];
            if (imageUrl.startsWith('/')) {
              imageUrl = `http://cms.bodhiberry.com${imageUrl}`;
            }
            images.push(imageUrl);
          }
        }
      }
      
      return {
        id: post.id,
        uri: post.uri,
        title: post.title,
        slug: post.slug,
        status: post.status,
        link: post.link,
        date: post.date,
        content: post.content,
        excerpt: post.excerpt || null,
        featuredImage: post.featuredImage?.node?.sourceUrl || null,
        images: images
      };
    }) || [];

    return NextResponse.json(posts, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });

  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}