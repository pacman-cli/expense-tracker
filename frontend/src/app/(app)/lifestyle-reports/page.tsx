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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [selectedReport, setSelectedReport] = useState<LifestyleReport | null>(null);

  // Mock data (Keep existing)
  const reports: LifestyleReport[] = []; // Cleared mock data


  if (reports.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 space-y-8 pb-20 md:pb-8 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
           <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
           </div>
           <h1 className="text-2xl font-bold">No Lifestyle Reports Yet</h1>
           <p className="text-muted-foreground max-w-sm mx-auto">
             Your financial insights will appear here once you have enough transaction data.
           </p>
        </div>
      </div>
    );
  }

  const activeReport = selectedReport || reports[0];

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

  const handleDownload = () => {
    const report = activeReport;
    
    // Create detailed HTML content
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lifestyle Report - ${report.title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
          .title { font-size: 28px; font-weight: bold; color: #2c3e50; margin: 0; }
          .subtitle { font-size: 16px; color: #7f8c8d; margin-top: 5px; }
          .meta { font-size: 14px; color: #95a5a6; margin-top: 10px; }
          
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .card { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
          .card-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #95a5a6; margin-bottom: 10px; font-weight: 600; }
          .card-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
          
          .section { margin-top: 40px; }
          .section-title { font-size: 20px; font-weight: bold; color: #2c3e50; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
          
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 12px; background: #f2f2f2; color: #7f8c8d; font-weight: 600; font-size: 14px; }
          td { padding: 12px; border-bottom: 1px solid #eee; }
          
          .highlight { color: #27ae60; font-weight: bold; }
          .expenses { color: #c0392b; font-weight: bold; }
          
          .achievements-list { list-style: none; padding: 0; }
          .achievement-item { padding: 10px; border-bottom: 1px solid #f2f2f2; display: flex; align-items: center; }
          .achievement-item:before { content: "★"; color: #f1c40f; margin-right: 10px; font-size: 18px; }
          
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #bdc3c7; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${report.title}</h1>
          <div class="subtitle">Detailed Financial & Lifestyle Analysis</div>
          <div class="meta">Period: ${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}</div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Financial Health</div>
            <div class="card-value" style="color: ${
              report.financialHealthStatus === 'EXCELLENT' ? '#27ae60' : 
              report.financialHealthStatus === 'GOOD' ? '#2980b9' : '#e67e22'
            }">
              ${report.financialHealthStatus}
            </div>
            <div style="font-size: 14px; color: #7f8c8d; margin-top: 5px;">Score: ${report.financialHealthScore}/100</div>
          </div>
          <div class="card">
            <div class="card-title">Net Savings</div>
            <div class="card-value highlight">$${report.netSavings.toLocaleString()}</div>
            <div style="font-size: 14px; color: #7f8c8d; margin-top: 5px;">Savings Rate: ${report.savingsRate}%</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Total Income</div>
            <div class="card-value">$${report.totalIncome.toLocaleString()}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Expenses</div>
            <div class="card-value expenses">$${report.totalExpenses.toLocaleString()}</div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Top Spending Categories</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              ${report.topCategories.map(cat => `
                <tr>
                  <td>${cat.name}</td>
                  <td>$${cat.amount.toLocaleString()}</td>
                  <td>${cat.percentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Achievements & Insights</h2>
          <ul class="achievements-list">
            ${report.achievements.map(a => `
              <li class="achievement-item">${a}</li>
            `).join('')}
          </ul>
        </div>

        <div class="footer">
          Generated by Antigravity Finance on ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                    <h2 className="text-3xl font-bold">{activeReport.title}</h2>
                    <p className="text-white/80 mt-1">
                       {new Date(activeReport.startDate).toLocaleDateString()} - {new Date(activeReport.endDate).toLocaleDateString()}
                    </p>
                 </div>
                 <Badge variant="secondary" className="self-start md:self-center px-4 py-2 bg-white/20 text-white backdrop-blur-md border-none gap-2 text-base">
                    {getHealthIcon(activeReport.financialHealthStatus)}
                    {activeReport.financialHealthStatus}
                 </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                    { label: "Income", amount: activeReport.totalIncome, icon: TrendingUp },
                    { label: "Expenses", amount: activeReport.totalExpenses, icon: TrendingDown },
                    { label: "Net Savings", amount: activeReport.netSavings, icon: Wallet },
                    { label: "Savings Rate", amount: `${activeReport.savingsRate.toFixed(1)}%`, icon: Target, isText: true }
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
                 <Dialog>
                    <DialogTrigger asChild>
                       <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-white/90">
                          <Eye className="w-4 h-4 mr-2" /> View Details
                       </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                       <DialogHeader>
                          <DialogTitle>{activeReport.title}</DialogTitle>
                          <DialogDescription>
                             Report period: {new Date(activeReport.startDate).toLocaleDateString()} - {new Date(activeReport.endDate).toLocaleDateString()}
                          </DialogDescription>
                       </DialogHeader>
                       <div className="space-y-6 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Income</p>
                                <p className="text-xl font-bold text-green-600">${activeReport.totalIncome.toLocaleString()}</p>
                             </div>
                             <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Expenses</p>
                                <p className="text-xl font-bold text-red-600">${activeReport.totalExpenses.toLocaleString()}</p>
                             </div>
                          </div>
                          
                          <div>
                             <h4 className="font-semibold mb-2">Top Categories</h4>
                             <div className="space-y-2">
                                {activeReport.topCategories.map((cat, i) => (
                                   <div key={i} className="flex justify-between items-center p-2 border rounded hover:bg-muted/50">
                                      <span>{cat.name}</span>
                                      <div className="text-right">
                                         <span className="font-bold block">${cat.amount}</span>
                                         <span className="text-xs text-muted-foreground">{cat.percentage}%</span>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>

                          <div>
                             <h4 className="font-semibold mb-2">Achievements</h4>
                             <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {activeReport.achievements.map((a, i) => (
                                   <li key={i}>{a}</li>
                                ))}
                             </ul>
                          </div>
                       </div>
                    </DialogContent>
                 </Dialog>

                 <Button 
                    variant="outline" 
                    className="bg-transparent border-white/30 text-white hover:bg-white/10"
                    onClick={handleDownload}
                 >
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
                          animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - activeReport.financialHealthScore / 100) }}
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
                       <span className="text-5xl font-bold tracking-tight">{activeReport.financialHealthScore}</span>
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
                    {activeReport.topCategories.map((category) => (
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
                       {activeReport.achievements.map((achievement, idx) => (
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
