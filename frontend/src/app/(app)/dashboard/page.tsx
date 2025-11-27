"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "@/lib/api";
import { DollarSign, TrendingUp, TrendingDown, Activity, Plus, Wallet, Repeat, AlertTriangle, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { MarketPulse } from "@/components/widgets/market-pulse";
import { SavingsGoalsWidget } from "@/components/widgets/savings-goals-widget";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category?: { name: string };
}

interface Budget {
  id: number;
  categoryName: string;
  amount: number;
  spent: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

interface RecurringExpense {
  id: number;
  description: string;
  amount: number;
  nextDueDate: string;
  frequency: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    monthlyExpenses: 0,
    yearlyExpenses: 0,
    activeBudgets: 0,
    recurringCount: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<Budget[]>([]);
  const [upcomingRecurring, setUpcomingRecurring] = useState<RecurringExpense[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // Fetch all data with individual error handling
      const [monthlyRes, yearlyRes, expensesRes, budgetsRes, recurringRes, trendsRes] = await Promise.allSettled([
        api.get(`/analytics/monthly?year=${year}&month=${month}`),
        api.get(`/analytics/yearly?year=${year}`),
        api.get("/expenses?page=0&size=5"),
        api.get("/budgets/current"),
        api.get("/recurring-expenses/active"),
        api.get("/analytics/trends?months=6"),
      ]);

      // Extract data safely with fallbacks
      const monthlyData = monthlyRes.status === 'fulfilled' ? monthlyRes.value.data : {};
      const yearlyData = yearlyRes.status === 'fulfilled' ? yearlyRes.value.data : {};
      const expensesData = expensesRes.status === 'fulfilled' ? expensesRes.value.data : { content: [] };
      const budgetsData = budgetsRes.status === 'fulfilled' ? budgetsRes.value.data : [];
      const recurringData = recurringRes.status === 'fulfilled' ? recurringRes.value.data : [];
      const trendsData = trendsRes.status === 'fulfilled' ? trendsRes.value.data : [];

      setStats({
        monthlyExpenses: monthlyData.totalExpenses || 0,
        yearlyExpenses: yearlyData.totalExpenses || 0,
        activeBudgets: budgetsData.length || 0,
        recurringCount: recurringData.length || 0,
      });

      setRecentExpenses(expensesData.content || []);
      
      // Budget alerts: budgets over 80% or overspent
      const alerts = budgetsData.filter((b: Budget) => b.percentageUsed >= 80 || b.isOverBudget);
      setBudgetAlerts(alerts.slice(0, 3));

      // Upcoming recurring (next 3)
      setUpcomingRecurring(recurringData.slice(0, 3));

      // Trends for chart
      setTrendData(trendsData);

      // Try to build category data from expenses if not in API
      if (expensesData.content && expensesData.content.length > 0) {
        const categoryMap = new Map();
        expensesData.content.forEach((exp: Expense) => {
          if (exp.category) {
            const name = exp.category.name;
            categoryMap.set(name, (categoryMap.get(name) || 0) + exp.amount);
          }
        });
        const categories = Array.from(categoryMap.entries())
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);
        setCategoryData(categories);
      }

      // Calculate Financial Health Score
      let score = 50; // Base score
      
      // Budget adherence (+20 max)
      if (budgetsData.length > 0) {
        const overBudgetCount = budgetsData.filter((b: Budget) => b.isOverBudget).length;
        if (overBudgetCount === 0) score += 20;
        else if (overBudgetCount === 1) score += 10;
      } else {
        score += 5; // Small bonus for starting
      }

      // Recurring bills tracking (+10)
      if (recurringData.length > 0) score += 10;

      // Savings Goals (+20 max) - Check localStorage
      const savedGoals = localStorage.getItem("savingsGoals");
      if (savedGoals) {
        const goals = JSON.parse(savedGoals);
        if (goals.length > 0) {
          score += 10;
          const hasProgress = goals.some((g: any) => g.currentAmount > 0);
          if (hasProgress) score += 10;
        }
      }

      setHealthScore(Math.min(100, score));

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      toast.error("Some dashboard data couldn't be loaded");
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Dashboard
        </h2>
      </div>

