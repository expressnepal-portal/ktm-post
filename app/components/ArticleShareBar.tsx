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

  const shareUrl = currentUrl || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
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
      // If clipboard write fails, attempt native share
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

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    messenger: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
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
          target="_blank"
          rel="noopener noreferrer"
          className="social-share-btn btn-x"
          aria-label="Share on X (Twitter)"
          title="Share on X"
        >
          <Twitter className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" />
        </a>

        {/* Copy Link / Native Share */}
        <button
          onClick={handleCopyLink}
          className="social-share-btn btn-copylink relative"
          aria-label="Copy news link"
          title={copied ? "Link Copied!" : "Copy Link"}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <ShareNodes className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}

          {/* Copied Tooltip Popover */}
          {copied && (
            <span className="copied-tooltip">
              लिंक कपी भयो!
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
