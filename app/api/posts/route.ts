import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        featuredImage: true,
        author: {
          select: { name: true, image: true },
        },
        categories: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("Fetch posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
