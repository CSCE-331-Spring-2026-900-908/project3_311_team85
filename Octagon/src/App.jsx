import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Portal from './pages/Portal';
import ManagerView from './pages/ManagerView';
import CashierView from './pages/CashierView';
import CustomerKiosk from './pages/CustomerKiosk';
import MenuBoard from './pages/MenuBoard';
import { I18nProvider } from './i18n/I18nProvider';

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          {/* Centralized Portal Page */}
          <Route path="/" element={<Portal />} />
          
          {/* Isolated Interface Views */}
          <Route path="/manager" element={<ManagerView />} />
          <Route path="/cashier" element={<CashierView />} />
          <Route path="/customer" element={<CustomerKiosk />} />
          <Route path="/menu-board" element={<MenuBoard />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;