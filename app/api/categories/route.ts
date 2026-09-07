import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    // Single category lookup
    if (slug) {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          _count: { select: { posts: true, sponsors: true } },
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(category);
    }

    // All categories
    const categories = await prisma.category.findMany({
      orderBy: { menuOrder: "asc" },
      include: {
        _count: { select: { posts: true, sponsors: true } },
      },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
