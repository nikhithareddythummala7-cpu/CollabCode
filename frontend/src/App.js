import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CreateSessionPage from './pages/CreateSessionPage';
import JoinSessionPage from './pages/JoinSessionPage';
import CodingRoom from './pages/CodingRoom';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSessions from './pages/admin/AdminSessions';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <AuthPage /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />}
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/create-session"
        element={
          <PrivateRoute>
            {user?.role === 'interviewer' ? (
              <CreateSessionPage />
            ) : (
              <Navigate to="/dashboard" replace />
            )}
          </PrivateRoute>
        }
      />
      <Route
        path="/join-session"
        element={
          <PrivateRoute>
            <JoinSessionPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/session/:roomId"
        element={
          <PrivateRoute>
            <CodingRoom />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute adminOnly>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute adminOnly>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/sessions"
        element={
          <PrivateRoute adminOnly>
            <AdminLayout>
              <AdminSessions />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <PrivateRoute adminOnly>
            <AdminLayout>
              <AdminAnalytics />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <PrivateRoute adminOnly>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;