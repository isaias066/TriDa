import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, BankProvider } from './store/Context';
import { AuthProvider, useAuth } from './store/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Layout from './components/Layout';
import './styles/Global.css';

function LoginRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <BankProvider>
            <Routes>
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              } />
            </Routes>
          </BankProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}