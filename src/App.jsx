import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // ✅ import Toaster
// import SignUpPage from "./pages/signup";
import LoginPage from "./pages/login";
// import ForgotPasswordPage from "./pages/forgot-password";
import AdminConsoleLayout from "./layouts/DashboardLayout";
import AdminDashboard from "./pages/dashboard";
import AdminUsers from "./pages/user";
import AdminDocuments from "./pages/documents";
import AdminTickets from "./pages/tickets";
import AdminSettings from "./pages/settings";
import AdminOnboarding from "./pages/onboarding reviews";
import AdminActivity from "./pages/activity";
import AdminCompliance from "./pages/compliance";
import AdminCacApplications from "./pages/cac applications";
import AdminFirsApplications from "./pages/firs applications";
import AdminSculmApplications from "./pages/sculm applications";
import AdminUserDetails from "./pages/user details";
// import DashboardHome from "./pages/Dashboard";
// import FounderProfile from "./pages/founder profile";
// import FounderSettings from "./pages/settings";
// import FounderTickets from "./pages/ticketing";
// import FounderAIWalkthrough from "./pages/FounderAIWalkthrough";
// import FounderOnboarding from "./pages/onboarding";
// import FundingPathwayPage from "./pages/Funding";
// import Compliance from "./pages/compliance";
// import DocumentsVault from "./pages/document vault";
// import ComplianceForm from "./pages/compliance form";
// import Strategy from "./pages/strategy";
// import StrategySessions from "./pages/strategy session";

function App() {
  return (
    <div className="font-mont">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: { fontSize: "14px" }
        }}
      />
      <Routes>
        {/* ================= AUTH ROUTES ================= */}
        <Route path="/login" element={<LoginPage />} />

        {/* ================= DASHBOARD ROUTES ================= */}
        <Route path="/admin" element={<AdminConsoleLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="activity" element={<AdminActivity />} />

          <Route path="users" element={<AdminUsers />} />
          <Route path="onboarding" element={<AdminOnboarding />} />

          <Route path="documents" element={<AdminDocuments />} />
          <Route path="compliance" element={<AdminCompliance />} />

          <Route path="tickets" element={<AdminTickets />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="cac" element={<AdminCacApplications />} />
          <Route path="firs" element={<AdminFirsApplications />} />
          <Route path="sculm" element={<AdminSculmApplications />} />
          <Route path="users/:userId" element={<AdminUserDetails />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
