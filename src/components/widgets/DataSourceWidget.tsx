import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Database, BarChart3, Building2, Cloud, CheckCircle2, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

type SourceStatus = "connected" | "syncing" | "pending";

interface SourceRow {
  id: string;
  name: string;
  icon: typeof Database;
  type: string;
  status: SourceStatus;
}

const initialSources: SourceRow[] = [
  { id: "pg", name: "PostgreSQL", icon: Database, type: "Database", status: "connected" },
  { id: "ga", name: "Google Analytics", icon: BarChart3, type: "Analytics", status: "connected" },
  { id: "sf", name: "Salesforce", icon: Building2, type: "Enterprise", status: "syncing" },
  { id: "s3", name: "AWS S3", icon: Cloud, type: "Cloud Storage", status: "connected" },
  { id: "snow", name: "Snowflake", icon: Database, type: "Data Warehouse", status: "connected" },
  { id: "hub", name: "HubSpot", icon: Building2, type: "CRM", status: "pending" },
];

const SYNC_MS_MIN = 1600;
const SYNC_MS_MAX = 2600;

const DataSourceWidget = () => {
  const [sources, setSources] = useState<SourceRow[]>(initialSources);
  const syncTimersRef = useRef<Record<string, ReturnType<typeof window.setTimeout>>>({});

  const clearSyncTimer = (id: string) => {
    const t = syncTimersRef.current[id];
    if (t !== undefined) {
      window.clearTimeout(t);
      delete syncTimersRef.current[id];
    }
  };

   
  useEffect(() => {
    const t = window.setTimeout(() => {
      setSources((prev) =>
        prev.map((s) => (s.id === "sf" && s.status === "syncing" ? { ...s, status: "connected" } : s)),
      );
    }, 2800);
    return () => window.clearTimeout(t);
  }, []);

   
  useEffect(() => {
    return () => {
      Object.values(syncTimersRef.current).forEach((t) => window.clearTimeout(t));
      syncTimersRef.current = {};
    };
  }, []);

  const scheduleConnected = (id: string) => {
    clearSyncTimer(id);
    const ms = SYNC_MS_MIN + Math.random() * (SYNC_MS_MAX - SYNC_MS_MIN);
    syncTimersRef.current[id] = window.setTimeout(() => {
      setSources((p) => p.map((x) => (x.id === id && x.status === "syncing" ? { ...x, status: "connected" } : x)));
      delete syncTimersRef.current[id];
    }, ms);
  };

  const handleSourceClick = (id: string) => {
    setSources((prev) => {
      const target = prev.find((s) => s.id === id);
      if (!target || target.status === "syncing") return prev;

      if (target.status === "pending") {
        queueMicrotask(() => scheduleConnected(id));
        return prev.map((s) => (s.id === id ? { ...s, status: "syncing" as const } : s));
      }

      clearSyncTimer(id);
      return prev.map((s) => (s.id === id ? { ...s, status: "pending" as const } : s));
    });
  };

   
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-3 sm:p-4 min-w-0"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Data Source Input</h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 max-w-md leading-snug">
            Click a source to connect or disconnect. Pending sources sync automatically; active sources disconnect to idle.
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Database className="w-4 h-4 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {sources.map((source, i) => (
          <motion.button
            type="button"
            key={source.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 + i * 0.05 }}
            onClick={() => handleSourceClick(source.id)}
            disabled={source.status === "syncing"}
            aria-label={`${source.name}, ${source.status === "connected" ? "connected" : source.status === "syncing" ? "syncing" : "disconnected"}`}
            className={cn(
              "flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg bg-secondary/40 border border-border/30 text-left w-full cursor-pointer",
              "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors",
              "disabled:opacity-90 disabled:cursor-wait",
              source.status === "syncing" && "border-warning/40",
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <source.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{source.name}</p>
              <p className="text-xs text-muted-foreground leading-snug">
                {source.type}
                <span className="text-primary/80">
                  {" · "}
                  {source.status === "connected" && "Active"}
                  {source.status === "syncing" && "Syncing…"}
                  {source.status === "pending" && "Tap to connect"}
                </span>
              </p>
            </div>
            {source.status === "connected" && (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-hidden />
            )}
            {source.status === "syncing" && (
              <Wifi className="w-4 h-4 text-warning animate-pulse shrink-0" aria-hidden />
            )}
            {source.status === "pending" && (
              <div
                className="w-4 h-4 rounded-full border-2 border-muted-foreground/55 bg-transparent shrink-0"
                aria-hidden
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default DataSourceWidget;
