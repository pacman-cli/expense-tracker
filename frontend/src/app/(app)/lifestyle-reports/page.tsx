"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Activity,
  Award,
  Target,
  Zap,
  Heart,
  Coffee,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Sparkles,
  Calendar,
  Download,
  Share2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Star,
  Gift,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ... Interfaces (keep existing) ...
interface LifestyleReport {
  id: number;
  title: string;
  period: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  financialHealthScore: number;
  financialHealthStatus:
    | "EXCELLENT"
    | "GOOD"
    | "FAIR"
    | "NEEDS_ATTENTION"
    | "CRITICAL";
  lifestyleType: string;
  spendingPattern: string;
  topCategories: Array<{ name: string; amount: number; percentage: number }>;
  achievements: string[];
  isViewed: boolean;
  createdAt: string;
}

interface Insight {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export default function LifestyleReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "monthly" | "quarterly" | "yearly"
  >("monthly");
  const [, setSelectedReport] = useState<LifestyleReport | null>(null);

  // Mock data (Keep existing)
  const reports: LifestyleReport[] = [
    {
      id: 1,
      title: "January 2024 Lifestyle Report",
      period: "MONTHLY",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      totalIncome: 8500,
      totalExpenses: 6200,
      netSavings: 2300,
      savingsRate: 27.06,
      financialHealthScore: 85,
      financialHealthStatus: "EXCELLENT",
      lifestyleType: "BALANCED",
      spendingPattern: "CONSISTENT",
      topCategories: [
        { name: "Housing", amount: 2000, percentage: 32.26 },
        { name: "Food & Dining", amount: 1200, percentage: 19.35 },
        { name: "Transportation", amount: 800, percentage: 12.9 },
        { name: "Entertainment", amount: 600, percentage: 9.68 },
        { name: "Shopping", amount: 500, percentage: 8.06 },
      ],
      achievements: [
        "Stayed within budget all month",
        "Saved 27% of income",
        "Reduced dining expenses by 15%",
        "Met savings goal for January",
      ],
      isViewed: true,
      createdAt: "2024-02-01",
    },
    {
      id: 2,
      title: "December 2023 Lifestyle Report",
      period: "MONTHLY",
      startDate: "2023-12-01",
      endDate: "2023-12-31",
      totalIncome: 9200,
      totalExpenses: 7800,
      netSavings: 1400,
      savingsRate: 15.22,
      financialHealthScore: 72,
      financialHealthStatus: "GOOD",
      lifestyleType: "HIGH_SPENDER",
      spendingPattern: "SEASONAL",
      topCategories: [
        { name: "Shopping", amount: 2200, percentage: 28.21 },
        { name: "Housing", amount: 2000, percentage: 25.64 },
        { name: "Food & Dining", amount: 1500, percentage: 19.23 },
        { name: "Gifts", amount: 800, percentage: 10.26 },
        { name: "Entertainment", amount: 700, percentage: 8.97 },
      ],
      achievements: [
        "Holiday spending controlled",
        "Maintained emergency fund",
        "Paid off credit card",
      ],
      isViewed: true,
      createdAt: "2024-01-01",
    },
    {
      id: 3,
      title: "November 2023 Lifestyle Report",
      period: "MONTHLY",
      startDate: "2023-11-01",
      endDate: "2023-11-30",
      totalIncome: 8500,
      totalExpenses: 5800,
      netSavings: 2700,
      savingsRate: 31.76,
      financialHealthScore: 88,
      financialHealthStatus: "EXCELLENT",
      lifestyleType: "BALANCED",
      spendingPattern: "CONSISTENT",
      topCategories: [
        { name: "Housing", amount: 2000, percentage: 34.48 },
        { name: "Food & Dining", amount: 1000, percentage: 17.24 },
        { name: "Transportation", amount: 750, percentage: 12.93 },
        { name: "Utilities", amount: 600, percentage: 10.34 },
        { name: "Entertainment", amount: 450, percentage: 7.76 },
      ],
      achievements: [
        "Highest savings rate this year!",
        "Zero impulse purchases",
        "Stayed under budget in all categories",
        "Invested $1000 in savings",
      ],
      isViewed: true,
      createdAt: "2023-12-01",
    },
  ];

  const latestReport = reports[0];

