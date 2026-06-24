import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { DrugsPage } from "@/pages/DrugsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { ReviewsPage } from "@/pages/ReviewsPage";
import { SignalsPage } from "@/pages/SignalsPage";
import { SourcesPage } from "@/pages/SourcesPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/reactions" replace />} />
        <Route path="/reactions" element={<SignalsPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/drugs" element={<DrugsPage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/reactions" replace />} />
      </Routes>
    </AppShell>
  );
}
