import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";
import { useEffect, useState } from "react";

const PIPELINE_MESSAGES = [
  "Ingested batch · normalized 12.4k rows",
  "Feature store refreshed · embeddings v3.2",
  "Drift check passed · score 0.02",
  "Downstream API · insight queue +847",
  "Model ensemble · latency 38ms p95",
];

const AIEngineWidget = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x1: number; y1: number; x2: number; y2: number }>>([]);
  const [activity, setActivity] = useState<{ id: number; msg: string; t: string }[]>([]);
  const [batches, setBatches] = useState(18420);

  useEffect(() => {
    const generated = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x1: Math.random() * 100,
      y1: Math.random() * 100,
      x2: Math.random() * 100,
      y2: Math.random() * 100,
    }));
    setParticles(generated);
  }, []);

   
  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      const msg = PIPELINE_MESSAGES[i % PIPELINE_MESSAGES.length];
      const t = new Date().toLocaleTimeString();
      setActivity((prev) => [{ id: Date.now(), msg, t }, ...prev].slice(0, 5));
      setBatches((n) => n + Math.floor(200 + Math.random() * 400));
      i += 1;
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  const nodes = [
    { x: 15, y: 30, label: "Input" },
    { x: 15, y: 70, label: "Clean" },
    { x: 50, y: 50, label: "AI Core" },
    { x: 85, y: 30, label: "Insights" },
    { x: 85, y: 70, label: "Reports" },
  ];

   
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-4 sm:p-6 relative overflow-hidden min-w-0"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">AI Intelligence Engine</h3>
          <p className="text-xs text-muted-foreground mt-1">Powered by ZentrovAI AI Engine</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse-glow shrink-0 self-start sm:self-auto">
          <Brain className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
        <p className="text-xs text-muted-foreground">Live pipeline · rows processed today</p>
        <span className="text-sm font-mono font-semibold text-primary tabular-nums">{batches.toLocaleString()}</span>
      </div>

      <div className="relative w-full h-44 sm:h-52 rounded-xl bg-secondary/30 border border-border/30 overflow-hidden mb-4">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[[0, 2], [1, 2], [2, 3], [2, 4]].map(([from, to], i) => (
            <motion.line
              key={i}
              x1={`${nodes[from].x}%`} y1={`${nodes[from].y}%`}
              x2={`${nodes[to].x}%`} y2={`${nodes[to].y}%`}
              stroke="hsl(181, 23%, 57%)"
              strokeWidth="0.3"
              strokeDasharray="4 2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1.5, delay: 0.5 + i * 0.2, repeat: Infinity, repeatType: "loop", repeatDelay: 2 }}
            />
          ))}
          {particles.map((p) => (
            <motion.circle
              key={p.id}
              r="0.6"
              fill="hsl(181, 40%, 60%)"
              initial={{ cx: `${p.x1}%`, cy: `${p.y1}%`, opacity: 0 }}
              animate={{ cx: `${p.x2}%`, cy: `${p.y2}%`, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3, delay: p.id * 0.4, repeat: Infinity }}
            />
          ))}
        </svg>
        {nodes.map((node, i) => (
          <motion.div
            key={i}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono ${
              node.label === "AI Core"
                ? "bg-primary/30 border-2 border-primary text-primary glow-primary"
                : "bg-secondary/80 border border-border/50 text-muted-foreground"
            }`}>
              {node.label === "AI Core" ? <Brain className="w-4 h-4" /> : <span className="text-[9px]">{i + 1}</span>}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 font-mono">{node.label}</span>
          </motion.div>
        ))}
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Recent activity</p>
        <ul className="space-y-1.5 max-h-[7.5rem] overflow-y-auto pr-1 border border-border/30 rounded-lg bg-secondary/20 p-2">
          <AnimatePresence initial={false}>
            {activity.length === 0 ? (
              <li className="text-[11px] text-muted-foreground px-1 py-2">Waiting for next pipeline tick…</li>
            ) : (
              activity.map((row) => (
                <motion.li
                  key={row.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] text-foreground leading-snug border-b border-border/20 last:border-0 pb-1.5 last:pb-0"
                >
                  <span className="text-muted-foreground font-mono text-[10px] mr-2">{row.t}</span>
                  {row.msg}
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </ul>
      </div>
    </motion.div>
  );
};

export default AIEngineWidget;
