"use client";

import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { motion } from "framer-motion";
import { BrainCircuit, TrendingUp, Lightbulb, AlertTriangle, Target, Calendar, DollarSign, Activity, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Insight {
  type: "success" | "warning" | "info" | "prediction";
  title: string;
  message: string;
  icon?: React.ElementType;
}

interface Pattern {
  type: string;
  name: string;
  value: number;
  description: string;
}

interface Anomaly {
  type: string;
  count?: number;
  description: string;
  examples?: unknown[];
  value?: number;
}

interface CategoryData {
  name: string;
  total: number;
}

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [categoryIntelligence, setCategoryIntelligence] = useState<CategoryData[]>([]);

  useEffect(() => {
    analyzeSpending();
  }, []);

  const analyzeSpending = async () => {
    setLoading(true);
    
    try {
      // 1. Fetch real monthly data for last 6 months
      const monthlyData: number[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        try {
          const res = await api.get(`/analytics/monthly?year=${year}&month=${month}`);
          monthlyData.push(res.data?.totalExpenses || 0);
        } catch {
          monthlyData.push(0);
        }
      }

      // 2. Train neural network with real data
      if (monthlyData.some(val => val > 0)) {
        const xs = tf.tensor2d(monthlyData.map((_, idx) => [idx + 1]), [6, 1]);
        const ys = tf.tensor2d(monthlyData.map(val => [val]), [6, 1]);

        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 8, activation: 'relu', inputShape: [1] }));
        model.add(tf.layers.dense({ units: 1 }));
        model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });

        await model.fit(xs, ys, { epochs: 200, verbose: 0 });

        const output = model.predict(tf.tensor2d([7], [1, 1])) as tf.Tensor;
        const predictedValue = output.dataSync()[0];
        setPrediction(predictedValue);

        xs.dispose();
        ys.dispose();
        model.dispose();
        output.dispose();
      }

      // 3. Fetch category data
      const categoryRes = await api.get("/analytics/by-category?days=30");
      const categories = categoryRes.data || [];
      setCategoryIntelligence(categories);

      // 4. Fetch all expenses for pattern analysis
      const expensesRes = await api.get("/expenses?page=0&size=100");
      const expenses = expensesRes.data?.content || [];

      // 5. Pattern Detection
      const detectedPatterns = detectPatterns(expenses);
      setPatterns(detectedPatterns);

      // 6. Anomaly Detection
      const detectedAnomalies = detectAnomalies(expenses, monthlyData);
      setAnomalies(detectedAnomalies);

      // 7. Generate Insights
      const generatedInsights = generateInsights(
        monthlyData,
        prediction,
        categories,
        detectedPatterns,
        detectedAnomalies
      );
      setInsights(generatedInsights);

    } catch (error) {
      console.error("AI Analysis Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const detectPatterns = (expenses: { date: string; amount: number }[]): Pattern[] => {
    if (!expenses || expenses.length === 0) return [];

    const patterns: Pattern[] = [];

    // Day of week analysis
    const dayTotals: { [key: string]: number } = {};
    expenses.forEach(exp => {
      const day = new Date(exp.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayTotals[day] = (dayTotals[day] || 0) + exp.amount;
    });

    const maxDay = Object.entries(dayTotals).reduce((max, [day, total]) => 
      total > (dayTotals[max] || 0) ? day : max, 'Monday'
    );

    patterns.push({
      type: 'day',
      name: `${maxDay} Spending`,
      value: dayTotals[maxDay] || 0,
      description: `You spend most on ${maxDay}s`
    });

    // Time of month analysis
    const earlyMonth = expenses.filter(e => new Date(e.date).getDate() <= 10).length;
    const midMonth = expenses.filter(e => {
      const day = new Date(e.date).getDate();
      return day > 10 && day <= 20;
    }).length;
    const lateMonth = expenses.filter(e => new Date(e.date).getDate() > 20).length;

    const maxPeriod = Math.max(earlyMonth, midMonth, lateMonth);
    const period = maxPeriod === earlyMonth ? 'early' : maxPeriod === midMonth ? 'mid' : 'late';
    
    patterns.push({
      type: 'period',
      name: `${period.charAt(0).toUpperCase() + period.slice(1)}-Month Pattern`,
      value: maxPeriod,
      description: `Most transactions happen ${period}-month`
    });

    return patterns;
  };

  const detectAnomalies = (expenses: { amount: number }[], monthlyData: number[]): Anomaly[] => {
    if (!expenses || expenses.length === 0) return [];

    const anomalies: Anomaly[] = [];
    const avgExpense = expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length;
    const stdDev = Math.sqrt(
      expenses.reduce((sum, e) => sum + Math.pow(e.amount - avgExpense, 2), 0) / expenses.length
    );

    // Find unusually large expenses (> 2 standard deviations)
    const unusualExpenses = expenses.filter(e => e.amount > avgExpense + 2 * stdDev);
    
    if (unusualExpenses.length > 0) {
      anomalies.push({
        type: 'high',
        count: unusualExpenses.length,
        description: `${unusualExpenses.length} unusually high expense${unusualExpenses.length > 1 ? 's' : ''} detected`,
        examples: unusualExpenses.slice(0, 2)
      });
    }

    // Check current month vs average
    const currentMonth = monthlyData[monthlyData.length - 1] || 0;
    const avgMonth = monthlyData.reduce((sum, val) => sum + val, 0) / monthlyData.length;
    
    if (currentMonth > avgMonth * 1.3) {
      anomalies.push({
        type: 'spike',
        description: `This month's spending is ${((currentMonth / avgMonth - 1) * 100).toFixed(0)}% above average`,
        value: currentMonth - avgMonth
      });
    }

    return anomalies;
  };

  const generateInsights = (
    monthlyData: number[],
    prediction: number | null,
    categories: CategoryData[],
    patterns: Pattern[],
    anomalies: Anomaly[]
  ): Insight[] => {
    const insights: Insight[] = [];

    // Prediction insight
    if (prediction !== null && monthlyData.length > 0) {
      const lastMonth = monthlyData[monthlyData.length - 1];
      const change = prediction - lastMonth;
      
      insights.push({
        type: change > 0 ? "warning" : "success",
        title: "Next Month Forecast",
        message: change > 0 
          ? `AI predicts ৳${Math.abs(change).toFixed(0)} increase next month. Consider budgeting more.`
          : `AI predicts ৳${Math.abs(change).toFixed(0)} decrease next month. You're on track!`,
        icon: TrendingUp
      });
    }

    // Category insights
    if (categories.length > 0) {
      const topCategory = categories[0];
      const total = categories.reduce((sum, c) => sum + c.total, 0);
      const topPercent = ((topCategory.total / total) * 100).toFixed(0);

      insights.push({
        type: "info",
        title: "Top Spending Category",
        message: `${topCategory.name} accounts for ${topPercent}% of your spending (৳${topCategory.total.toFixed(0)})`,
        icon: Target
      });

      // Savings opportunity
      if (categories.length > 1) {
        const savings = topCategory.total * 0.15;
        insights.push({
          type: "success",
          title: "Savings Opportunity",
          message: `You could save ৳${savings.toFixed(0)}/month by reducing ${topCategory.name} spending by 15%`,
          icon: DollarSign
        });
      }
    }

    // Pattern insights
    if (patterns.length > 0) {
      insights.push({
        type: "info",
        title: patterns[0].name,
        message: patterns[0].description,
        icon: Activity
      });
    }

    // Anomaly warnings
    if (anomalies.length > 0) {
      anomalies.forEach(anomaly => {
        insights.push({
          type: "warning",
          title: anomaly.type === 'high' ? "Unusual Expenses" : "Spending Spike",
          message: anomaly.description,
          icon: AlertTriangle
        });
      });
    }

    // Trend insight
    if (monthlyData.length >= 3) {
      const recent = monthlyData.slice(-3);
      const isIncreasing = recent[2] > recent[1] && recent[1] > recent[0];
      
      if (isIncreasing) {
        insights.push({
          type: "warning",
          title: "Upward Trend Detected",
          message: "Your spending has been increasing for 3 consecutive months",
          icon: TrendingUp
        });
      }
    }

    return insights;
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-400 bg-green-400/10";
      case "warning": return "text-amber-400 bg-amber-400/10";
      case "info": return "text-blue-400 bg-blue-400/10";
      case "prediction": return "text-purple-400 bg-purple-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const getInsightIcon = (insight: Insight) => {
    const IconComponent = insight.icon || Lightbulb;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            AI Neural Insights
          </h2>
          <p className="text-muted-foreground">Advanced financial intelligence powered by machine learning</p>
        </div>
        <Button 
          variant="outline" 
          className="border-primary/20 hover:bg-primary/10 hover:border-primary/40"
          onClick={() => { setLoading(true); analyzeSpending(); }} 
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Refresh Analysis"}
        </Button>
      </div>

      {/* Main Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Neural Prediction Card */}
        <Card className="glass-card border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit className="h-32 w-32" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-400" />
              Neural Prediction
            </CardTitle>
            <CardDescription>
              TensorFlow.js Deep Learning Model
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Training neural network...</p>
                <Progress value={undefined} className="h-2" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Month Forecast</p>
                  <div className="text-4xl font-bold text-primary">
                    ৳{prediction?.toFixed(0) || "N/A"}
                  </div>
                </div>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  Multi-layer perceptron
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending Patterns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-none relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-50" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-inner">
                  <Activity className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold text-xl">
                    Spending Patterns
                  </span>
                  <p className="text-xs text-muted-foreground font-normal mt-0.5">Behavioral Analysis</p>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />
                  <div className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />
                </div>
              ) : patterns.length > 0 ? (
                <div className="space-y-3">
                  {patterns.map((pattern, idx) => {
                    const isDayPattern = pattern.type === 'day';
                    const Icon = isDayPattern ? Calendar : Clock;
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group/item relative overflow-hidden rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        <div className="p-4 flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover/item:bg-cyan-500/20 transition-colors">
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground/90 truncate">
                              {pattern.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {pattern.description}
                            </p>
                          </div>

                          <div className="text-right">
                            <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-mono">
                              {isDayPattern ? `৳${pattern.value.toFixed(0)}` : `${pattern.value}x`}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="p-4 rounded-full bg-slate-800/50 mb-3">
                    <Activity className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No patterns detected yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
                    Continue using the app to unlock behavioral insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Anomalies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-none relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-bold">
                  Anomaly Detection
                </span>
              </CardTitle>
              <CardDescription>Statistical outlier analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-slate-300 dark:to-slate-700 rounded animate-pulse" />
                </div>
              ) : anomalies.length > 0 ? (
                <div className="space-y-3">
                  {anomalies.map((anomaly, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg blur-sm" />
                      <div className="relative p-4 rounded-lg bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 dark:border-amber-500/20 backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                          <div className="p-1 rounded bg-amber-500/20">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          </div>
                          <p className="text-sm text-amber-900 dark:text-amber-300 flex-1">{anomaly.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur-sm" />
                  <div className="relative p-4 rounded-lg bg-green-500/10 dark:bg-green-500/5 border border-green-500/30 dark:border-green-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded bg-green-500/20">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      </div>
                      <p className="text-sm text-green-900 dark:text-green-300">No anomalies detected - spending is normal</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Intelligence */}
      {categoryIntelligence.length > 0 && (
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-400" />
              Category Intelligence
            </CardTitle>
            <CardDescription>Where your money goes - Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryIntelligence.slice(0, 5)}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `৳${value}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => `৳${Number(value).toFixed(2)}`}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar
                    dataKey="total"
                    radius={[8, 8, 0, 0]}
                  >
                    {categoryIntelligence.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Smart Advisor - Personalized Insights */}
      <Card className="glass-card border-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <CardTitle>AI Financial Advisor</CardTitle>
          </div>
          <CardDescription>
            Personalized recommendations based on your spending behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-800/50 rounded animate-pulse" />
              ))}
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, i) => (
                <div key={i} className={`flex gap-4 items-start p-4 rounded-lg ${getInsightColor(insight.type)}`}>
                  <div className="mt-1">
                    {getInsightIcon(insight)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{insight.title}</div>
                    <p className="text-sm opacity-90">{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Add more expenses to get personalized insights
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
