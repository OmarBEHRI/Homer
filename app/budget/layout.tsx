import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budget",
  description: "Track your budget, analyze spending, and manage investments.",
};

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

