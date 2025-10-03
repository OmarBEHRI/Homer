import { Card, CardTitle } from "@/components/ui/card";

export default function InvestmentsTab() {
  return (
    <div className="flex h-full items-center justify-center overflow-hidden">
      <Card className="glass-card flex max-w-xl flex-col items-center justify-center gap-4 px-8 py-16 text-center">
        <CardTitle className="glass-text text-3xl">Investments</CardTitle>
        <p className="glass-text text-base text-gray-600">
          Soon you&apos;ll diversify across stocks, crypto, gold, real estate and more—all orchestrated from here.
        </p>
        <div className="rounded-full border border-gray-300/30 bg-gray-100/30 px-6 py-3">
          <span className="glass-text text-sm uppercase tracking-[0.55em] text-gray-700">Coming Soon</span>
        </div>
      </Card>
    </div>
  );
}