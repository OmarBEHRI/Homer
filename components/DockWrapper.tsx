"use client";

import { usePathname } from "next/navigation";
import { AppleStyleDock } from "@/components/AppleStyleDock";

export function DockWrapper() {
  const pathname = usePathname();
  if (pathname === "/") {
    return null;
  }

  return <AppleStyleDock />;
}



