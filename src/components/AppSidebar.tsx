import { useEffect, useState } from "react";
import {
  Database,
  FileText,
  LayoutDashboard,
  Plug,
  Bell,
  Server,
  LogOut,
  Settings,
  User,
  Palette,
  Shield,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { path: "/", title: "Main dashboard", icon: LayoutDashboard },
  { path: "/ai-data-consolidation", title: "AI-powered data consolidation and analysis", icon: Database },
  { path: "/automated-insights", title: "Automated insights and strategic report generation", icon: FileText },
  { path: "/business-performance", title: "Centralized dashboards for business performance", icon: LayoutDashboard },
  { path: "/data-integration", title: "Integration with multiple data sources", icon: Plug },
  { path: "/monitoring-alerts", title: "Real-time monitoring and intelligence alerts", icon: Bell },
  { path: "/scalable-architecture", title: "Scalable architecture for SMEs and enterprises", icon: Server },
];

export function AppSidebar() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [profileError, setProfileError] = useState("");
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!dialogOpen) return;
    setEditName(user?.name ?? "");
    setEditEmail(user?.email ?? "");
    setProfileError("");
    setSettingsSaved(false);
    setInAppNotifications(localStorage.getItem("zentrov_notify_inapp") !== "false");
    setEmailAlerts(localStorage.getItem("zentrov_notify_email") !== "false");
    setTheme(localStorage.getItem("zentrov_theme") || "dark");
  }, [dialogOpen, user]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("zentrov_theme") || "dark";
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (nextTheme: string) => {
    const root = document.documentElement;
    const resolved =
      nextTheme === "system"
        ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : nextTheme;
    root.classList.remove("dark", "light");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMenuClick = (path: string) => {
    if (location.pathname !== path) navigate(path);
    if (isMobile) setOpenMobile(false);
  };

  const handleSaveProfile = async () => {
    if (savingSettings) return;
    setSavingSettings(true);
    setSettingsSaved(false);
    setProfileError("");

    const profileResult = await updateProfile(editName, editEmail);
    if (!profileResult.ok) {
      setProfileError(profileResult.message ?? "Unable to save profile.");
      setSavingSettings(false);
      return;
    }

    if (newPassword.trim() || currentPassword.trim()) {
      const passwordResult = await changePassword(currentPassword, newPassword);
      if (!passwordResult.ok) {
        setProfileError(passwordResult.message ?? "Unable to update password.");
        setSavingSettings(false);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
    }

    localStorage.setItem("zentrov_notify_inapp", String(inAppNotifications));
    localStorage.setItem("zentrov_notify_email", String(emailAlerts));
    localStorage.setItem("zentrov_theme", theme);
    applyTheme(theme);

    setSettingsSaved(true);
    setSavingSettings(false);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Logo */}
        <div className="relative h-20 flex items-center justify-center px-4 border-b border-sidebar-border">
          {isMobile ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 z-10 h-9 w-9 -translate-y-1/2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setOpenMobile(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </Button>
          ) : null}
          <div className="w-full h-full flex items-center justify-center shrink-0">
            <img src={logo} alt="Logo" className="w-28 h-28 object-contain" />
          </div>
        </div>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-muted-foreground/70 text-xs uppercase tracking-wider">Platform</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuButton
                    onClick={() => handleMenuClick(item.path)}
                    isActive={location.pathname === item.path}
                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors h-auto min-h-9 items-start py-2 text-left"
                  >
                    <item.icon className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                    {!collapsed && (
                      <span className="text-xs sm:text-sm leading-snug break-words">{item.title}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="w-full flex items-center gap-2 rounded-md p-1.5 hover:bg-sidebar-accent/40 transition-colors text-left"
          title="Open settings"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          {!collapsed ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-foreground truncate leading-tight">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate leading-tight">{user?.email || ""}</p>
              </div>
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            </>
          ) : null}
        </button>
        {!collapsed ? (
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full mt-2 h-9 justify-center border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        ) : null}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="w-[calc(100vw-1.5rem)] max-w-3xl max-h-[85dvh] overflow-y-auto sm:w-full p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>Manage your profile details and account information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <section className="rounded-lg border border-border/40 bg-secondary/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Profile</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Display name</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Email</label>
                  <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" />
                </div>
              </section>

              <section className="rounded-lg border border-border/40 bg-secondary/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Notifications</h3>
                </div>
                <label className="flex items-center justify-between text-sm text-foreground">
                  <span>In-app notifications</span>
                  <input type="checkbox" checked={inAppNotifications} onChange={(e) => setInAppNotifications(e.target.checked)} />
                </label>
                <label className="flex items-center justify-between text-sm text-foreground">
                  <span>Email alerts for test results</span>
                  <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
                </label>
              </section>

              <section className="rounded-lg border border-border/40 bg-secondary/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Appearance</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </section>

              <section className="rounded-lg border border-border/40 bg-secondary/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Security</h3>
                </div>
                <p className="text-xs text-muted-foreground">Update password and secure your account.</p>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                />
              </section>

              {profileError ? <p className="text-sm text-destructive">{profileError}</p> : null}
              {settingsSaved ? <p className="text-sm text-success">Settings saved successfully.</p> : null}
            </div>
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} className="w-full sm:w-auto" disabled={savingSettings}>
                {savingSettings ? "Saving..." : "Save settings"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  );
}
