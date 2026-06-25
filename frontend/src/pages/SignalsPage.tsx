import { useState } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FilterPanel } from "@/components/FilterPanel";
import { KpiCards } from "@/components/KpiCards";
import { MedDRATree } from "@/components/MedDRATree";
import { PostsSlidePanel } from "@/components/PostsSlidePanel";

export function SignalsPage() {
  const [selectedPt, setSelectedPt] = useState<string | null>(null);

  return (
    <ErrorBoundary>
      <FilterPanel />
      <KpiCards />
      <div className="mt-4 flex gap-4 items-start">
        <div
          className="min-w-0 transition-all duration-300"
          style={{ flex: selectedPt ? "0 0 58%" : "1 1 100%" }}
        >
          <MedDRATree selectedPt={selectedPt} onSelectPt={setSelectedPt} />
        </div>
        {selectedPt && (
          <div className="flex-1 min-w-0">
            <PostsSlidePanel pt={selectedPt} onClose={() => setSelectedPt(null)} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
