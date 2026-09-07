import React from "react";
import HeaderClient from "./HeaderClient";
import { prisma } from "@/lib/prisma";
import { Category } from "@/lib/type";

// Default standard categories used as fallback and initial seeding
export const DEFAULT_NAVBAR_CATEGORIES: Category[] = [
  { nepali: "होमपेज", english: "Homepage", slug: "/" },
  { nepali: "समाचार", english: "News", slug: "news" },
  { nepali: "राजनीति", english: "Politics", slug: "politics" },
  { nepali: "विचार", english: "Opinion", slug: "opinion" },
  { nepali: "अर्थ", english: "Economy", slug: "economy" },
  { nepali: "खेलकुद", english: "Sports", slug: "sports" },
  { nepali: "स्वास्थ्य/जीवन शैली", english: "Health & Lifestyle", slug: "health-and-lifestyle" },
  { nepali: "विज्ञान प्रविधि", english: "Technology", slug: "technology" },
  { nepali: "अन्तराष्ट्रिय", english: "World", slug: "world" },
  { nepali: "कानून", english: "Legal", slug: "legal" },
  { nepali: "मल्टिमिडिया", english: "Multimedia", slug: "multimedia" },
];

export default async function Header() {
  let categories: Category[] = DEFAULT_NAVBAR_CATEGORIES;

  try {
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        category: true,
      },
    });

    if (dbMenuItems && dbMenuItems.length > 0) {
      categories = [
        { nepali: "होमपेज", english: "Homepage", slug: "/" },
        ...dbMenuItems.map((item) => ({
          nepali: item.nepaliLabel || item.label,
          english: item.label,
          slug: item.url.startsWith("/") ? item.url.slice(1) : item.url,
        })),
      ];
    }
  } catch (error) {
    console.error("Using default categories for header:", error);
  }

  return <HeaderClient categories={categories} />;
}