      {/* Stats Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats.monthlyExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total expenses
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Year</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{stats.yearlyExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Yearly total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBudgets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Budget trackers
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              <Repeat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recurringCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active recurring
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Commonly used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 border-primary/20 hover:bg-primary/10"
              onClick={() => router.push('/expenses')}
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Add Expense</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 border-primary/20 hover:bg-primary/10"
              onClick={() => router.push('/budgets')}
            >
              <Wallet className="h-5 w-5" />
              <span className="text-xs">Set Budget</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 border-primary/20 hover:bg-primary/10"
              onClick={() => router.push('/recurring')}
            >
              <Repeat className="h-5 w-5" />
              <span className="text-xs">Add Recurring</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 border-primary/20 hover:bg-primary/10"
              onClick={() => router.push('/analytics')}
            >
              <Activity className="h-5 w-5" />
              <span className="text-xs">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health & Insights Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Financial Health Score */}
        <Card className="glass-card border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-full blur-3xl" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-500" />
              Financial Health Score
            </CardTitle>
            <CardDescription>Your financial wellness overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-800"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#healthGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 56}
                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - healthScore / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                      {healthScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Health</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Budget Tracking</span>
                  <span className="font-medium">{stats.activeBudgets > 0 ? '✓ Active' : '○ Inactive'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Recurring Bills</span>
                  <span className="font-medium">{stats.recurringCount} tracked</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Spending Control</span>
                  <span className={`font-medium ${budgetAlerts.length === 0 ? 'text-green-400' : 'text-amber-400'}`}>
                    {budgetAlerts.length === 0 ? 'Excellent' : budgetAlerts.length < 2 ? 'Good' : 'Review'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spending Insights */}
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-500" />
              Smart Insights
            </CardTitle>
            <CardDescription>AI-powered spending observations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <div className="mt-0.5 p-1.5 rounded-full bg-cyan-500/20">
                  <DollarSign className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Monthly Spending</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ৳{stats.monthlyExpenses.toFixed(2)} spent so far this month
                  </p>
                </div>
              </div>
              {budgetAlerts.length === 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="mt-0.5 p-1.5 rounded-full bg-green-500/20">
                    <Activity className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Excellent Control! 🎉</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All budgets are within healthy limits
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="mt-0.5 p-1.5 rounded-full bg-primary/20">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Track More</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.activeBudgets === 0 
                      ? 'Set budgets to get personalized insights' 
                      : `${stats.activeBudgets} budget${stats.activeBudgets !== 1 ? 's' : ''} actively monitored`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="glass-card border-none lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest expenses</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/expenses')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
              ) : (
                recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{expense.description}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{expense.date}</p>
                        {expense.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {expense.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">-৳{expense.amount.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Savings Goals Widget */}
        <SavingsGoalsWidget />
      </div>

      {/* Budget Alerts & Upcoming Bills */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Budget Alerts */}
        <Card className="glass-card border-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <CardTitle>Budget Alerts</CardTitle>
            </div>
            <CardDescription>Budgets nearing limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">All budgets are healthy! 🎉</p>
              ) : (
                budgetAlerts.map((budget) => (
                  <div key={budget.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{budget.categoryName}</p>
                      <p className="text-xs text-muted-foreground">
                        ৳{budget.spent.toFixed(2)} of ৳{budget.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className={`text-sm font-bold ${budget.isOverBudget ? 'text-red-400' : 'text-yellow-400'}`}>
                      {budget.percentageUsed.toFixed(0)}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Recurring */}
        <Card className="glass-card border-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-500" />
              <CardTitle>Upcoming Bills</CardTitle>
            </div>
            <CardDescription>Next recurring expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingRecurring.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming bills</p>
              ) : (
                upcomingRecurring.map((recurring) => (
                  <div key={recurring.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{recurring.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {recurring.nextDueDate} • {recurring.frequency}
                      </p>
                    </div>
                    <div className="text-sm font-semibold">৳{recurring.amount.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Trends */}
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>6-Month Trends</CardTitle>
            <CardDescription>Your spending over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  formatter={(value: any) => `৳${value.toFixed(2)}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    paddingAngle={5}
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
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-xs font-medium">
                    {categoryData.length} Categories
                  </text>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No category data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
