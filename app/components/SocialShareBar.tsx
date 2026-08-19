"use client";

import { useState, useEffect } from "react";
import Instagram from "./Icons/Instagram";
import Facebook from "./Icons/Facebook";
import Twitter from "./Icons/Twitter";
import Whatsapp from "./Icons/Whatsapp";
import Close from "./Icons/Close";
import Share from "./Icons/Share";
import { useMobileMenu } from "./MobileMenuContext"; // <CHANGE> added import

type Props = {
  title: string;
};

export default function SocialShareBar({ title }: Props) {
  const [open, setOpen] = useState(false);
  const [distance, setDistance] = useState(55);
  const [scrolled, setScrolled] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  const { mobileMenuOpen } = useMobileMenu(); // <CHANGE> get mobileMenuOpen from context

  useEffect(() => {
    const updateDistance = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      if (width < 640) setDistance(30);
      else if (width < 1024) setDistance(45);
      else setDistance(55);
    };
    updateDistance();
    window.addEventListener("resize", updateDistance);
    return () => window.removeEventListener("resize", updateDistance);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && screenWidth < 1024) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [screenWidth]);

  // <CHANGE> Hide when mobile menu is open on screens smaller than lg (1024px)
  if (mobileMenuOpen && screenWidth < 1024) {
    return null;
  }

  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const handleCopyInstagram = () => {
    navigator.clipboard.writeText(`${title} ${url}`);
    alert("Link copied! Share it on Instagram.");
  };

  const socialItems = [
    {
      element: <Facebook />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      onClick: undefined,
    },
    {
      element: <Whatsapp />,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      onClick: undefined,
    },
    {
      element: <Twitter />,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      onClick: undefined,
    },
    {
      element: <Instagram />,
      href: undefined,
      onClick: handleCopyInstagram,
    },
  ];

  const buttonClasses = `flex items-center justify-center bg-black text-white rounded-full transition-all duration-300 ease-in-out`;
  const gapClass = !scrolled || screenWidth >= 1024 ? "gap-2" : "gap-0";
  const iconSizeClass = "w-5 h-5";

  const mainButtonClasses =
    screenWidth < 640 && (open || scrolled)
      ? "w-8 h-8"
      : open
        ? "w-10 h-10"
        : !scrolled || screenWidth >= 640
          ? "px-3 py-2 h-10"
          : "w-10 h-10";

  const socialButtonClasses =
    screenWidth < 640 && open ? "w-8 h-8" : "w-10 h-10";

  return (
    <div className="relative mt-6 flex items-center justify-center">
      <button
        onClick={() => setOpen(!open)}
        className={`${buttonClasses} ${mainButtonClasses} ${gapClass} flex items-center justify-center`}
      >
        {!open ? (
          <>
            <Share
              className={`${iconSizeClass} transition-all duration-300 ease-in-out`}
            />
            {!scrolled || screenWidth >= 1024 ? <span>Share News</span> : null}
          </>
        ) : (
          <div
            className={`${mainButtonClasses} flex items-center justify-center transition-all duration-300 ease-in-out`}
          >
            <Close className={iconSizeClass} />
          </div>
        )}
      </button>

      {open &&
        socialItems.map((item, index) => {
          const angle = -30 + index * 20;
          const x = distance * Math.cos((angle * Math.PI) / 62);
          const y = -distance * Math.sin((angle * Math.PI) / 62);

          return (
            <div
              key={index}
              className="absolute left-1/2"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                transition: "transform 0.3s ease-out",
              }}
            >
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${socialButtonClasses} rounded-full flex items-center justify-center bg-black text-white`}
                >
                  {item.element}
                </a>
              ) : (
                <button
                  onClick={item.onClick}
                  className={`${socialButtonClasses} rounded-full flex items-center justify-center bg-black text-white`}
                >
                  {item.element}
                </button>
              )}
            </div>
          );
        })}
    </div>
  );
}
