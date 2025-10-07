import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Organize your projects and tasks with tables and lists.",
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

