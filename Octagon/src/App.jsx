import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import CashierDashboard from './pages/CashierDashboard';
import ProtectedRoute from './pages/ProtectedRoute';
import Portal from './pages/Portal';
import ManagerView from './pages/ManagerView';
import CashierView from './pages/CashierView';
import CustomerKiosk from './pages/CustomerKiosk';
import MenuBoard from './pages/MenuBoard';
import { I18nProvider } from './i18n/I18nProvider';
import { A11yProvider } from './a11y/A11yProvider';

function App() {
  // A simple way to check for a token. In a real app, you'd have a more robust auth context.
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <I18nProvider>
      <A11yProvider>
        <BrowserRouter>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/portal">POS Portal</Link></li>
              <li><Link to="/menu-board">Menu Board</Link></li>
              {token && <li><Link to="/manager">Manager</Link></li>}
              {token && <li><Link to="/cashier">Cashier</Link></li>}
              <li>
                {token ? (
                  <button type="button" onClick={handleLogout}>Logout</button>
                ) : (
                  <Link to="/login">Login</Link>
                )}
              </li>
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* POS interfaces (public) */}
            <Route path="/portal" element={<Portal />} />
            <Route path="/manager-view" element={<ManagerView />} />
            <Route path="/cashier-view" element={<CashierView />} />
            <Route path="/customer" element={<CustomerKiosk />} />
            <Route path="/menu-board" element={<MenuBoard />} />

            {/* Auth-protected dashboards */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute roles={['manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cashier"
              element={
                <ProtectedRoute roles={['manager', 'cashier']}>
                  <CashierDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </A11yProvider>
    </I18nProvider>
  );
}

export default App;