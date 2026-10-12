import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import BrandWatermark from '../components/BrandWatermark';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import ChatbotWidget from '../components/ChatbotWidget';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Determine title based on current route
  const getPageMeta = (pathname) => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return { title: 'Clinical Screening Dashboard', subtitle: 'Overview of retinal diagnostic workload & triage' };
      case '/patient':
      case '/patients':
        return { title: 'Patient Registration & Intake', subtitle: 'Demographics, diabetic history, and ophthalmic records' };
      case '/upload':
        return { title: 'Fundus Image Acquisition & Quality Gate', subtitle: 'Upload photograph and run physiological pre-filter check' };
      case '/analysis':
        return { title: 'AI Diagnostic Assessment & XAI', subtitle: 'Neural classification, Grad-CAM++ saliency, and lesion audit' };
      case '/history':
        return { title: 'Screening Examination Registry', subtitle: 'Searchable historical archive of vitreo-retinal scans' };
      case '/model':
      case '/model-info':
        return { title: 'Model Architecture & Validation Metrics', subtitle: 'Technical lineage, benchmarks, and multi-center validation' };
      case '/settings':
        return { title: 'Workstation Configuration & Guardrails', subtitle: 'Quality gate cutoff, warning thresholds, and hospital profile' };
      case '/help':
        return { title: 'Clinical SOP & Technical Support', subtitle: '7-step screening workflow guide & emergency contacts' };
      default:
        return { title: 'Clinical Ophthalmology Screening', subtitle: 'AI-assisted vitreo-retinal disease detection' };
    }
  };

  const { title, subtitle } = getPageMeta(location.pathname);

  return (
    <div className="app-container">
      {/* Eye / Retina Brand Watermark behind content on every page */}
      <BrandWatermark />

      {/* Dark Navy Hospital Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        <Topbar
          title={title}
          subtitle={subtitle}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
        />

        <main className="content-area">
          <Outlet />
        </main>

        <Footer />
      </div>

      {/* Non-intrusive Toast Banner */}
      <Toast />

      {/* Floating Chatbot Assistant Widget */}
      <ChatbotWidget />
    </div>
  );
}

