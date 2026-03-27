import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

type ConsolidationResult = {
  rawRows: number;
  columns: number;
  duplicatesFound: number;
  grossTotal: number;
  consolidatedTotal: number;
  cleanedCsv: string;
};

function parseTrailingAmount(row: string): number {
  const cells = row.split(",").map((c) => c.trim());
  const raw = cells[cells.length - 1]?.replace(/[$,]/g, "") ?? "";
  const n = Number(raw);
  return Number.isNaN(n) ? 0 : n;
}

export const DataConsolidationBlock = () => {
  const [rawData, setRawData] = useState("sales,region,amount\nA1,North,1200\nA2,South,850\nA1,North,1200");
  const [result, setResult] = useState<ConsolidationResult | null>(null);
  const [qualityNote, setQualityNote] = useState("");

  const runConsolidation = () => {
    const lines = rawData.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length < 2) {
      setResult({
        rawRows: 0,
        columns: lines[0] ? lines[0].split(",").length : 0,
        duplicatesFound: 0,
        grossTotal: 0,
        consolidatedTotal: 0,
        cleanedCsv: lines[0] ?? "",
      });
      setQualityNote("Add a header row and at least one data row to run consolidation.");
      return;
    }

    const headerLine = lines[0];
    const header = headerLine.split(",").map((h) => h.trim());
    const body = lines.slice(1);
    const seen = new Set<string>();
    const uniqueBody: string[] = [];
    let duplicatesFound = 0;
    let grossTotal = 0;
    let consolidatedTotal = 0;

    body.forEach((row) => {
      const amount = parseTrailingAmount(row);
      grossTotal += amount;

      if (seen.has(row)) {
        duplicatesFound += 1;
        return;
      }
      seen.add(row);
      uniqueBody.push(row);
      consolidatedTotal += amount;
    });

    const cleanedCsv = [headerLine, ...uniqueBody].join("\n");

    setResult({
      rawRows: body.length,
      columns: header.length,
      duplicatesFound,
      grossTotal,
      consolidatedTotal,
      cleanedCsv,
    });

    if (duplicatesFound === 0) {
      setQualityNote("High quality dataset: no duplicate rows detected.");
    } else if (duplicatesFound <= 2) {
      setQualityNote("Moderate quality dataset: minor duplicates found; review before production ingestion.");
    } else {
      setQualityNote("Low quality dataset: duplicate volume is high; cleansing recommended before analysis.");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Data Consolidation Simulator</h3>
      <p className="text-sm text-muted-foreground">Paste CSV-like data and run consolidation to detect duplicates and summarize totals.</p>
      <div className="rounded-md border border-border/40 bg-secondary/20 p-3">
        <p className="text-xs text-muted-foreground">
          Use this module to validate incoming source quality before ingestion into the analytics pipeline.
          It helps teams quickly spot repeated records and estimate aggregate value.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InfoCard title="Key Value" content="Combines scattered records into one consistent dataset for reporting." />
        <InfoCard title="Quality Check" content="Detects duplicate lines and highlights total financial impact quickly." />
        <InfoCard title="Business Outcome" content="Reduces manual cleanup time and improves confidence in decisions." />
      </div>
      <div className="rounded-md border border-border/40 bg-secondary/20 p-3">
        <p className="text-xs font-medium text-foreground">Recommended workflow</p>
        <ol className="text-xs text-muted-foreground mt-1 space-y-1 list-decimal pl-4">
          <li>Paste incoming batch data from source systems.</li>
          <li>Run consolidation and inspect duplicates and totals.</li>
          <li>Approve clean data for downstream reporting.</li>
        </ol>
      </div>
      <Textarea value={rawData} onChange={(e) => setRawData(e.target.value)} rows={8} />
      <Button onClick={runConsolidation}>Run Consolidation</Button>
      {result ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            <MetricCard label="Data rows (raw)" value={String(result.rawRows)} />
            <MetricCard label="Columns" value={String(result.columns)} />
            <MetricCard label="Duplicates found" value={String(result.duplicatesFound)} />
            <MetricCard label="Unique rows" value={String(Math.max(result.rawRows - result.duplicatesFound, 0))} />
            <MetricCard label="Gross total" value={result.grossTotal.toLocaleString()} />
            <MetricCard label="Consolidated total" value={result.consolidatedTotal.toLocaleString()} />
          </div>
          {result.cleanedCsv ? (
            <div className="rounded-md border border-border/40 bg-secondary/20 overflow-hidden">
              <p className="text-xs font-medium text-foreground px-3 py-2 border-b border-border/40">Consolidated dataset</p>
              <pre className="text-xs text-muted-foreground p-3 overflow-x-auto font-mono whitespace-pre-wrap break-all">
                {result.cleanedCsv}
              </pre>
            </div>
          ) : null}
          <div className="rounded-md border border-border/40 bg-secondary/20 p-3">
            <p className="text-xs font-medium text-foreground mb-2">Consolidation impact chart</p>
            <ChartContainer
              config={{
                gross: { label: "Gross", color: "hsl(var(--chart-2))" },
                consolidated: { label: "Consolidated", color: "hsl(var(--chart-1))" },
              }}
              className="h-[220px] w-full"
            >
              <BarChart
                data={[
                  { metric: "Amount", gross: result.grossTotal, consolidated: result.consolidatedTotal },
                ]}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="metric" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={46} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="gross" radius={6} />
                <Bar dataKey="consolidated" radius={6} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      ) : null}
      {qualityNote ? (
        <div className="rounded-md border border-border/40 bg-secondary/20 p-3">
          <p className="text-xs font-medium text-foreground">AI Quality Assessment</p>
          <p className="text-xs text-muted-foreground mt-1">{qualityNote}</p>
        </div>
      ) : null}
    </div>
  );
};

