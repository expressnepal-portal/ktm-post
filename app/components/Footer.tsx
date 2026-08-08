import React from "react";
import FooterClient from "./FooterClient";
import { fetchFooterPages } from "@/lib/wordpress";

export default async function Footer() {
  const footerPages = await fetchFooterPages();
  return <FooterClient footerPages={footerPages} />;
}