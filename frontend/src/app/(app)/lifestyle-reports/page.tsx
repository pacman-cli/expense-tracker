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

  // Mock data
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
      case "EXCELLENT":
        return "text-green-600 bg-green-50";
      case "GOOD":
        return "text-blue-600 bg-blue-50";
      case "FAIR":
        return "text-yellow-600 bg-yellow-50";
      case "NEEDS_ATTENTION":
        return "text-orange-600 bg-orange-50";
      case "CRITICAL":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "EXCELLENT":
        return <Award className="w-5 h-5" />;
      case "GOOD":
        return <CheckCircle2 className="w-5 h-5" />;
      case "FAIR":
        return <Activity className="w-5 h-5" />;
      case "NEEDS_ATTENTION":
        return <AlertCircle className="w-5 h-5" />;
      case "CRITICAL":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
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
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-orange-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <BarChart3 className="w-12 h-12 text-pink-600" />
              <Sparkles className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <PieChart className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-5xl font-bold bg-linear-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
            Lifestyle Reports
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive insights into your spending habits, financial health,
            and lifestyle patterns 📊
          </p>
        </motion.div>

        {/* Current Report Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-linear-to-br from-pink-500 to-orange-500 rounded-3xl p-8 shadow-2xl text-white overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2">
                  Latest Report
                </p>
                <h2 className="text-3xl font-bold">{latestReport.title}</h2>
                <p className="text-white/90 mt-2">
                  {new Date(latestReport.startDate).toLocaleDateString()} -{" "}
                  {new Date(latestReport.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  {getHealthIcon(latestReport.financialHealthStatus)}
                  <span className="font-semibold">
                    {latestReport.financialHealthStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <p className="text-sm font-medium">Income</p>
                </div>
                <p className="text-3xl font-bold">
                  ${latestReport.totalIncome.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5" />
                  <p className="text-sm font-medium">Expenses</p>
                </div>
                <p className="text-3xl font-bold">
                  ${latestReport.totalExpenses.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5" />
                  <p className="text-sm font-medium">Savings</p>
                </div>
                <p className="text-3xl font-bold">
                  ${latestReport.netSavings.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5" />
                  <p className="text-sm font-medium">Savings Rate</p>
                </div>
                <p className="text-3xl font-bold">
                  {latestReport.savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button className="flex-1 px-6 py-3 bg-white text-pink-600 rounded-xl font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                <Eye className="w-5 h-5" />
                View Full Report
              </button>
              <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download
              </button>
              <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </motion.div>

        {/* Financial Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Financial Health Score
              </h3>
              <p className="text-gray-600 mt-1">
                Your overall financial wellness indicator
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-full font-semibold ${getHealthColor(
                latestReport.financialHealthStatus
              )}`}
            >
              {latestReport.financialHealthStatus}
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                    animate={{
                      strokeDashoffset:
                        2 *
                        Math.PI *
                        88 *
                        (1 - latestReport.financialHealthScore / 100),
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <p className="text-5xl font-bold text-gray-900">
                    {latestReport.financialHealthScore}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    out of 100
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Savings Habit", score: 92, color: "green" },
                { label: "Budget Control", score: 85, color: "blue" },
                { label: "Debt Management", score: 78, color: "yellow" },
              ].map((metric) => (
                <div key={metric.label} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">
                      {metric.label}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {metric.score}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.score}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-2 rounded-full bg-${metric.color}-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Spending Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Top Spending Categories
          </h3>
          <div className="space-y-4">
            {latestReport.topCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      {getCategoryIcon(category.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {category.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {category.percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    ${category.amount.toLocaleString()}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="h-3 rounded-full bg-linear-to-r from-pink-500 to-orange-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg border border-purple-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8 text-purple-600" />
            <h3 className="text-2xl font-bold text-gray-900">
              Achievements This Month
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestReport.achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-gray-900">{achievement}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Historical Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Previous Reports
            </h3>
            <div className="flex gap-2">
              {["monthly", "quarterly", "yearly"].map((period) => (
                <button
                  key={period}
                  onClick={() =>
                    setSelectedPeriod(
                      period as "monthly" | "quarterly" | "yearly"
                    )
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedPeriod === period
                      ? "bg-linear-to-r from-pink-600 to-orange-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {reports.slice(1).map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedReport(report);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">
                        {report.title}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getHealthColor(
                          report.financialHealthStatus
                        )}`}
                      >
                        {report.financialHealthStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-6 mt-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Health Score
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {report.financialHealthScore}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Savings Rate
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {report.savingsRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Total Expenses
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${report.totalExpenses.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Net Savings
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${report.netSavings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-blue-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-900">
              AI-Powered Insights
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(
              [
                {
                  title: "Great Progress!",
                  description:
                    "Your savings rate increased by 12% compared to last month. Keep up the excellent work!",
                  icon: TrendingUp,
                  color: "green",
                },
                {
                  title: "Spending Pattern",
                  description:
                    "You tend to spend more on weekends. Consider setting a weekend budget to maintain consistency.",
                  icon: Calendar,
                  color: "blue",
                },
                {
                  title: "Lifestyle Match",
                  description:
                    'Your spending habits align with a "Balanced" lifestyle - maintaining good control while enjoying life.',
                  icon: Activity,
                  color: "purple",
                },
                {
                  title: "Budget Opportunity",
                  description:
                    "Dining expenses are 15% above average. Small reductions could boost savings by $200/month.",
                  icon: Target,
                  color: "orange",
                },
              ] as Insight[]
            ).map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 bg-${insight.color}-100 rounded-lg shrink-0`}
                  >
                    <insight.icon
                      className={`w-6 h-6 text-${insight.color}-600`}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
