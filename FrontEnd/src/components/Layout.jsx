import { useState } from 'react';
import Sidebar from './Slidebar';
import Dashboards from './Dashboards';
import TransactionMap from './TransactionMap';
import Transactions from './Transactions';
import Alerts from './Alerts';
import Users from './Users';
import Analytics from './Analytics';
import Settings from './Settings';
import '../styles/Layout.css';

export default function Layout() {
  const [tab, setTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const pages = {
    dashboard: Dashboards,
    map: TransactionMap,
    transactions: Transactions,
    alerts: Alerts,
    users: Users,
    analytics: Analytics,
    settings: Settings,
  };

  const Page = pages[tab] || Dashboards;

  return (
    <div className="app-layout">
      <Sidebar activeTab={tab} onTabChange={setTab} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`main-content ${collapsed ? 'mc-collapsed' : ''}`}>
        <Page />
      </main>
    </div>
  );
}