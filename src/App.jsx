import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Portal from './pages/Portal';
import ManagerView from './pages/ManagerView';
import CashierView from './pages/CashierView';
import CustomerKiosk from './pages/CustomerKiosk';
import MenuBoard from './pages/MenuBoard';
import LoginView from './pages/LoginView';
import { I18nProvider } from './i18n/I18nProvider';
import { A11yProvider } from './a11y/A11yProvider';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <I18nProvider>
        <A11yProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Portal />} />
              <Route path="/manager" element={<ManagerView />} />
              <Route path="/cashier" element={<CashierView />} />
              <Route path="/customer" element={<CustomerKiosk />} />
              <Route path="/menu-board" element={<MenuBoard />} />
              <Route path="/login" element={<LoginView />} />
            </Routes>
          </BrowserRouter>
        </A11yProvider>
      </I18nProvider>
    </AuthProvider>
  );
}

export default App;