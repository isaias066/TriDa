// ¿Qué? Componente raíz de la aplicación TriDa.
// ¿Para qué? Configurar el router principal, los providers globales (theme, auth,
//            bank) y todas las rutas del sistema (públicas y protegidas).
// ¿Impacto? Es el punto de entrada de toda la aplicación. Cambios aquí afectan
//           el árbol completo de componentes.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ==============================================================================
// PROVIDERS GLOBALES
// ==============================================================================

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { BankProvider } from "./context/BankContext";

// ==============================================================================
// LAYOUT Y PROTECCIÓN DE RUTAS
// ==============================================================================

import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";

// ==============================================================================
// PÁGINAS
// ==============================================================================

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
} from "./pages/index";

// ==============================================================================
// COMPONENTE
// ==============================================================================


export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <BankProvider>
            <Routes>

              {/* ==============================================================
                  RUTAS PÚBLICAS (sin autenticación)
                  ============================================================== */}

              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* ==============================================================
                  RUTAS PROTEGIDAS (requieren autenticación)
                  Todas se renderizan dentro de AppLayout (con Sidebar)
                  ============================================================== */}

              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Redirect raíz → dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Páginas principales */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/map" element={<TransactionMapPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* ==============================================================
                  RUTA 404 — Cualquier ruta no definida
                  ============================================================== */}

              <Route path="*" element={<NotFoundPage />} />

            </Routes>
          </BankProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}