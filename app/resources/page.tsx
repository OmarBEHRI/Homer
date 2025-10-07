import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources",
  description: "Store and share resources in categories: Wealth, Knowledge, Recreation.",
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Resources</h1>
        <p>Store and share resources in categories: Wealth, Knowledge, Recreation.</p>
        <p>Placeholder - to be implemented.</p>
      </div>
    </div>
  );
}
