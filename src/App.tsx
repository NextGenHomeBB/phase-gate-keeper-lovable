
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { Suspense, lazy } from "react";

// Lazy load pages for better performance and code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const PhaseDetail = lazy(() => import("./pages/PhaseDetail"));
const EasyPhaseChecklist = lazy(() => import("./pages/EasyPhaseChecklist"));
const ChecklistCreator = lazy(() => import("./pages/ChecklistCreator"));
const SubcontractorPage = lazy(() => import("./pages/SubcontractorPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  usePerformanceMonitoring('app');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                }>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin-auth" element={<AdminAuth />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subcontractors"
                  element={
                    <ProtectedRoute>
                      <SubcontractorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/project/:projectId"
                  element={
                    <ProtectedRoute>
                      <ProjectPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/project/:projectId/phase/:phaseId"
                  element={
                    <ProtectedRoute>
                      <PhaseDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/easy-checklist"
                  element={
                    <ProtectedRoute>
                      <EasyPhaseChecklist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checklist-creator"
                  element={
                    <ProtectedRoute>
                      <ChecklistCreator />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
