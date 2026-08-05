"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
export default function Footer() {
  const currentYear = new Date().getFullYear();
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
            {[
              "About Us",
              "Advertise",
              "Privacy Policy",
              "Terms of Service",
              "Accessibility",
              "Contact",
            ].map((link) => (
              <li key={link}>
                <Link
                  href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="hover:text-nepal-red transition-colors duration-200"
                >
                  {link}
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