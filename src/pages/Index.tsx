import DashboardLayout from "@/components/DashboardLayout";
import DataSourceWidget from "@/components/widgets/DataSourceWidget";
import AIEngineWidget from "@/components/widgets/AIEngineWidget";
import InsightMonitoringWidget from "@/components/widgets/InsightMonitoringWidget";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [revenueTarget, setRevenueTarget] = useState(150000);
  const [actualRevenue, setActualRevenue] = useState(124000);
  const [newTask, setNewTask] = useState("");
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [healthRunning, setHealthRunning] = useState(false);
  const [healthSummary, setHealthSummary] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Array<{ id: number; text: string; done: boolean }>>([
    { id: 1, text: "Review overnight anomaly alerts", done: false },
    { id: 2, text: "Validate Salesforce sync status", done: true },
  ]);

  const targetProgress = useMemo(() => {
    if (revenueTarget <= 0) return 0;
    return Math.min(100, Math.round((actualRevenue / revenueTarget) * 100));
  }, [actualRevenue, revenueTarget]);

  const addTask = () => {
    const text = newTask.trim();
    if (!text) return;
    setTasks((prev) => [{ id: Date.now(), text, done: false }, ...prev]);
    setNewTask("");
  };

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const removeTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const runHealthCheck = async () => {
    setHealthRunning(true);
    setHealthSummary(null);
    await new Promise((r) => setTimeout(r, 1000));
    const pct = revenueTarget > 0 ? (actualRevenue / revenueTarget) * 100 : 0;
    if (pct >= 90) {
      setHealthSummary("All KPI signals nominal. Revenue pacing at or above target.");
    } else if (pct >= 60) {
      setHealthSummary("Moderate variance: pipeline healthy but watch attainment vs plan.");
    } else {
      setHealthSummary("Attention: attainment well below target—investigate leading indicators.");
    }
    setLastRunAt(new Date().toLocaleTimeString());
    setHealthRunning(false);
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full min-w-0"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Main dashoard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-prose">ZentrovAI Intelligence Platform — Real-time AI-powered business analytics</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <section className="glass-card p-4 sm:p-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">KPI Target Control</h3>
              <Button
                onClick={runHealthCheck}
                variant="outline"
                className="w-full sm:w-auto shrink-0"
                disabled={healthRunning}
              >
                {healthRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Checking…
                  </>
                ) : (
                  "Run Health Check"
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Adjust live target values and track real-time progress against revenue objectives.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                type="number"
                value={revenueTarget}
                onChange={(e) => setRevenueTarget(Number(e.target.value || 0))}
                placeholder="Revenue Target"
              />
              <Input
                type="number"
                value={actualRevenue}
                onChange={(e) => setActualRevenue(Number(e.target.value || 0))}
                placeholder="Actual Revenue"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Target Achievement</span>
                <span className="font-medium text-foreground tabular-nums">{targetProgress}%</span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-secondary/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, hsl(181 23% 57%), hsl(181 40% 70%))",
                  }}
                  initial={false}
                  animate={{ width: `${targetProgress}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              </div>
            </div>
            {healthSummary ? (
              <p className="text-xs text-foreground bg-secondary/30 border border-border/40 rounded-md p-2.5">{healthSummary}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              {lastRunAt ? `Last health check run at ${lastRunAt}` : "No health check run yet."}
            </p>
          </section>

          <section className="glass-card p-4 sm:p-6 space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Operations Task Tracker</h3>
            <p className="text-sm text-muted-foreground">
              Track day-to-day dashboard operations and quickly mark completed actions.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask();
                }}
                placeholder="Add operation task"
                className="min-w-0"
              />
              <Button onClick={addTask} className="w-full sm:w-auto shrink-0">
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex gap-2 items-stretch rounded-md border border-border/40 bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="flex-1 text-left p-3 min-w-0"
                  >
                    <span className={task.done ? "text-sm line-through text-muted-foreground" : "text-sm text-foreground"}>
                      {task.text}
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-auto rounded-none rounded-r-md text-muted-foreground hover:text-destructive"
                    aria-label="Remove task"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTask(task.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <DataSourceWidget />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 min-w-0">
          <AIEngineWidget />
          <InsightMonitoringWidget />
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
