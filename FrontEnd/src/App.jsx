import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './store/Context';
import Login from './components/Login';
import Layout from './components/Layout';
import './styles/Global.css';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}
