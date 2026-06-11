import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import Notices from './pages/Notices';
import Reports from './pages/Reports';
import './index.css';

function App() {
  const { initAuthListener } = useAuthStore();

  useEffect(() => {
    initAuthListener();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<ProtectedRoute requiredRoles={['super-admin', 'admin']}><Members /></ProtectedRoute>} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/reports" element={<ProtectedRoute requiredRoles={['super-admin', 'admin']}><Reports /></ProtectedRoute>} />
        </Route>

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
