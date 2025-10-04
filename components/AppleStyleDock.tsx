"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  ListCheck,
  DollarSign,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  // Get unread message count for chat badge
  const unreadCount = useQuery(api.chatQueries.getUnseenMessageCount) ?? 0;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <Dock className="pointer-events-auto items-end pb-3">
        {data.map((item, idx) => (
          <Link key={idx} href={item.href} className="group">
            <DockItem className="aspect-square rounded-2xl border border-white/50 bg-white/25 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.37)] transition-transform duration-300 ease-out hover:scale-[1.12] relative">
              <DockLabel className="bg-neutral-900/80 text-white/90 shadow-lg backdrop-blur-md">
                {item.title}
              </DockLabel>
              <DockIcon className="text-neutral-700 drop-shadow-lg">
                {item.icon}
              </DockIcon>
              
              {/* Unread message badge for chat */}
              {item.title === "Chat" && unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-medium shadow-lg">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
            </DockItem>
          </Link>
        ))}
      </Dock>
    </div>
  );
}
