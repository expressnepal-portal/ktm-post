"use client";

import React from "react";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import { House, X, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Category } from "@/lib/type";
import NepaliDateTime from "./NepaliDateTime";
import Image from "next/image";
import { useMobileMenu } from "./MobileMenuContext"; 

import SearchDropdown from "./SearchDropdown";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

interface HeaderClientProps {
  categories: Category[];
}

export default function HeaderClient({ categories }: HeaderClientProps) {
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
            : "max-h-60 opacity-100 py-1.5 sm:py-2"
        }`}
      >
        {/* Date & Location (Top utility line) - 3-column grid for perfect alignment */}
        <div className="w-full grid grid-cols-3 items-center border-b border-gray-100 pb-1 mb-1.5 text-xs tracking-wider text-gray-500 uppercase font-medium">
          <span className="hidden sm:block text-left">Kathmandu, Nepal</span>
          <div className="col-span-3 sm:col-span-1 text-center">
            <NepaliDateTime />
          </div>
          <span className="hidden sm:block text-right">English / नेपाली</span>
        </div>

        {/* Logo Masthead */}
        <div className="flex items-center justify-between w-full px-2 py-2 relative">
          {/* Left: Mobile menu */}
          <div className="flex items-center justify-start min-w-[120px]">
            <div className="lg:hidden shrink-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
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

          {/* Center: Brand Logo */}
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="transition-transform duration-200 hover:scale-[1.01]">
              <Image
                src="/logo.png"
                width={360}
                height={90}
                alt="KTM Post Logo"
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Right: Search */}
          <div className="flex items-center justify-end min-w-[120px]">
            <SearchDropdown />
          </div>
        </div>
      </div>

      {/* DESKTOP STICKY NAVBAR - cleanly centered */}
      <nav className="hidden lg:block bg-white border-t border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between px-mobile-safe py-1.5">
          {/* Left: logo when scrolled */}
          {scrolled ? (
            <div className="flex items-center shrink-0 mr-4">
              <Link href={"/"} className="transition-opacity hover:opacity-90">
                <Image
                  src="/logo.png"
                  width={180}
                  height={40}
                  alt="KTM Post Logo"
                  className="h-8 lg:h-9 w-auto object-contain"
                />
              </Link>
            </div>
          ) : null}

          {/* Navigation items - cleanly centered */}
          <div className="flex-1 flex justify-center overflow-x-auto no-scrollbar">
            <ul className="flex items-center space-x-1 xl:space-x-3 text-nepal-black font-nepali-serif">
              {categories.map((item, index) => {
                const isHome = item.slug === "/";
                const href = isHome ? "/" : `/${item.slug}`;
                const isActive = isHome
                  ? pathname === "/"
                  : pathname.startsWith(`/${item.slug}`);
                return (
                  <li key={index} className="shrink-0">
                    <Link href={href}>
                      <span
                        className={`inline-block px-2 xl:px-3 py-1 font-bold tracking-wide transition-all uppercase border-b-2 text-sm xl:text-base ${
                          isActive
                            ? "text-nepal-red border-nepal-red"
                            : "text-gray-800 border-transparent hover:text-nepal-red hover:border-nepal-red"
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

          {/* Right: search when scrolled */}
          {scrolled ? (
            <div className="flex items-center shrink-0 ml-4">
              <SearchDropdown />
            </div>
          ) : null}
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
