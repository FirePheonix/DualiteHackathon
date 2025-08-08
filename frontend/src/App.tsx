import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProjectCards from './components/ProjectCards';
import BottomSection from './components/BottomSection';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import UploadPage from './pages/UploadPage';
import { useAuth } from './hooks/useAuth';

function HomePage() {
  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <Header />
      <HeroSection />
      <ProjectCards />
      <BottomSection />
    </div>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - user:', user, 'loading:', loading);

  if (loading) {
    console.log('ProtectedRoute - showing loading state');
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-gray mx-auto mb-4"></div>
          <p className="font-poppins text-black">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - redirecting to auth, no user found');
    return <Navigate to="/auth" replace />;
  }

  console.log('ProtectedRoute - rendering protected content');
  return <>{children}</>;
};


function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-gray mx-auto mb-4"></div>
          <p className="font-poppins text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/test" element={<div>Test route working!</div>} />
        <Route path="/debug" element={
          <div className="min-h-screen bg-[#F2F2F2] pt-32 pb-16">
            <div className="container mx-auto px-4">
              <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
              <div className="bg-white p-4 rounded-lg">
                <p>Check the browser console for Supabase environment variable status.</p>
                <p>If you see "Missing Supabase environment variables" error, your .env file is not configured properly.</p>
              </div>
            </div>
          </div>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
