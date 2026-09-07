import React from "react";
import FooterClient from "./FooterClient";
import { prisma } from "@/lib/prisma";

export default async function Footer() {
  let footerPages: { title: string; slug: string }[] = [];

  try {
    const pages = await prisma.staticPage.findMany({
      where: { isFooter: true },
      orderBy: { menuOrder: "asc" },
      select: { title: true, slug: true },
    });
    footerPages = pages;
  } catch (error) {
    console.error("Using default footer pages:", error);
  }

  return <FooterClient footerPages={footerPages as any} />;
}