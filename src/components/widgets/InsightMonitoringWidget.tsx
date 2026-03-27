import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Activity, Cpu, TrendingUp, Zap, BarChart3, AlertTriangle } from "lucide-react";

const InsightMonitoringWidget = () => {
  const [insights, setInsights] = useState(1247);
  const [speedMs, setSpeedMs] = useState(2.4);
  const [accuracy, setAccuracy] = useState(99.7);
  const [alerts, setAlerts] = useState(3);
  const [loadPct, setLoadPct] = useState(73);
  const [ratePct, setRatePct] = useState(91);

   
  useEffect(() => {
    const id = window.setInterval(() => {
      setInsights((n) => n + Math.floor(Math.random() * 4));
      setSpeedMs((s) => Math.max(0.8, Math.min(6, s + (Math.random() - 0.5) * 0.4)));
      setAccuracy((a) => Math.max(97, Math.min(100, a + (Math.random() - 0.5) * 0.15)));
      setAlerts((a) => Math.max(0, Math.min(12, a + (Math.random() > 0.65 ? 1 : 0) - (Math.random() > 0.75 ? 1 : 0))));
      setLoadPct((p) => Math.max(42, Math.min(94, p + (Math.random() - 0.5) * 6)));
      setRatePct((p) => Math.max(55, Math.min(99, p + (Math.random() - 0.5) * 4)));
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  const metrics = useMemo(
    () => [
      {
        label: "Insights Generated",
        value: insights.toLocaleString(),
        change: "+live",
        icon: TrendingUp,
      },
      {
        label: "Processing Speed",
        value: `${speedMs.toFixed(1)}ms`,
        change: speedMs < 2.5 ? "Fast" : "Typical",
        icon: Zap,
      },
      {
        label: "Data Accuracy",
        value: `${accuracy.toFixed(1)}%`,
        change: accuracy >= 99.5 ? "Stable" : "Watch",
        icon: BarChart3,
      },
      {
        label: "Active Alerts",
        value: String(alerts),
        change: alerts <= 4 ? "Low" : "Elevated",
        icon: AlertTriangle,
      },
    ],
    [insights, speedMs, accuracy, alerts],
  );

   
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-4 sm:p-6 min-w-0"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Insight Monitoring</h3>
          <p className="text-xs text-muted-foreground mt-1">Metrics refresh every few seconds</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 text-xs font-medium text-success">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live
          </span>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="p-3 rounded-lg bg-secondary/40 border border-border/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <m.icon className="w-3.5 h-3.5 text-primary/70 shrink-0" />
              <span className="text-[11px] text-muted-foreground leading-tight">{m.label}</span>
            </div>
            <motion.p
              key={m.value}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-foreground font-mono tabular-nums"
            >
              {m.value}
            </motion.p>
            <span className={`text-xs ${m.label === "Active Alerts" && alerts > 4 ? "text-warning" : "text-success"}`}>
              {m.change}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Cpu className="w-4 h-4 shrink-0" /> Data Processing Load
          </span>
          <span className="font-mono text-foreground tabular-nums">{Math.round(loadPct)}%</span>
        </div>
        <div className="w-full h-2.5 bg-secondary/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(181 23% 57%), hsl(181 40% 70%))" }}
            animate={{ width: `${loadPct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        <div className="flex items-center justify-between text-sm mt-3">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Activity className="w-4 h-4 shrink-0" /> Insight Generation Rate
          </span>
          <span className="font-mono text-foreground tabular-nums">{Math.round(ratePct)}%</span>
        </div>
        <div className="w-full h-2.5 bg-secondary/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(142 60% 45%), hsl(142 60% 55%))" }}
            animate={{ width: `${ratePct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default InsightMonitoringWidget;
