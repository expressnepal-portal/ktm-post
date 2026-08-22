"use client";

import React, { useState, useEffect } from "react";
import Facebook from "./Icons/Facebook";
import Messenger from "./Icons/Messenger";
import Whatsapp from "./Icons/Whatsapp";
import Twitter from "./Icons/Twitter";
import ShareNodes from "./Icons/ShareNodes";

interface ArticleShareBarProps {
  title: string;
  publishedDate?: string;
  authorName?: string;
  url?: string;
  className?: string;
}

export default function ArticleShareBar({
  title,
  publishedDate,
  url,
  className = "",
}: ArticleShareBarProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(url || "");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    } else if (url) {
      setCurrentUrl(url);
    }
  }, [url]);

  const shareUrl =
    currentUrl || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    messenger: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
  };

  // Function to handle sharing across platforms
  const handleShare = (
    e: React.MouseEvent,
    platform: "facebook" | "messenger" | "whatsapp" | "twitter"
  ) => {
    e.preventDefault();
    if (typeof window === "undefined") return;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (platform === "messenger") {
      // 1. If mobile browser supports native share with app targets, use it as priority or direct messenger scheme
      if (isMobile) {
        // Try fb-messenger:// URI scheme directly first
        const fbMessengerUri = `fb-messenger://share?link=${encodedUrl}&app_id=291494419107518`;

        // Attempt to trigger app scheme
        const clickedTime = Date.now();
        window.location.href = fbMessengerUri;

        setTimeout(() => {
          // If page is still focused / visible after 1.2s, the app is not installed -> fallback to Web Share or Facebook Send URL
          if (!document.hidden && Date.now() - clickedTime < 2500) {
            if (navigator.share) {
              navigator
                .share({
                  title: title,
                  text: `${title} - ${shareUrl}`,
                  url: shareUrl,
                })
                .catch(() => {});
            } else {
              window.open(
                `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`,
                "_blank",
                "noopener,noreferrer"
              );
            }
          }
        }, 1200);
        return;
      }

      // Desktop: Open Messenger dialog directly in popup or new tab
      const webUrl = `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`;
      window.open(webUrl, "_blank", "noopener,noreferrer,width=600,height=500");
      return;
    }

    if (platform === "whatsapp") {
      if (isMobile) {
        // WhatsApp mobile deep link / intent
        const whatsappUrl = `whatsapp://send?text=${encodedTitle}%20${encodedUrl}`;
        window.location.href = whatsappUrl;
        setTimeout(() => {
          if (!document.hidden) {
            window.open(
              `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
              "_blank",
              "noopener,noreferrer"
            );
          }
        }, 1500);
        return;
      }
      window.open(
        `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    if (platform === "facebook") {
      const fbSharerUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
      window.open(
        fbSharerUrl,
        "_blank",
        "noopener,noreferrer,width=600,height=500"
      );
      return;
    }

    if (platform === "twitter") {
      if (isMobile) {
        const twitterAppUrl = `twitter://post?message=${encodedTitle}%20${encodedUrl}`;
        window.location.href = twitterAppUrl;
        setTimeout(() => {
          if (!document.hidden) {
            window.open(
              `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
              "_blank",
              "noopener,noreferrer"
            );
          }
        }, 1500);
        return;
      }
      window.open(
        `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }
  };

  const handleNativeOrCopyShare = async () => {
    if (typeof window === "undefined") return;

    // Check if mobile device and Web Share API is supported
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: title,
          text: title,
          url: shareUrl,
        });
        return;
      } catch (err: unknown) {
        // If aborted or failed, proceed to clipboard copy fallback
        if ((err as Error)?.name === "AbortError") {
          return;
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else if (shareUrl) {
        // Fallback for older browsers
        const tempInput = document.createElement("input");
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // If clipboard write fails, attempt native share as a last resort
      if (navigator.share && shareUrl) {
        try {
          await navigator.share({
            title: title,
            url: shareUrl,
          });
        } catch {
          // User cancelled share
        }
      }
    }
  };

  return (
    <div className={`article-share-container ${className}`}>
      {/* Published Date (Left) */}
      {publishedDate && (
        <div className="article-published-time font-nepali-serif">
          <span>प्रकाशित:</span> <time>{publishedDate}</time>
        </div>
      )}

      {/* Social Share Buttons (Right) */}
      <div className="article-share-actions">
        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          onClick={(e) => handleShare(e, "facebook")}
          target="_blank"
          rel="noopener noreferrer"
          className="social-share-btn btn-facebook"
          aria-label="Share on Facebook"
          title="Share on Facebook"
        >
          <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </a>

        {/* Messenger */}
        <a
          href={shareLinks.messenger}
          onClick={(e) => handleShare(e, "messenger")}
          target="_blank"
          rel="noopener noreferrer"
          className="social-share-btn btn-messenger"
          aria-label="Share on Messenger"
          title="Share on Messenger"
        >
          <Messenger className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </a>

        {/* WhatsApp */}
        <a
          href={shareLinks.whatsapp}
          onClick={(e) => handleShare(e, "whatsapp")}
          target="_blank"
          rel="noopener noreferrer"
          className="social-share-btn btn-whatsapp"
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
        >
          <Whatsapp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </a>

        {/* X / Twitter */}
        <a
          href={shareLinks.twitter}
          onClick={(e) => handleShare(e, "twitter")}
          target="_blank"
          rel="noopener noreferrer"
          className="social-share-btn btn-x"
          aria-label="Share on X (Twitter)"
          title="Share on X"
        >
          <Twitter className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" />
        </a>

        {/* Native Share on Mobile / Copy Link on Desktop */}
        <button
          onClick={handleNativeOrCopyShare}
          className="social-share-btn btn-copylink relative"
          aria-label="Share or copy news link"
          title={copied ? "Link Copied!" : "Share / Copy Link"}
          type="button"
        >
          {copied ? (
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-scale-check"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <ShareNodes className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}

          {/* Copied Tooltip Popover */}
          {copied && <span className="copied-tooltip">लिंक कपी भयो!</span>}
        </button>
      </div>
    </div>
  );
}