import { useState } from 'react';
import Layout from './components/Layout'; 
import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';

export default function App() {
  // Tip: Cambia temporalmente a 'true' si quieres saltarte el login para ver el front directamente
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  
  // Ahora puede ser 'login', 'register' o 'forgot'
  const [activeAuthTab, setActiveAuthTab] = useState('login'); 

  // Si no está autenticado, muestra el Login / Registro / Recuperación
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0b0b0f', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* 1. PANTALLA DE REGISTRO */}
        {activeAuthTab === 'register' && (
          <Register 
            onGoToLogin={() => setActiveAuthTab('login')} 
            onRegisterSuccess={() => setIsAuthenticated(true)} 
          />
        )}

        {/* 2. PANTALLA DE LOGIN */}
        {activeAuthTab === 'login' && (
          <Login 
            onGoToRegister={() => setActiveAuthTab('register')} 
            onLoginSuccess={() => setIsAuthenticated(true)} 
            onGoToForgot={() => setActiveAuthTab('forgot')} 
          />
        )}

        {/* 3. PANTALLA DE RECUPERAR CONTRASEÑA */}
        {activeAuthTab === 'forgot' && (
          <ForgotPassword 
            onGoToLogin={() => setActiveAuthTab('login')} 
          />
        )}

      </div>
    );
  }

  // Si está autenticado, el Layout toma el control total con su Sidebar y páginas
  return (
    <Layout 
      onLogout={() => {
        setIsAuthenticated(false);
        setActiveAuthTab('login');
      }} 
    />
  );
}