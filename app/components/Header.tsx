import React from "react";
import HeaderClient from "./HeaderClient";
import { fetchNavbarMenu } from "@/lib/wordpress";
import { Category } from "@/lib/type";

export default async function Header() {
  const navbarPages = await fetchNavbarMenu();

  const categories: Category[] = [
    { nepali: "होमपेज", english: "Homepage", slug: "/" },
    ...navbarPages.map((page) => ({
      nepali: page.title,
      english: page.title,
      slug: page.slug,
    })),
  ];

  return <HeaderClient categories={categories} />;
}