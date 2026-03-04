import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NuevoTurnoPage from './pages/NuevoTurnoPage';
import HistorialPage from './pages/HistorialPage';
import TurnoDetallePage from './pages/TurnoDetallePage';
import PerfilPage from './pages/PerfilPage';
import AdminPage from './pages/AdminPage';
import Layout from './components/Layout';
import './styles.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash"><div className="taxi-logo">🚕</div></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="nuevo-turno" element={<NuevoTurnoPage />} />
        <Route path="turno/:id" element={<TurnoDetallePage />} />
        <Route path="historial" element={<HistorialPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
