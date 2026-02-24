"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import {
  Activity,
  Clock,
  Trash2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  LayoutDashboard,
  PlusCircle,
  HardDrive
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface TestEntry {
  id: string;
  timestamp: number;
  totalHours: number;
  goodHours: number;
  badHours: number;
  efficiency: number;
}

// --- Initial Mock Data ---
const INITIAL_DATA: TestEntry[] = [
  { id: "1", timestamp: Date.now() - 432000000, totalHours: 24, goodHours: 22, badHours: 2, efficiency: 91.67 },
  { id: "2", timestamp: Date.now() - 345600000, totalHours: 24, goodHours: 19, badHours: 5, efficiency: 79.17 },
  { id: "3", timestamp: Date.now() - 259200000, totalHours: 24, goodHours: 23, badHours: 1, efficiency: 95.83 },
  { id: "4", timestamp: Date.now() - 172800000, totalHours: 24, goodHours: 18, badHours: 6, efficiency: 75.00 },
  { id: "5", timestamp: Date.now() - 86400000, totalHours: 24, goodHours: 21, badHours: 3, efficiency: 87.50 },
];

export default function EfficiencyDashboard() {
  const [entries, setEntries] = useState<TestEntry[]>(INITIAL_DATA);
  const [formData, setFormData] = useState({ total: "", good: "", bad: "" });
  const [error, setError] = useState<string | null>(null);

  // --- Calculations ---
  const stats = useMemo(() => {
    const totalRecording = entries.reduce((sum, e) => sum + e.totalHours, 0);
    const totalGood = entries.reduce((sum, e) => sum + e.goodHours, 0);
    const totalBad = entries.reduce((sum, e) => sum + e.badHours, 0);
    const avgEfficiency = entries.length > 0
      ? entries.reduce((sum, e) => sum + e.efficiency, 0) / entries.length
      : 0;

    return { totalRecording, totalGood, totalBad, avgEfficiency };
  }, [entries]);

  const pieData = [
    { name: "Useful (Good)", value: stats.totalGood, color: "#3b82f6" },
    { name: "Wasted (Bad)", value: stats.totalBad, color: "#ef4444" },
  ];

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(formData.total);
    const good = parseFloat(formData.good);
    const bad = parseFloat(formData.bad);

    if (isNaN(total) || isNaN(good) || isNaN(bad)) {
      setError("Please enter valid numbers for all fields.");
      return;
    }

    if (Math.abs(total - (good + bad)) > 0.01) {
      setError("Validation Failed: Total Hours must equal Good + Bad Hours.");
      return;
    }

    if (total <= 0) {
      setError("Total hours must be greater than zero.");
      return;
    }

    const newEntry: TestEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      totalHours: total,
      goodHours: good,
      badHours: bad,
      efficiency: Number(((good / total) * 100).toFixed(2)),
    };

    setEntries(prev => [newEntry, ...prev]);
    setFormData({ total: "", good: "", bad: "" });
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HardDrive className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">SD Efficiency <span className="text-primary">Pro</span></h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="hidden sm:flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Session: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Recording"
            value={`${stats.totalRecording.toFixed(1)}h`}
            icon={<Clock className="w-5 h-5" />}
            description="Accumulated test time"
          />
          <MetricCard
            title="Avg. Efficiency"
            value={`${stats.avgEfficiency.toFixed(2)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color={stats.avgEfficiency > 90 ? "text-green-500" : stats.avgEfficiency > 80 ? "text-yellow-500" : "text-red-500"}
            description="Overall data health"
          />
          <MetricCard
            title="Useful Hours"
            value={`${stats.totalGood.toFixed(1)}h`}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="text-blue-500"
            description="High fidelity recording"
          />
          <MetricCard
            title="Wasted Hours"
            value={`${stats.totalBad.toFixed(1)}h`}
            icon={<AlertCircle className="w-5 h-5" />}
            color="text-destructive"
            description="Corrupted or lost data"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Log New Entry</h2>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Total Hours</label>
                <input
                  type="number"
                  step="0.1"
                  name="total"
                  placeholder="e.g. 24.0"
                  value={formData.total}
                  onChange={handleInputChange}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground text-green-500">Good Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    name="good"
                    placeholder="22.5"
                    value={formData.good}
                    onChange={handleInputChange}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground text-destructive">Bad Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    name="bad"
                    placeholder="1.5"
                    value={formData.bad}
                    onChange={handleInputChange}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-destructive/50 outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-500 text-sm transition-all">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                Add Test Result
              </button>
            </form>
          </section>

          {/* Visualization Section */}
          <section className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 w-full">Data Health Ratio</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-6 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-muted-foreground">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Efficiency Trend (%)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[...entries].reverse()}>
                      <defs>
                        <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                      <XAxis
                        dataKey="timestamp"
                        hide
                      />
                      <YAxis domain={[0, 100]} stroke="#71717a" fontSize={12} tickFormatter={(val) => `${val}%`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Area
                        type="monotone"
                        dataKey="efficiency"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorEff)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Data Table */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">History & Details</h2>
            </div>
            <span className="text-[10px] sm:text-xs bg-secondary px-2 sm:px-2.5 py-1 rounded-full text-muted-foreground font-medium">
              {entries.length} Entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Total Time</th>
                  <th className="px-6 py-3 font-semibold">Good/Bad</th>
                  <th className="px-6 py-3 font-semibold">Efficiency</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No data entries yet. Add your first test result above.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-secondary/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{new Date(entry.timestamp).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">{entry.totalHours.toFixed(1)}h</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase">Good</span>
                            <span className="text-xs font-semibold text-green-500">{entry.goodHours.toFixed(1)}h</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase">Bad</span>
                            <span className="text-xs font-semibold text-destructive">{entry.badHours.toFixed(1)}h</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                entry.efficiency > 90 ? "bg-green-500" : entry.efficiency > 80 ? "bg-yellow-500" : "bg-destructive"
                              )}
                              style={{ width: `${entry.efficiency}%` }}
                            />
                          </div>
                          <span className={cn(
                            "text-sm font-bold min-w-[3rem]",
                            entry.efficiency > 90 ? "text-green-500" : entry.efficiency > 80 ? "text-yellow-500" : "text-destructive"
                          )}>
                            {entry.efficiency.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-border bg-card/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built for High-Performance SD Card Stress Testing Analytics.
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- Internal Components ---

function MetricCard({
  title,
  value,
  icon,
  description,
  color = "text-foreground"
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  color?: string;
}) {
  const getBgColor = (c: string) => {
    if (c.includes('green-500')) return 'bg-green-500/10';
    if (c.includes('yellow-500')) return 'bg-yellow-500/10';
    if (c.includes('blue-500')) return 'bg-blue-500/10';
    if (c.includes('destructive')) return 'bg-red-500/10';
    if (c.includes('red-500')) return 'bg-red-500/10';
    return 'bg-secondary/50';
  };

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-primary/20 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={cn("p-1.5 rounded-lg", getBgColor(color))}>
          <div className={color}>{icon}</div>
        </div>
      </div>
      <div className={cn("text-xl sm:text-2xl font-bold mb-1", color)}>{value}</div>
      <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
    </div>
  );
}
