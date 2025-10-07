import { PageHeader } from "@/components/PageHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your personalized dashboard with recent messages, resources, spending, and tasks.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Dashboard" icon="Dashboard" />
      <div className="container mx-auto py-8">
        <p>Recent unseen messages, Unseen resources, Spending evolution, Tasks due today, Motivational quote. Layout customizable.</p>
        <p>Placeholder - to be implemented.</p>
      </div>
    </div>
  );
}
