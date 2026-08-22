import React from "react";
import HeaderClient from "./HeaderClient";
import { fetchNavbarMenu } from "@/lib/wordpress";
import { Category } from "@/lib/type";

export default async function Header() {
  const navbarPages = await fetchNavbarMenu();

  const categories: Category[] = [
    { nepali: "होमपेज", english: "Homepage", slug: "/" },
    ...navbarPages.map((page) => {
      let slug = page.slug;
      if (page.slug === "समाचार" || page.title === "समाचार") {
        slug = "news";
      } else if (page.slug === "खेलकुद" || page.title === "खेलकुद") {
        slug = "sports";
      } else if (page.slug === "science-technology" || page.title === "सूचना-प्रविधि") {
        slug = "technology";
      }
      return {
        nepali: page.title,
        english: page.title,
        slug,
      };
    }),
  ];

  return <HeaderClient categories={categories} />;
}