"use client";

import React from "react";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import { House, X, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Category } from "@/lib/type";
import NepaliDateTime from "./NepaliDateTime";
import Image from "next/image";
import { useMobileMenu } from "./MobileMenuContext"; 

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const categories: Category[] = [
    { nepali: "होमपेज", english: "Homepage", slug: "/" },
  { nepali: "समाचार", english: "News", slug: "news" },
  { nepali: "राजनीति", english: "News", slug: "politics" },
      { nepali: "विचार", english: "Opinion", slug: "opinion" },
    { nepali: "अर्थ", english: "Economy", slug: "economy" },
  { nepali: "अन्तराष्ट्रिय", english: "International", slug: "international" },
    { nepali: "खेलकुद", english: "खेलकुद", slug: "sports" },
  { nepali: "स्वास्थ्य/जीवन शैली", english: "Health and Lifestyle", slug: "health-and-lifestyle" },
      { nepali: "मल्टिमिडिया", english: "Multimedia", slug: "multimedia" },
  // { nepali: "अन्य", english: "Others", slug: "others" },

  // { nepali: "समाज", english: "News", slug: "society" },
  // { nepali: "विज्ञान प्रविधि", english: "विज्ञान प्रविधि", slug: "technology" },
  // { nepali: "कला साहित्य", english: "कला साहित्य", slug: "arts" },
  // { nepali: "विश्व", english: "विश्व", slug: "world" },
];

export default function Header() {
  const pathname = usePathname() || "";
  const { mobileMenuOpen, setMobileMenuOpen } = useMobileMenu();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300">
      {/* TOP UTILITY & LOGO BAR (Hides on scroll > 80px) */}
      <div
        className={`w-full max-w-[1920px] mx-auto px-mobile-safe relative flex flex-col items-center transition-all duration-300 ${
          scrolled
            ? "max-h-0 opacity-0 py-0 overflow-hidden"
            : "max-h-60 opacity-100 py-3"
        }`}
      >
        {/* Date & Location (Top utility line) */}
        <div className="w-full flex items-center justify-between border-b border-gray-100 pb-2 mb-3 text-xs tracking-wider text-gray-500 uppercase font-medium">
          <span className="hidden sm:inline">Kathmandu, Nepal</span>
          <div className="mx-auto sm:mx-0">
            <NepaliDateTime />
          </div>
          <span className="hidden sm:inline">English / नेपाली</span>
        </div>

        {/* Logo Masthead */}
        <div className="flex items-center justify-between w-full">
          {/* Brand Logo (left-aligned on mobile, centered on desktop) */}
          <div className="flex-grow flex justify-start lg:justify-center py-1">
            <Link href={"/"} className="transition-opacity hover:opacity-90">
              <Image
                src="/logo.png"
                width={200}
                height={40}
                alt="KTM Post Logo"
                className="h-8 sm:h-10 md:h-12 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Mobile Hamburger menu on the right */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE COMPACT HEADER WHEN SCROLLED */}
      {scrolled && (
        <div className="lg:hidden flex items-center justify-between px-mobile-safe py-2 border-b border-gray-100 bg-white">
          <Link href={"/"} className="transition-opacity hover:opacity-90">
            <Image
              src="/logo.png"
              width={120}
              height={26}
              alt="KTM Post Logo"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      )}

      {/* DESKTOP STICKY NAVBAR */}
      <nav className="hidden lg:block bg-white border-t border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto flex justify-center items-center px-12 py-1 relative">
          {/* Small brand logo on left when scrolled */}
          {scrolled && (
            <div className="absolute left-6 flex items-center">
              <Link href={"/"} className="transition-opacity hover:opacity-90">
                <Image
                  src="/logo.png"
                  width={110}
                  height={24}
                  alt="KTM Post Logo"
                  className="h-6 w-auto object-contain"
                />
              </Link>
            </div>
          )}

          <div className="flex items-center gap-1">
            {/* Category Links */}
            <ul className="flex items-center gap-1 font-extrabold">
              {categories.map((item, index) => {
                const isHome = item.slug === "/";
                const href = isHome ? "/" : `/${item.slug}`;
                const isActive = isHome
                  ? pathname === "/"
                  : pathname.startsWith(`/${item.slug}`);
                return (
                  <li key={index}>
                    <Link href={href}>
                      <span
                        className={`inline-block px-4 py-2 font-bold tracking-wide transition-all uppercase border-b-2 border-transparent text-lg ${
                          isActive
                            ? "text-nepal-red border-nepal-red"
                            : "text-gray-800 hover:text-nepal-red hover:border-nepal-red"
                        }`}
                      >
                        {item.nepali}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>

      {/* MOBILE SLIDE-IN MENU */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <div
        className={`fixed top-0 right-0 w-80 h-full bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <span className="font-bold text-xl tracking-wide">
            <Image 
              src="/logo.png" 
              width={120} 
              height={30} 
              alt="Nepal Voices" 
              className="h-8 w-auto object-contain"
            />
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Close Menu"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile Menu Navigation Items */}
        <div className="py-4 overflow-y-auto h-[calc(100vh-80px)]">
          <ul className="flex flex-col px-4 gap-1">
            {categories.map((cat) => {
              const isHome = cat.slug === "/";
              const href = isHome ? "/" : `/${cat.slug}`;
              const isActive = isHome ? pathname === "/" : pathname.startsWith(`/${cat.slug}`);
              return (
                <li key={cat.slug}>
                  <Link
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-semibold transition-colors ${
                      isActive
                        ? "bg-gray-50 text-nepal-red"
                        : "text-gray-800 hover:bg-gray-50 hover:text-nepal-red"
                    }`}
                  >
                    {cat.nepali}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </header>
  );
}