  const getHealthColor = (status: string) => {
    switch (status) {
      case "EXCELLENT": return "bg-green-100 text-green-800 border-green-200";
      case "GOOD": return "bg-blue-100 text-blue-800 border-blue-200";
      case "FAIR": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "NEEDS_ATTENTION": return "bg-orange-100 text-orange-800 border-orange-200";
      case "CRITICAL": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "EXCELLENT": return <Award className="w-4 h-4" />;
      case "GOOD": return <CheckCircle2 className="w-4 h-4" />;
      case "FAIR": return <Activity className="w-4 h-4" />;
      case "NEEDS_ATTENTION": return <AlertCircle className="w-4 h-4" />;
      case "CRITICAL": return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (name: string) => {
    const iconMap: Record<string, React.ElementType> = {
      Housing: Home,
      "Food & Dining": Utensils,
      Transportation: Car,
      Entertainment: Coffee,
      Shopping: ShoppingBag,
      Utilities: Zap,
      Gifts: Gift,
      Healthcare: Heart,
    };
    const Icon = iconMap[name] || ShoppingBag;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Lifestyle Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered insights into your financial health and spending patterns
            </p>
          </div>
          <div className="flex items-center gap-2">
            {["monthly", "quarterly", "yearly"].map((period) => (
               <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period as any)}
                  className="capitalize"
               >
                  {period}
               </Button>
            ))}
          </div>
        </div>

        {/* Current Report Highlight */}
        <Card className="border-none bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl" />
           <CardContent className="p-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                 <div>
                    <Badge variant="secondary" className="mb-2 bg-white/20 text-white hover:bg-white/30 border-none">
                       Latest Report
                    </Badge>
                    <h2 className="text-3xl font-bold">{latestReport.title}</h2>
                    <p className="text-white/80 mt-1">
                       {new Date(latestReport.startDate).toLocaleDateString()} - {new Date(latestReport.endDate).toLocaleDateString()}
                    </p>
                 </div>
                 <Badge variant="secondary" className="self-start md:self-center px-4 py-2 bg-white/20 text-white backdrop-blur-md border-none gap-2 text-base">
                    {getHealthIcon(latestReport.financialHealthStatus)}
                    {latestReport.financialHealthStatus}
                 </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                    { label: "Income", amount: latestReport.totalIncome, icon: TrendingUp },
                    { label: "Expenses", amount: latestReport.totalExpenses, icon: TrendingDown },
                    { label: "Net Savings", amount: latestReport.netSavings, icon: Wallet },
                    { label: "Savings Rate", amount: `${latestReport.savingsRate.toFixed(1)}%`, icon: Target, isText: true }
                 ].map((stat, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-colors">
                       <div className="flex items-center gap-2 mb-2 text-white/80">
                          <stat.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{stat.label}</span>
                       </div>
                       <p className="text-2xl font-bold">
                          {stat.isText ? stat.amount : `$${stat.amount.toLocaleString()}`}
                       </p>
                    </div>
                 ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                 <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-white/90">
                    <Eye className="w-4 h-4 mr-2" /> View Details
                 </Button>
                 <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                    <Download className="w-4 h-4 mr-2" /> Download
                 </Button>
              </div>
           </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Financial Health Score (Left Column) */}
           <Card className="lg:col-span-1 border-muted/20 shadow-sm">
              <CardHeader>
                 <CardTitle>Health Score</CardTitle>
                 <CardDescription>Overall financial wellness</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                 <div className="relative w-48 h-48 my-4">
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/20" />
                       <motion.circle
                          cx="96" cy="96" r="88" fill="none" stroke="url(#gradient)" strokeWidth="12" strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 88}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - latestReport.financialHealthScore / 100) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                       />
                       <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                             <stop offset="0%" stopColor="#818cf8" />
                             <stop offset="100%" stopColor="#c084fc" />
                          </linearGradient>
                       </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-5xl font-bold tracking-tight">{latestReport.financialHealthScore}</span>
                       <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Score</span>
                    </div>
                 </div>
                 
                 <div className="w-full space-y-4 mt-4">
                    {[
                       { label: "Savings Habit", score: 92, color: "bg-green-500" },
                       { label: "Budget Control", score: 85, color: "bg-blue-500" },
                       { label: "Debt Management", score: 78, color: "bg-yellow-500" },
                    ].map((metric) => (
                       <div key={metric.label} className="space-y-1">
                          <div className="flex justify-between text-sm">
                             <span className="font-medium">{metric.label}</span>
                             <span className="text-muted-foreground">{metric.score}/100</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                             <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${metric.score}%` }} />
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           {/* Insights and Achievements (Right Column) */}
           <div className="lg:col-span-2 space-y-8">
              {/* Spending Breakdown */}
              <Card className="border-muted/20 shadow-sm">
                 <CardHeader>
                    <CardTitle>Top Expenses</CardTitle>
                    <CardDescription>Where your money went this month</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    {latestReport.topCategories.map((category) => (
                       <div key={category.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-lg text-primary">
                                   {getCategoryIcon(category.name)}
                                </div>
                                <div>
                                   <p className="font-medium">{category.name}</p>
                                   <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}% of total</p>
                                </div>
                             </div>
                             <span className="font-bold">${category.amount.toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                             <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${category.percentage}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-primary/80 rounded-full"
                             />
                          </div>
                       </div>
                    ))}
                 </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="border-muted/20 shadow-sm bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
                 <CardHeader>
                    <div className="flex items-center gap-2">
                       <Award className="w-5 h-5 text-indigo-500" />
                       <CardTitle>Achievements</CardTitle>
                    </div>
                 </CardHeader>
                 <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {latestReport.achievements.map((achievement, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50">
                             <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
                             </div>
                             <span className="text-sm font-medium">{achievement}</span>
                          </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>

        {/* Previous Reports List */}
        <div className="space-y-4">
           <h3 className="text-xl font-bold tracking-tight">Report History</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.slice(1).map((report) => (
                 <Card key={report.id} className="cursor-pointer hover:border-primary/50 transition-all border-muted/20 shadow-sm" onClick={() => setSelectedReport(report)}>
                    <CardHeader className="pb-3">
                       <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-base font-semibold line-clamp-1">{report.title}</CardTitle>
                          <Badge variant="outline" className={`${getHealthColor(report.financialHealthStatus)} border text-[10px]`}>
                             {report.financialHealthStatus}
                          </Badge>
                       </div>
                       <CardDescription>{new Date(report.startDate).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                             <p className="text-muted-foreground text-xs">Savings Rate</p>
                             <p className="font-bold text-green-600 dark:text-green-400">{report.savingsRate}%</p>
                          </div>
                          <div>
                             <p className="text-muted-foreground text-xs">Net Savings</p>
                             <p className="font-bold text-blue-600 dark:text-blue-400">${report.netSavings.toLocaleString()}</p>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
