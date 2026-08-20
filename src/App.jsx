import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';

function withLayout(page) {
  return (
    <ProtectedRoute>
      <Layout>{page}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={withLayout(<Dashboard />)} />
          <Route path="/orders" element={withLayout(<Orders />)} />
          <Route path="/inventory" element={withLayout(<Inventory />)} />
          <Route path="/invoices" element={withLayout(<Invoices />)} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
