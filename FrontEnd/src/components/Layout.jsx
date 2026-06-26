import { useState, useEffect } from 'react';
import Slidebar from './Slidebar'; // ¡Asegurado el nombre real!
import Dashboards from './Dashboards';
import TransactionMap from './TransactionMap';
import Transactions from './Transactions';
import Alerts from './Alerts';
import Users from './Users';
import Analytics from './Analytics';
import Settings from './Settings';
import { useBank } from '../store/Context';
import '../styles/Layout.css';

export default function Layout({ onLogout }) {
  const [tab, setTab]           = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  const { selectedBank } = useBank();

  useEffect(() => {
    const qs = selectedBank && selectedBank !== 'all'
      ? `?banco=${encodeURIComponent(selectedBank)}`
      : '';
    fetch(`http://localhost:5000/api/transacciones${qs}`)
      .then(res => res.json())
      .then(data => {
        const count = (data || []).filter(
          t => t.alertLevel === 'critical' || t.alertLevel === 'high' ||
               t.nivel_alerta === 'critical' || t.nivel_alerta === 'high' ||
               Number(t.score_riesgo) >= 60
        ).length;
        setAlertCount(count);
      })
      .catch(err => console.error('Error cargando transacciones para badge:', err));
  }, [selectedBank]);

  const pages = {
    dashboard:    Dashboards,
    map:          TransactionMap,
    transactions: Transactions,
    alerts:       Alerts,
    users:        Users,
    analytics:    Analytics,
    settings:     Settings,
  };

  const Page = pages[tab] || Dashboards;

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0b0f' }}>
      <Slidebar
        activeTab={tab}
        onTabChange={setTab}
        alertCount={alertCount}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={onLogout}
      />
      <main className={`main-content ${collapsed ? 'mc-collapsed' : ''}`} style={{ flex: 1, padding: '20px', color: '#fff', overflowY: 'auto' }}>
        <Page />
      </main>
    </div>
  );
}