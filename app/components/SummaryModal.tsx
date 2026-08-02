"use client";

import Image from "next/image";

type Props = {
  onClose: () => void;
  loading: boolean;
  summary: string;
};

export default function SummaryModal({ onClose, loading, summary }: Props) {
  // Function to replace trailing ellipsis with . or |
  const formatSummary = (text: string) => {
    if (!text) return "";

    const hasEllipsis = text.endsWith("…") || text.endsWith("...");
    if (hasEllipsis) {
      const ending = Math.random() < 0.5 ? "." : "|";
      text = text.replace(/…$|\.{3}$/, ending);
    }

    return text;
  };

  // Increase the summary by 100 characters (if available)
  const expandedSummary = summary.length ? summary.slice(0, summary.length + 100) : "";

  // Split summary at each "•" for new lines
  const renderSummary = (text: string) => {
    return formatSummary(text)
      .split("•")
      .map((line, index) => {
        const trimmed = line.trim();
        return trimmed ? <p key={index}>{trimmed}</p> : null;
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal content */}
      <div className="relative z-10 w-[90%] max-w-xl bg-white rounded-xl shadow-xl p-6 flex flex-col items-center">
        {/* Logo at top */}
        <div className="mb-4">
          <Image src="/logo.jpeg" alt="KTM Post Logo" width={100} height={30} className="h-8 w-auto object-contain" />
        </div>

        {/* Summarized content */}
        <div className="text-gray-800 max-h-[60vh] overflow-y-auto text-center text-[14px] font-semibold">
          {loading ? <p>Summarizing news…</p> : renderSummary(expandedSummary)}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
