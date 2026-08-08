"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { WPFooterPage } from "@/lib/wordpress";

interface FooterClientProps {
  footerPages: WPFooterPage[];
}

export default function FooterClient({ footerPages }: FooterClientProps) {
  const currentYear = new Date().getFullYear();

  // Fallback links if no WP footer pages returned
  const defaultLinks = [
    { title: "About Us", slug: "about-us" },
    { title: "Advertise", slug: "advertise" },
    { title: "Privacy Policy", slug: "privacy-policy" },
    { title: "Terms of Service", slug: "terms-of-service" },
    { title: "Accessibility", slug: "accessibility" },
    { title: "Contact", slug: "contact" },
  ];

  const linksToRender =
    footerPages && footerPages.length > 0
      ? footerPages.map((page) => ({ title: page.title, slug: page.slug }))
      : defaultLinks;

  return (
    <footer className="bg-[#f2f2f0] border-t-4 border-transparent w-full mt-20 relative">
      {/* Two-tone accent bar matching logo colors */}
      <div className="w-full h-1 flex">
        <div className="flex-1 bg-[#2f6fb0]"></div>
        <div className="flex-1 bg-nepal-red"></div>
      </div>

      <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 py-10 md:py-14 flex flex-col md:flex-row items-center md:justify-between gap-8">
        {/* Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <Link href="/">
            <Image
              src="/logo.png"
              width={130}
              height={32}
              alt="KTM Post Logo"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="text-xs text-gray-500 font-poppins text-center md:text-left leading-relaxed">
            &copy; {currentYear} KTM Post. All rights reserved.
            <br />
            डिजी भिजन प्रा. लि., सूचना विभाग द.नं. ५३१६-२०८२/०८३
          </p>
        </div>
        {/* Quick Links */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <ul className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
            {linksToRender.map((link) => (
              <li key={link.slug}>
                <Link
                  href={`/${link.slug}`}
                  className="hover:text-nepal-red transition-colors duration-200"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-gray-400 font-poppins tracking-wide">
            Trusted Journalism from the Himalayas
          </p>
        </div>
      </div>
    </footer>
  );
}
