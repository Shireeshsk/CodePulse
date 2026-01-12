import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CodeEditor from './pages/CodeEditor';
import Profile from './pages/Profile';
import AdminProblems from './pages/AdminProblems';
import BrowseProblems from './pages/BrowseProblems';
import ProblemDetail from './pages/ProblemDetail';
import EditProblem from './pages/EditProblem';
import EditCodeTemplate from './pages/EditCodeTemplate';
import AdminUsers from './pages/AdminUsers';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0a0a0a'
      }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Public Route (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0a0a0a'
      }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return !user ? children : <Navigate to="/dashboard" replace />;
}

// Admin Route (only for admin users)
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0a0a0a'
      }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/code"
            element={
              <ProtectedRoute>
                <CodeEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/problems"
            element={
              <AdminRoute>
                <AdminProblems />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/edit-problem/:id"
            element={
              <AdminRoute>
                <EditProblem />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/edit-template/:id"
            element={
              <AdminRoute>
                <EditCodeTemplate />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/problems"
            element={
              <ProtectedRoute>
                <BrowseProblems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problem/:id"
            element={
              <ProtectedRoute>
                <ProblemDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={4000} theme="dark" pauseOnHover />
      </AuthProvider>
    </Router>
  );
}

export default App;
