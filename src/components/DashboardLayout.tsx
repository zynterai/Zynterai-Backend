import { useEffect, useMemo, useState } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [nowLabel, setNowLabel] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowLabel(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const pageTitle = useMemo(() => {
    const titleMap: Record<string, string> = {
      "/": "Dashboard",
      "/ai-data-consolidation": "Data Consolidation",
      "/automated-insights": "Automated Insights",
      "/business-performance": "Business Performance",
      "/data-integration": "Data Integration",
      "/monitoring-alerts": "Monitoring and Alerts",
      "/scalable-architecture": "Scalable Architecture",
    };
    return titleMap[location.pathname] ?? "Dashboard";
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="min-h-screen min-h-dvh flex w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-black min-h-screen min-h-dvh">
          <header className="flex min-h-14 items-center justify-between gap-2 border-b border-white/10 px-3 sm:px-4 bg-black/95 backdrop-blur-sm shrink-0 pt-[env(safe-area-inset-top)]">
            <div className="flex items-center min-w-0">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0 transition-colors" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <h2 className="text-sm font-medium text-foreground truncate">{pageTitle}</h2>
                <p className="hidden sm:block text-[11px] text-muted-foreground/80">Live workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="hidden sm:inline-flex items-center rounded-full border border-border/50 bg-secondary/40 px-2 py-1 text-[11px] text-muted-foreground">
                {nowLabel}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => navigate(-1)}
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/")}
                title="Go to dashboard"
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 lg:p-6 bg-black pb-[max(1rem,env(safe-area-inset-bottom))]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
