import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FilterPanel } from "@/components/FilterPanel";
import { ReviewsTab } from "@/components/ReviewsTab";

export function ReviewsPage() {
  return (
    <ErrorBoundary>
      <FilterPanel />
      <ReviewsTab />
    </ErrorBoundary>
  );
}
