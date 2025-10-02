"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  ListCheck,
  DollarSign,
  BookOpen,
  MessageCircle,
} from "lucide-react";

import { Dock, DockIcon, DockItem, DockLabel } from "@/components/core/dock";

const data = [
  {
    title: "Dashboard",
    icon: (
      <LayoutDashboard className="h-full w-full text-neutral-700" />
    ),
    href: "/dashboard",
  },
  {
    title: "Tasks",
    icon: (
      <ListCheck className="h-full w-full text-neutral-700" />
    ),
    href: "/tasks",
  },
  {
    title: "Budget",
    icon: (
      <DollarSign className="h-full w-full text-neutral-700" />
    ),
    href: "/budget",
  },
  {
    title: "Resources",
    icon: (
      <BookOpen className="h-full w-full text-neutral-700" />
    ),
    href: "/resources",
  },
  {
    title: "Chat",
    icon: (
      <MessageCircle className="h-full w-full text-neutral-700" />
    ),
    href: "/chat",
  },
];

export function AppleStyleDock() {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <Dock className="pointer-events-auto items-end pb-3">
        {data.map((item, idx) => (
          <Link key={idx} href={item.href} className="group">
            <DockItem className="aspect-square rounded-2xl border border-white/50 bg-white/25 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.37)] transition-transform duration-300 ease-out hover:scale-[1.12]">
              <DockLabel className="bg-neutral-900/80 text-white/90 shadow-lg backdrop-blur-md">
                {item.title}
              </DockLabel>
              <DockIcon className="text-neutral-700 drop-shadow-lg">
                {item.icon}
              </DockIcon>
            </DockItem>
          </Link>
        ))}
      </Dock>
    </div>
  );
}