export const AutomatedInsightsBlock = () => {
  const [revenueGrowth, setRevenueGrowth] = useState("12");
  const [churn, setChurn] = useState("4");
  const [operatingMargin, setOperatingMargin] = useState("22");
  const [insights, setInsights] = useState<string[]>([]);

  const generateInsights = () => {
    const rg = Number(revenueGrowth);
    const c = Number(churn);
    const om = Number(operatingMargin);
    const next: string[] = [];

    next.push(rg >= 10 ? "Revenue growth is strong; scale top-performing channels." : "Revenue growth is below target; prioritize pipeline conversion.");
    next.push(c <= 5 ? "Customer churn is healthy; retention strategy is effective." : "Churn risk is elevated; launch retention campaigns for at-risk segments.");
    next.push(om >= 20 ? "Operating margin supports aggressive reinvestment." : "Margin pressure detected; optimize cost-heavy workflows.");
    next.push("Auto-report generated: prioritize growth, retention, and margin efficiency for next cycle.");

    setInsights(next);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Automated Insight Generator</h3>
      <p className="text-sm text-muted-foreground">
        Provide core performance signals to generate an instant strategic narrative for weekly or monthly reviews.
      </p>
      <div className="rounded-md border border-border/40 bg-secondary/20 p-3">
        <p className="text-xs text-muted-foreground">
          Suggested ranges: Growth 5-20%, Churn 2-8%, Margin 12-30%. Use these inputs to simulate best-case
          and risk-case scenarios for leadership updates.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input type="number" value={revenueGrowth} onChange={(e) => setRevenueGrowth(e.target.value)} placeholder="Revenue Growth %" />
        <Input type="number" value={churn} onChange={(e) => setChurn(e.target.value)} placeholder="Churn %" />
        <Input type="number" value={operatingMargin} onChange={(e) => setOperatingMargin(e.target.value)} placeholder="Operating Margin %" />
      </div>
      <Button onClick={generateInsights}>Generate Strategic Report</Button>
      {insights.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Strategic report highlights</p>
          {insights.map((insight) => (
            <p key={insight} className="text-sm text-muted-foreground border border-border/40 rounded-md p-3 bg-secondary/30">
              {insight}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const BusinessPerformanceBlock = () => {
  const [timeframe, setTimeframe] = useState("monthly");
  const multiplier = useMemo(() => (timeframe === "weekly" ? 0.25 : timeframe === "quarterly" ? 3 : 1), [timeframe]);

  const baseMetrics = [
    { label: "Revenue", value: 124000, unit: "$" },
    { label: "Orders", value: 1930, unit: "" },
    { label: "Conversion Rate", value: 4.2, unit: "%" },
    { label: "Customer Satisfaction", value: 92, unit: "%" },
  ];
  const kpiChartConfig: ChartConfig = {
    value: { label: "KPI Value", color: "hsl(var(--chart-1))" },
  };
  const kpiChartData = useMemo(
    () => baseMetrics.map((m) => ({ metric: m.label, value: Number((m.value * multiplier).toFixed(1)) })),
    [multiplier]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Business Performance Dashboard</h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="h-10 w-full sm:w-auto min-w-0 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>
      <p className="text-sm text-muted-foreground">
        Switch the time horizon to compare trends and understand how KPIs behave across operational cycles.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoCard title="Executive View" content="Monitor commercial health using revenue, conversion, and satisfaction indicators." />
        <InfoCard title="Team View" content="Use weekly mode for operations, monthly for management, quarterly for strategy." />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {baseMetrics.map((metric) => {
          const adjusted = metric.value * multiplier;
          const display = metric.unit === "$" ? `${metric.unit}${Math.round(adjusted).toLocaleString()}` : `${adjusted.toFixed(metric.unit === "%" ? 1 : 0)}${metric.unit}`;
          return <MetricCard key={metric.label} label={metric.label} value={display} />;
        })}
      </div>
      <div className="rounded-md border border-border/40 bg-secondary/20 p-3">
        <p className="text-xs font-medium text-foreground mb-2">KPI trend by selected timeframe</p>
        <ChartContainer config={kpiChartConfig} className="h-[260px] w-full">
          <BarChart data={kpiChartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="metric" tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tickLine={false} axisLine={false} width={52} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={6} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export const DataIntegrationBlock = () => {
  const [sourceName, setSourceName] = useState("");
  const [sources, setSources] = useState<Array<{ name: string; connected: boolean }>>([
    { name: "PostgreSQL", connected: true },
    { name: "Google Analytics", connected: true },
    { name: "Salesforce", connected: false },
  ]);

  const addSource = () => {
    const trimmed = sourceName.trim();
    if (!trimmed) return;
    setSources((prev) => [...prev, { name: trimmed, connected: false }]);
    setSourceName("");
  };

  const toggleConnection = (name: string) => {
    setSources((prev) => prev.map((s) => (s.name === name ? { ...s, connected: !s.connected } : s)));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Data Source Integration Manager</h3>
      <p className="text-sm text-muted-foreground">
        Maintain a single source inventory and toggle connector status to simulate orchestration readiness.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InfoCard title="Coverage" content="Track what systems are already connected versus pending integrations." />
        <InfoCard title="Onboarding" content="Add new sources to represent future connectors in your rollout plan." />
        <InfoCard title="Readiness" content="Use status toggles to model go-live sequencing by team or department." />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Input
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          placeholder="Add a new source (e.g., HubSpot)"
          className="min-w-0"
        />
        <Button onClick={addSource} className="w-full sm:w-auto shrink-0">
          Add Source
        </Button>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Connected: {sources.filter((s) => s.connected).length} / {sources.length} sources
        </p>
        {sources.map((source) => (
          <div
            key={source.name}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border border-border/40 rounded-md p-3 bg-secondary/20"
          >
            <span className="text-sm text-foreground break-all min-w-0">{source.name}</span>
            <Button
              variant={source.connected ? "outline" : "default"}
              className="w-full sm:w-auto shrink-0"
              onClick={() => toggleConnection(source.name)}
            >
              {source.connected ? "Disconnect" : "Connect"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MonitoringAlertsBlock = () => {
  const [threshold, setThreshold] = useState(75);
  const [currentLoad, setCurrentLoad] = useState(62);
  const [alerts, setAlerts] = useState<string[]>([]);

  const runCheck = () => {
    const simulated = Math.floor(Math.random() * 100);
    setCurrentLoad(simulated);
    if (simulated >= threshold) {
      setAlerts((prev) => [`ALERT: Processing load hit ${simulated}% (threshold ${threshold}%)`, ...prev].slice(0, 6));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Real-Time Monitoring and Alerts</h3>
      <p className="text-sm text-muted-foreground">Configure a threshold and run a live check to trigger intelligence alerts.</p>
      <div className="rounded-md border border-border/40 bg-secondary/20 p-3">
        <p className="text-xs text-muted-foreground">
          Alert history is kept for quick incident review. In production, this can be connected to email,
          chat, or ticketing workflows.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InfoCard title="Detection" content="Continuously evaluates live load values against your configured threshold." />
        <InfoCard title="Response" content="Records alert events for follow-up and root-cause analysis." />
        <InfoCard title="Governance" content="Supports faster escalation and SLA tracking for critical services." />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Alert Threshold: {threshold}%</label>
        <input
          type="range"
          min={40}
          max={95}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-foreground">Current Load: {currentLoad}%</span>
        <Button onClick={runCheck} className="w-full sm:w-auto shrink-0">
          Run Live Check
        </Button>
      </div>
      <div className="space-y-2">
        {alerts.length === 0 ? <p className="text-sm text-muted-foreground">No alerts yet.</p> : null}
        {alerts.map((alert) => (
          <p key={alert} className="text-sm border border-destructive/30 text-destructive rounded-md p-3 bg-destructive/5">
            {alert}
          </p>
        ))}
      </div>
    </div>
  );
};

type ScalabilityTier = "sme" | "growth" | "enterprise";

function parsePlannerMetric(raw: string): number {
  const t = raw.trim();
  if (t === "") return 0;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

export const ScalableArchitectureBlock = () => {
  const [users, setUsers] = useState("117");
  const [eventsPerDay, setEventsPerDay] = useState("80000");
  const [regions, setRegions] = useState("2");
  const [tierAckSignature, setTierAckSignature] = useState<string | null>(null);
  const [protocolRecordedSignature, setProtocolRecordedSignature] = useState<string | null>(null);

  const plan = useMemo(() => {
    const u = parsePlannerMetric(users);
    const e = parsePlannerMetric(eventsPerDay);
    const r = parsePlannerMetric(regions);
    const invalid = [u, e, r].some((x) => Number.isNaN(x));

    if (invalid) {
      return {
        tier: "sme" as ScalabilityTier,
        recommendation: "Enter non-negative numbers for all three metrics to see a deployment recommendation.",
        invalid: true,
      };
    }

    let tier: ScalabilityTier = "sme";
    let recommendation = "";

    if (u > 1000 || e > 1_000_000 || r > 5) {
      tier = "enterprise";
      recommendation =
        "Enterprise recommendation: distributed processing, autoscaling pools, and multi-region failover with resilience patterns matched to your regions.";
    } else if (u > 250 || e > 250_000 || r > 2) {
      tier = "growth";
      recommendation =
        "Growth recommendation: containerized services with queue-based ingestion, horizontal scaling, and read replicas for heavier analytics.";
    } else {
      tier = "sme";
      recommendation = "SME recommendation: modular single-region deployment with scheduled scaling windows.";
    }

    return { tier, recommendation, invalid: false };
  }, [users, eventsPerDay, regions]);

  const planSignature = useMemo(() => {
    const u = `${users.trim()}|${eventsPerDay.trim()}|${regions.trim()}`;
    if (plan.invalid) return `inv:${u}`;
    return `ok:${plan.tier}:${u}`;
  }, [plan.invalid, plan.tier, users, eventsPerDay, regions]);

  const tierAcknowledged = Boolean(tierAckSignature && tierAckSignature === planSignature);
  const protocolComplete = Boolean(
    protocolRecordedSignature && protocolRecordedSignature === planSignature && tierAcknowledged
  );

  const tierLabel =
    plan.tier === "sme" ? "SME stage" : plan.tier === "growth" ? "Growth stage" : "Enterprise stage";
  const u = parsePlannerMetric(users);
  const e = parsePlannerMetric(eventsPerDay);
  const r = parsePlannerMetric(regions);
  const capacityChartData = useMemo(
    () => [
      { name: "Users", value: Number.isNaN(u) ? 0 : u },
      { name: "Events/day", value: Number.isNaN(e) ? 0 : e },
      { name: "Regions", value: Number.isNaN(r) ? 0 : r },
    ],
    [u, e, r]
  );
  const tierShareData = useMemo(
    () => [
      { name: "SME", value: plan.tier === "sme" ? 1 : 0.2, color: "hsl(var(--chart-1))" },
      { name: "Growth", value: plan.tier === "growth" ? 1 : 0.2, color: "hsl(var(--chart-2))" },
      { name: "Enterprise", value: plan.tier === "enterprise" ? 1 : 0.2, color: "hsl(var(--chart-3))" },
    ],
    [plan.tier]
  );

  const recordProtocol = () => {
    setProtocolRecordedSignature(planSignature);
  };

  const acknowledgeTier = () => {
    if (!plan.invalid) setTierAckSignature(planSignature);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border/40 bg-secondary/25 p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Architecture scaling protocol</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Run this sequence to baseline workload, classify the deployment tier, and record an auditable posture snapshot.
            Editing metrics after a sign-off invalidates earlier steps until you acknowledge again.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                !plan.invalid ? "border-primary/50 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
              )}
            >
              {!plan.invalid ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : "1"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Capture baseline metrics</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Enter valid, non-negative workload numbers in the planner below.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                tierAcknowledged ? "border-primary/50 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
              )}
            >
              {tierAcknowledged ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : "2"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Acknowledge tier profile</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Confirm alignment with the derived SME, Growth, or Enterprise recommendation.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                protocolComplete ? "border-primary/50 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
              )}
            >
              {protocolComplete ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : "3"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Record protocol completion</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Stamp this run for handoff to architecture or governance reviews.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button type="button" variant="secondary" size="sm" disabled={plan.invalid} onClick={acknowledgeTier}>
            Acknowledge tier recommendation
          </Button>
          <Button type="button" size="sm" disabled={!tierAcknowledged} onClick={recordProtocol}>
            Complete protocol run
          </Button>
        </div>
        {protocolComplete ? (
          <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-foreground">
            <span className="font-medium text-primary">Recorded — </span>
            {tierLabel} · {new Date().toLocaleString()}. This stamp applies only to the current metrics above; change inputs
            to revise the assessment.
          </div>
        ) : null}
      </div>

      <h3 className="text-lg font-semibold text-foreground">Scalability Planner</h3>
      <p className="text-sm text-muted-foreground">
        Estimate deployment strategy using expected load, event volume, and geographic distribution.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InfoCard
          active={!plan.invalid && plan.tier === "sme"}
          title="SME Stage"
          content="Start lean with modular services and predictable scaling windows."
        />
        <InfoCard
          active={!plan.invalid && plan.tier === "growth"}
          title="Growth Stage"
          content="Introduce queue-based ingestion and containerized workloads."
        />
        <InfoCard
          active={!plan.invalid && plan.tier === "enterprise"}
          title="Enterprise Stage"
          content="Adopt distributed processing and multi-region resilience."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <label htmlFor="planner-users" className="text-xs font-medium text-muted-foreground">
            Expected concurrent users
          </label>
          <Input
            id="planner-users"
            type="number"
            min={0}
            value={users}
            onChange={(e) => setUsers(e.target.value)}
            placeholder="e.g. 117"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="planner-events" className="text-xs font-medium text-muted-foreground">
            Events per day
          </label>
          <Input
            id="planner-events"
            type="number"
            min={0}
            value={eventsPerDay}
            onChange={(e) => setEventsPerDay(e.target.value)}
            placeholder="e.g. 80000"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="planner-regions" className="text-xs font-medium text-muted-foreground">
            Regions / locales
          </label>
          <Input
            id="planner-regions"
            type="number"
            min={0}
            step={1}
            value={regions}
            onChange={(e) => setRegions(e.target.value)}
            placeholder="e.g. 2"
          />
        </div>
      </div>
      <div className="rounded-md border border-border/40 bg-secondary/30 p-4">
        {!plan.invalid ? (
          <p className="text-xs font-medium text-primary mb-2">{tierLabel} — matched profile</p>
        ) : null}
        <p className={cn("text-sm", plan.invalid ? "text-amber-600 dark:text-amber-500" : "text-foreground")}>
          {plan.recommendation}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-md border border-border/40 bg-secondary/20 p-3">
          <p className="text-xs font-medium text-foreground mb-2">Capacity input chart</p>
          <ChartContainer
            config={{ value: { label: "Input", color: "hsl(var(--chart-1))" } }}
            className="h-[230px] w-full"
          >
            <BarChart data={capacityChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={52} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={6} />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="rounded-md border border-border/40 bg-secondary/20 p-3">
          <p className="text-xs font-medium text-foreground mb-2">Recommended tier emphasis</p>
          <ChartContainer
            config={{
              SME: { label: "SME", color: "hsl(var(--chart-1))" },
              Growth: { label: "Growth", color: "hsl(var(--chart-2))" },
              Enterprise: { label: "Enterprise", color: "hsl(var(--chart-3))" },
            }}
            className="h-[230px] w-full"
          >
            <PieChart>
              <Pie data={tierShareData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={74}>
                {tierShareData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-border/40 rounded-md p-3 bg-secondary/20">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-semibold text-foreground mt-1">{value}</p>
  </div>
);

const InfoCard = ({ title, content, active }: { title: string; content: string; active?: boolean }) => (
  <div
    className={cn(
      "rounded-md border p-3 bg-secondary/20 transition-[border-color,box-shadow]",
      active ? "border-primary/70 ring-1 ring-primary/20" : "border-border/40"
    )}
  >
    <p className="text-xs font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{content}</p>
  </div>
);
