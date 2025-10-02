import { Button } from "@/components/ui/button";

type TabKey = "analytics" | "management" | "investments";

export default function BudgetTabs({ activeTab, onTabChange }: { activeTab: TabKey; onTabChange: (tab: TabKey) => void }) {
  const tabs = [
    { key: "analytics", label: "Analytics" },
    { key: "management", label: "Management" },
    { key: "investments", label: "Investments" },
  ];

  return (
    <div className="glass-card mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-0.5 px-2 py-1">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          variant="ghost"
          onClick={() => onTabChange(tab.key as TabKey)}
          className={`glass-text flex-1 rounded-full px-2 py-1 text-sm transition ${
            activeTab === tab.key
              ? "bg-gray-200/50 text-gray-900 shadow-lg"
              : "bg-transparent text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}