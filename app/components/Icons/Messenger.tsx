import React from "react";

interface IconProps {
  className?: string;
}

export default function Messenger({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.512 3.735 7.186.196.144.318.371.327.615l.09 1.916c.038.804.887 1.326 1.62.996l2.138-.962a.965.965 0 0 1 .632-.047c1.11.306 2.29.47 3.458.47 5.523 0 10-4.146 10-9.258C24 6.145 19.523 2 12 2Zm5.787 7.158-2.88 4.568a1.5 1.5 0 0 1-2.146.427l-2.293-1.72a.5.5 0 0 0-.6-.002l-3.1 2.355c-.413.313-.96-.155-.72-.619l2.88-4.567a1.5 1.5 0 0 1 2.146-.427l2.293 1.72a.5.5 0 0 0 .6.002l3.1-2.355c.414-.313.96.155.72.618Z" />
    </svg>
  );
}
