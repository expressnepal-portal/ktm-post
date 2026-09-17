import React from "react";
import FooterClient from "./FooterClient";
import { prisma } from "@/lib/prisma";

export default async function Footer() {
  let footerPages: { title: string; slug: string }[] = [];
  let settings: Record<string, string> = {};

  try {
    const [pages, settingsRecords] = await Promise.all([
      prisma.staticPage.findMany({
        where: { isFooter: true },
        orderBy: { menuOrder: "asc" },
        select: { title: true, slug: true },
      }),
      prisma.siteSetting.findMany(),
    ]);

    footerPages = pages;
    for (const record of settingsRecords) {
      settings[record.key] = record.value;
    }
  } catch (error) {
    console.error("Using default footer data:", error);
  }

  return <FooterClient footerPages={footerPages as any} settings={settings} />;
}