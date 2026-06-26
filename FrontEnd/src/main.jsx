import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider, BankProvider } from './store/Context';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BankProvider>
        <App />
      </BankProvider>
    </ThemeProvider>
  </React.StrictMode>,
);