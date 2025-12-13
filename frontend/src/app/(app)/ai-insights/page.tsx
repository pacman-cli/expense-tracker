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
import ReactMarkdown from "react-markdown";

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
  id?: number;
  description: string;
  amount?: number;
  category?: string;
  date?: string;
}

interface CategoryData {
  name: string;
  total: number;
}

interface AIAnalysisResult {
  analysis: string;
  totalSpending: number;
  topCategory: string;
}

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [categoryIntelligence, setCategoryIntelligence] = useState<CategoryData[]>([]);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>("");

  useEffect(() => {
    analyzeSpending();
  }, []);

  const analyzeSpending = async () => {
    setLoading(true);
    
    try {
      // 1. Fetch real monthly data for last 6 months (Keep existing logic for TF.js)
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
        trainNeuralNetwork(monthlyData);
      }

      // 3. Fetch category data
      const categoryRes = await api.get("/analytics/by-category?days=30");
      const categories = categoryRes.data || [];
      setCategoryIntelligence(categories);

      // 4. Fetch Patterns (still client side for now as it's visually specific)
      const expensesRes = await api.get("/expenses?page=0&size=100");
      const expenses = expensesRes.data?.content || [];
      const detectedPatterns = detectPatterns(expenses);
      setPatterns(detectedPatterns);

      // 5. FETCH REAL AI DATA FROM BACKEND
      const [aiOneRes, aiTwoRes] = await Promise.allSettled([
        api.get("/ai/insights"),
        api.get("/ai/anomalies")
      ]);

      // Handle General Insights (Gemini)
      if (aiOneRes.status === "fulfilled") {
        const data = aiOneRes.value.data as AIAnalysisResult;
        setGeminiAnalysis(data.analysis || "No analysis available yet.");
      }

      // Handle Anomalies (Gemini)
      if (aiTwoRes.status === "fulfilled") {
        const data = aiTwoRes.value.data;
        setAnomalies(data.anomalies || []);
      }

    } catch (error) {
      console.error("AI Analysis Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const trainNeuralNetwork = async (data: number[]) => {
      const xs = tf.tensor2d(data.map((_, idx) => [idx + 1]), [6, 1]);
      const ys = tf.tensor2d(data.map(val => [val]), [6, 1]);

      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [1] }));
      model.add(tf.layers.dense({ units: 1 }));
      model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });

      await model.fit(xs, ys, { epochs: 250, verbose: 0 });

      const output = model.predict(tf.tensor2d([7], [1, 1])) as tf.Tensor;
      const predictedValue = output.dataSync()[0];
      setPrediction(predictedValue);

      xs.dispose();
      ys.dispose();
      model.dispose();
      output.dispose();
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

    return patterns;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            AI Neural Insights
          </h2>
          <p className="text-muted-foreground">Advanced financial intelligence powered by Gemini 1.5</p>
        </div>
        <Button 
          variant="outline" 
          className="border-primary/20 hover:bg-primary/10 hover:border-primary/40"
          onClick={() => { analyzeSpending(); }} 
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
                  Multi-layer Perceptron (Client-side)
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
                </div>
              ) : patterns.length > 0 ? (
                <div className="space-y-3">
                  {patterns.map((pattern, idx) => (
                      <motion.div
                        key={idx}
                        className="group/item relative overflow-hidden rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 p-4"
                      >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-cyan-400" />
                                <div>
                                    <p className="text-sm font-semibold">{pattern.name}</p>
                                    <p className="text-xs text-muted-foreground">{pattern.description}</p>
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                                ৳{pattern.value.toFixed(0)}
                            </Badge>
                          </div>
                      </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">No patterns detected yet.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Anomalies (Server-Side AI) */}
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
              <CardDescription>AI-Powered Outlier Analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
                  <div className="h-4 bg-slate-800/50 rounded animate-pulse w-2/3" />
                </div>
              ) : anomalies.length > 0 ? (
                <div className="space-y-3">
                  {anomalies.map((anomaly, idx) => (
                    <motion.div
                      key={idx}
                      className="relative p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">{anomaly.description}</p>
                            <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Category: {anomaly.category} • ৳{anomaly.amount}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <p className="text-sm text-green-900 dark:text-green-300">No anomalies detected by AI.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gemini Analysis Section */}
      <Card className="glass-card border-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <CardTitle>Gemini Financial Advisor</CardTitle>
          </div>
          <CardDescription>
            Personalized insights generated by Google Gemini 1.5 Flash
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
                <div className="h-4 bg-slate-800/50 rounded animate-pulse w-full" />
                <div className="h-4 bg-slate-800/50 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-slate-800/50 rounded animate-pulse w-4/6" />
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-muted-foreground">
                <ReactMarkdown>
                    {geminiAnalysis}
                </ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Category Intelligence (Recharts) */}
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
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryIntelligence.slice(0, 5)}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => `৳${Number(value).toFixed(2)}`}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                    {categoryIntelligence.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
