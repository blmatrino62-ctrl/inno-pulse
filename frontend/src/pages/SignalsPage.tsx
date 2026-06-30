import { useState } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FilterPanel } from "@/components/FilterPanel";
import { KpiCards } from "@/components/KpiCards";
import { MedDRATree } from "@/components/MedDRATree";
import { PostsSlidePanel } from "@/components/PostsSlidePanel";
import { TopReactionsChart } from "@/components/TopReactionsChart";

export function SignalsPage() {
  const [selectedPt, setSelectedPt] = useState<string | null>(null);

  return (
    <ErrorBoundary>
      <FilterPanel />
      <KpiCards />
      <div className="mt-4 flex gap-4 items-start">
        {/* Left column: top reactions chart */}
        {!selectedPt && (
          <div className="w-64 flex-shrink-0">
            <TopReactionsChart />
          </div>
        )}

        {/* Center: MedDRA tree */}
        <div className="flex-1 min-w-0">
          <MedDRATree selectedPt={selectedPt} onSelectPt={setSelectedPt} />
        </div>

        {/* Right: slide panel when PT selected */}
        {selectedPt && (
          <div className="w-80 flex-shrink-0">
            <PostsSlidePanel pt={selectedPt} onClose={() => setSelectedPt(null)} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
