// ¿Qué? Componente raíz de la aplicación TriDa.
// ¿Para qué? Configurar el router principal, providers globales (theme, auth, bank, toast) y rutas del sistema.
// ¿Impacto? Punto de entrada central de la interfaz; integra notificaciones flotantes y contextos globales.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from '@context/ThemeContext';
import { AuthProvider } from '@context/AuthContext';
import { BankProvider } from '@context/BankContext';
import { ToastProvider } from '@components/ui/Toast';

import { AppLayout } from '@components/layout/AppLayout';
import { ProtectedRoute } from '@components/shared/ProtectedRoute';

import {
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  DashboardPage,
  AlertsPage,
  TransactionsPage,
  TransactionMapPage,
  UsersPage,
  AnalyticsPage,
  SettingsPage,
  NotFoundPage,
} from '@pages/index';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <BankProvider>
            <ToastProvider>
              <Routes>
                {/* RUTAS PÚBLICAS */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* RUTAS PROTEGIDAS */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/map" element={<TransactionMapPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* RUTA 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ToastProvider>
          </BankProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
