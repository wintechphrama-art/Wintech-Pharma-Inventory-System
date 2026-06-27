import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "@/pages/auth/LoginPage";
import AccessDenied from "@/pages/auth/AccessDenied";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import MaterialsPage from "@/pages/materials/MaterialsPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import EmployeesPage from "@/pages/employees/EmployeesPage";
import MachinesPage from "@/pages/machines/MachinesPage";
import IssueMaterialPage from "@/pages/transactions/IssueMaterialPage";
import ReturnsPage from "@/pages/transactions/ReturnsPage";
import TransactionHistoryPage from "@/pages/transactions/TransactionHistoryPage";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AuditLogsPage from "@/pages/audit/AuditLogsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/access-denied" element={<AccessDenied />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/materials"
          element={
            <ProtectedRoute>
              <MaterialsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions/issue"
          element={
            <ProtectedRoute
              allowedRoles={["super_admin", "store_manager", "supervisor"]}
            >
              <IssueMaterialPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions/returns"
          element={
            <ProtectedRoute
              allowedRoles={["super_admin", "store_manager", "supervisor"]}
            >
              <ReturnsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions/history"
          element={
            <ProtectedRoute
              allowedRoles={["super_admin", "store_manager"]}
            >
              <TransactionHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute
              allowedRoles={["super_admin", "store_manager"]}
            >
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute
              allowedRoles={["super_admin"]}
            >
              <EmployeesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/machines"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <MachinesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}