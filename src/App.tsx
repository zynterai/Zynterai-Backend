import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const Index = lazy(() => import("./pages/Index.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const PlatformSectionPage = lazy(() => import("./pages/PlatformSectionPage.tsx"));
const DataConsolidationBlock = lazy(() =>
  import("./components/platform/SectionFunctionalBlocks.tsx").then((m) => ({ default: m.DataConsolidationBlock }))
);
const AutomatedInsightsBlock = lazy(() =>
  import("./components/platform/SectionFunctionalBlocks.tsx").then((m) => ({ default: m.AutomatedInsightsBlock }))
);
const BusinessPerformanceBlock = lazy(() =>
  import("./components/platform/SectionFunctionalBlocks.tsx").then((m) => ({ default: m.BusinessPerformanceBlock }))
);
const DataIntegrationBlock = lazy(() =>
  import("./components/platform/SectionFunctionalBlocks.tsx").then((m) => ({ default: m.DataIntegrationBlock }))
);
const MonitoringAlertsBlock = lazy(() =>
  import("./components/platform/SectionFunctionalBlocks.tsx").then((m) => ({ default: m.MonitoringAlertsBlock }))
);
const ScalableArchitectureBlock = lazy(() =>
  import("./components/platform/SectionFunctionalBlocks.tsx").then((m) => ({ default: m.ScalableArchitectureBlock }))
);

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route
                path="/ai-data-consolidation"
                element={
                  <ProtectedRoute>
                    <PlatformSectionPage
                      title="AI-powered data consolidation and analysis"
                      description="Consolidate fragmented datasets from across the organization and apply AI-driven processing to transform raw data into high-value intelligence."
                    >
                      <DataConsolidationBlock />
                    </PlatformSectionPage>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/automated-insights"
                element={
                  <ProtectedRoute>
                    <PlatformSectionPage
                      title="Automated insights and strategic report generation"
                      description="Generate timely insights and executive-ready reports automatically, helping teams move from analysis to strategic decision-making faster."
                    >
                      <AutomatedInsightsBlock />
                    </PlatformSectionPage>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business-performance"
                element={
                  <ProtectedRoute>
                    <PlatformSectionPage
                      title="Centralized dashboards for business performance"
                      description="Track KPIs from one centralized location with cross-functional dashboards tailored for operations, management, and leadership visibility."
                    >
                      <BusinessPerformanceBlock />
                    </PlatformSectionPage>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data-integration"
                element={
                  <ProtectedRoute>
                    <PlatformSectionPage
                      title="Integration with multiple data sources"
                      description="Connect and unify data from internal systems, third-party platforms, and external feeds to ensure consistent and comprehensive analytics."
                    >
                      <DataIntegrationBlock />
                    </PlatformSectionPage>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/monitoring-alerts"
                element={
                  <ProtectedRoute>
                    <PlatformSectionPage
                      title="Real-time monitoring and intelligence alerts"
                      description="Monitor live business metrics and receive proactive alerts on anomalies and threshold events so teams can respond immediately."
                    >
                      <MonitoringAlertsBlock />
                    </PlatformSectionPage>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scalable-architecture"
                element={
                  <ProtectedRoute>
                    <PlatformSectionPage
                      title="Scalable architecture for SMEs and enterprises"
                      description="Built to scale from growing SMEs to enterprise workloads with a flexible architecture that supports increasing users, data volume, and complexity."
                    >
                      <ScalableArchitectureBlock />
                    </PlatformSectionPage>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
