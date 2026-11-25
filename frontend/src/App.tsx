import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { AccountProvider } from "@/context/AccountContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";

import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  DashboardPage,
  AccountsPage,
  TransactionsPage,
  TransactionConfirmationPage,
  AlertsPage,
  DevicesPage,
  ProfilePage,
  BudgetsPage,
  SavingsPage,
  InsightsPage,
  ReportsPage,
  MapPage,
  CategoriesPage,
  NotFoundPage,
} from "@/pages";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AccountProvider>
            <ToastProvider>
              <ErrorBoundary>
                <CategoriesProvider>
                  <Routes>
                    {/* Rutas Públicas */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPasswordPage />}
                    />
                    <Route
                      path="/reset-password"
                      element={<ResetPasswordPage />}
                    />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route
                      path="/transactions/confirm"
                      element={<TransactionConfirmationPage />}
                    />

                    {/* Rutas Protegidas bajo AppLayout */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/accounts" element={<AccountsPage />} />
                      <Route
                        path="/transactions"
                        element={<TransactionsPage />}
                      />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/budgets" element={<BudgetsPage />} />
                      <Route path="/savings" element={<SavingsPage />} />
                      <Route path="/insights" element={<InsightsPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/security" element={<AlertsPage />} />
                      <Route path="/settings" element={<ProfilePage />} />
                      <Route path="/devices" element={<DevicesPage />} />
                      <Route path="/map" element={<MapPage />} />
                    </Route>

                    {/* Redirecciones y 404 */}
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </CategoriesProvider>
              </ErrorBoundary>
            </ToastProvider>
          </AccountProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
