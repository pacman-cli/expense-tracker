"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Calendar, TrendingUp, TrendingDown, DollarSign, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [topExpenses, setTopExpenses] = useState<any[]>([]);
  const [stats, setStats] = useState({ currentMonth: 0, lastMonth: 0, average: 0, prediction: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(false);
    
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      // Fetch category data
      const categoryRes = await api.get("/analytics/by-category?days=30");
      if (categoryRes.data && Array.isArray(categoryRes.data)) {
        setCategoryData(categoryRes.data);
      }

      // Fetch monthly comparison data
      const currentMonthRes = await api.get(`/analytics/monthly?year=${currentYear}&month=${currentMonth}`);
      const lastMonthRes = await api.get(`/analytics/monthly?year=${lastMonthYear}&month=${lastMonth}`);

      const current = currentMonthRes.data?.totalExpenses || 0;
      const last = lastMonthRes.data?.totalExpenses || 0;

      // Fetch last 6 months for trend
      const monthlyTrends: any[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        try {
          const res = await api.get(`/analytics/monthly?year=${year}&month=${month}`);
          monthlyTrends.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            total: res.data?.totalExpenses || 0
          });
        } catch (err) {
          monthlyTrends.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            total: 0
          });
        }
      }
      setMonthlyData(monthlyTrends);

      // Calculate stats
      const avg = monthlyTrends.reduce((sum, m) => sum + (m.total || 0), 0) / monthlyTrends.length;
      const prediction = current > 0 ? current * 1.05 : avg;

      setStats({
        currentMonth: current,
        lastMonth: last,
        average: avg,
        prediction: prediction
      });

      // Fetch top expenses
      const expensesRes = await api.get("/expenses?page=0&size=5&sort=amount,desc");
      const expenses = expensesRes.data?.content || expensesRes.data || [];
      setTopExpenses(Array.isArray(expenses) ? expenses.slice(0, 5) : []);

    } catch (error) {
      console.error("Failed to fetch analytics", error);
      setError(true);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  const changePercentage = stats.lastMonth > 0 
    ? ((stats.currentMonth - stats.lastMonth) / stats.lastMonth * 100).toFixed(1)
    : 0;
  const isIncrease = Number(changePercentage) > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Analytics & Insights
          </h2>
          <p className="text-muted-foreground">Comprehensive view of your spending patterns</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats.currentMonth.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {isIncrease ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-red-400" />
                    <span className="text-red-400">+{changePercentage}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">{changePercentage}%</span>
                  </>
                )}
                <span>from last month</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Last Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats.lastMonth.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Previous period</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">6-Month Avg</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats.average.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Average monthly spend</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Prediction</CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats.prediction.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Est. next month</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Spending by Category - Pie Chart */}
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Last 30 days distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ৳${entry.total.toFixed(0)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any) => `৳${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <p>No category data available</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={fetchAnalytics}>
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trends - Line Chart */}
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>6-Month Trends</CardTitle>
            <CardDescription>Your spending trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <XAxis
                    dataKey="month"
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
                    formatter={(value: any) => `৳${value.toFixed(2)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <p>No trend data available</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={fetchAnalytics}>
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Expenses Table */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle>Top 5 Largest Expenses</CardTitle>
          <CardDescription>Your biggest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : topExpenses.length > 0 ? (
            <div className="space-y-3">
              {topExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">৳{expense.amount.toLocaleString()}</div>
                    {expense.category && (
                      <div className="text-xs text-muted-foreground">{expense.category.name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p>No expenses found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
