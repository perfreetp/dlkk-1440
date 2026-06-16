import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import RegisterPage from "@/pages/RegisterPage";
import InspectionPage from "@/pages/InspectionPage";
import QuotePage from "@/pages/QuotePage";
import ConfirmPage from "@/pages/ConfirmPage";
import FollowupPage from "@/pages/FollowupPage";
import BottomNav from "@/components/BottomNav";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/inspection" element={<InspectionPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/followup" element={<FollowupPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
