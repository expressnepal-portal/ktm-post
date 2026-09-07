import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const categorySlug = searchParams.get("categorySlug");

    // Build where clause: always active, optionally filtered by category
    const where: any = { active: true };

    if (categoryId) {
      // Show sponsors for this category + global sponsors (no category)
      where.OR = [{ categoryId }, { categoryId: null }];
    } else if (categorySlug) {
      // Look up category by slug first
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });
      if (category) {
        where.OR = [{ categoryId: category.id }, { categoryId: null }];
      }
    }

    const sponsors = await prisma.sponsor.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        bannerImage: {
          select: {
            id: true,
            url: true,
            alt: true,
            width: true,
            height: true,
          },
        },
        category: {
          select: { id: true, name: true, nepaliName: true, slug: true },
        },
      },
    });

    return NextResponse.json(sponsors);
  } catch (error: any) {
    console.error("Fetch sponsors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sponsors" },
      { status: 500 }
    );
  }
}
