import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FilterPanel } from "@/components/FilterPanel";
import { KpiCards } from "@/components/KpiCards";
import { SignalTable } from "@/components/SignalTable";

export function SignalsPage() {
  return (
    <ErrorBoundary>
      <FilterPanel />
      <KpiCards />
      <SignalTable />
    </ErrorBoundary>
  );
}
