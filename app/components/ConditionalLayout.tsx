"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function ConditionalLayout({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <main className="pt-24 sm:pt-28 lg:pt-54 min-h-screen">{children}</main>
      {footer}
    </>
  );
}
