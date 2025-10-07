import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat with friends and colleagues in real-time.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

