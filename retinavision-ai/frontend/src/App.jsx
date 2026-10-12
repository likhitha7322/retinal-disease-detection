import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PatientDetails from './pages/PatientDetails';
import FundusUpload from './pages/FundusUpload';
import AIAnalysis from './pages/AIAnalysis';
import ScreeningHistory from './pages/ScreeningHistory';
import ModelInformation from './pages/ModelInformation';
import Settings from './pages/Settings';
import HelpSupport from './pages/HelpSupport';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Clinical Workstation Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="patient" element={<PatientDetails />} />
              <Route path="upload" element={<FundusUpload />} />
              <Route path="analysis" element={<AIAnalysis />} />
              <Route path="history" element={<ScreeningHistory />} />
              <Route path="model" element={<ModelInformation />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<HelpSupport />} />

              {/* Route Aliases */}
              <Route path="patients" element={<Navigate to="/patient" replace />} />
              <Route path="model-info" element={<Navigate to="/model" replace />} />
              <Route path="dashboard" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
