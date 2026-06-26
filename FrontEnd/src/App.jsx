import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, BankProvider } from './store/Context';
import Login from './components/Login';
import Layout from './components/Layout';
import './styles/Global.css';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <BankProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<Layout />} />
          </Routes>
        </BankProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}