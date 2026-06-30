import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DrugsPage } from "@/pages/DrugsPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { ReviewsPage } from "@/pages/ReviewsPage";
import { SignalsPage } from "@/pages/SignalsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="/" element={<Navigate to="/reactions" replace />} />
                <Route path="/reactions" element={<SignalsPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/drugs" element={<DrugsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="*" element={<Navigate to="/reactions" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
