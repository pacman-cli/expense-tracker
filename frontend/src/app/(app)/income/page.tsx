"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isAxiosError } from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Wallet,
  Briefcase,
  DollarSign,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Income {
  id: number;
  source: string;
  amount: number;
  date: string;
  description: string;
  walletName: string;
}

interface WalletType {
  id: number;
  name: string;
}

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    if (data?.error || data?.message) {
      return data.error ?? data.message ?? fallback;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [walletId, setWalletId] = useState("");

  const fetchData = async () => {
    try {
      const [incomeRes, walletRes] = await Promise.all([
        api.get("/incomes"),
        api.get("/wallets"),
      ]);
      setIncomes(incomeRes.data);
      setWallets(walletRes.data);
    } catch (error) {
      console.error("=== INCOME FETCH ERROR ===");
      console.error("Full error:", error);
      if (isAxiosError(error)) {
        console.error("Error response:", error.response);
        console.error("Error request:", error.request);
        console.error("Error message:", error.message);
      }

      // Check if user is not authenticated
      const hasAuthToken = localStorage.getItem("accessToken");
      if (!hasAuthToken) {
        toast.error("Please log in first");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return;
      }

      // Show appropriate error message
      if (isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 401) {
            toast.error("Session expired. Please log in again");
            setTimeout(() => {
              window.location.href = "/login";
            }, 1500);
          } else {
            toast.error(
              getErrorMessage(error, `Server error: ${error.response.status}`)
            );
          }
        } else if (error.request) {
          toast.error("Cannot connect to backend server on port 8080");
        } else {
          toast.error(getErrorMessage(error, "Failed to fetch incomes"));
        }
      } else {
        toast.error(getErrorMessage(error, "Failed to fetch incomes"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/incomes", {
        source,
        amount: parseFloat(amount),
        date,
        description,
        walletId: walletId ? parseInt(walletId) : null,
      });
      setIsDialogOpen(false);
      fetchData();
      // Reset form
      setSource("");
      setAmount("");
      setDescription("");
      setWalletId("");
      toast.success("Income recorded successfully");
    } catch (error) {
      console.error("Failed to record income", error);
      toast.error(getErrorMessage(error, "Failed to record income"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This will deduct the amount from the wallet."))
      return;
    try {
      await api.delete(`/incomes/${id}`);
      fetchData();
      toast.success("Income deleted");
    } catch (error) {
      console.error("Failed to delete income", error);
      toast.error(getErrorMessage(error, "Failed to delete income"));
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    // This month's income
    const now = new Date();
    const thisMonth = incomes.filter((i) => {
      const incomeDate = new Date(i.date);
      return (
        incomeDate.getMonth() === now.getMonth() &&
        incomeDate.getFullYear() === now.getFullYear()
      );
    });
    const thisMonthTotal = thisMonth.reduce((sum, i) => sum + i.amount, 0);

    // Last month's income
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthIncomes = incomes.filter((i) => {
      const incomeDate = new Date(i.date);
      return (
        incomeDate.getMonth() === lastMonth.getMonth() &&
        incomeDate.getFullYear() === lastMonth.getFullYear()
      );
    });
    const lastMonthTotal = lastMonthIncomes.reduce(
      (sum, i) => sum + i.amount,
      0
    );

    // Growth calculation
    const growth =
      lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : 0;

    // Average income per month
    const monthsWithIncome = new Set(
      incomes.map((i) => {
        const d = new Date(i.date);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })
    ).size;
    const avgMonthly =
      monthsWithIncome > 0 ? totalIncome / monthsWithIncome : 0;

    return {
      total: totalIncome,
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
      growth,
      avgMonthly,
      count: incomes.length,
    };
  }, [incomes]);

  // Prepare chart data - last 6 months
  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      const monthIncomes = incomes.filter((income) => {
        const incomeDate = new Date(income.date);
        return (
          incomeDate.getMonth() === date.getMonth() &&
          incomeDate.getFullYear() === date.getFullYear()
        );
      });

      const total = monthIncomes.reduce((sum, i) => sum + i.amount, 0);

      months.push({
        month: monthName,
        amount: total,
      });
    }

    return months;
  }, [incomes]);

  const getSourceIcon = (source: string) => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes("salary") || lowerSource.includes("wage"))
      return Briefcase;
    if (lowerSource.includes("freelance") || lowerSource.includes("project"))
      return DollarSign;
    if (lowerSource.includes("invest") || lowerSource.includes("dividend"))
      return TrendingUp;
    return PiggyBank;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-linear-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Income Tracking
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitor your earnings and cash flow
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Income</DialogTitle>
              <DialogDescription>Add a new source of income.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Salary, Freelance"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wallet">Deposit To (Wallet)</Label>
                  <Select value={walletId} onValueChange={setWalletId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((w) => (
                        <SelectItem key={w.id} value={w.id.toString()}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional details"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">
                  Save Income
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-none bg-linear-to-br from-green-500/20 to-emerald-500/20 overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Earnings
                </p>
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-400">
                ৳{stats.total.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.count} transactions
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* This Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-none overflow-hidden relative group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  This Month
                </p>
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
              <p className="text-3xl font-bold">
                ৳{stats.thisMonth.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {stats.growth >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-400" />
                    <p className="text-xs text-green-400">
                      +{stats.growth.toFixed(1)}% from last month
                    </p>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-400" />
                    <p className="text-xs text-red-400">
                      {stats.growth.toFixed(1)}% from last month
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Monthly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-none overflow-hidden relative group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Monthly
                </p>
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-400">
                ৳{stats.avgMonthly.toFixed(0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">per month</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Last Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-none overflow-hidden relative group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Last Month
                </p>
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-400">
                ৳{stats.lastMonth.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                previous period
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Income Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>Income Trend</CardTitle>
            <CardDescription>Last 6 months earnings overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `৳${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [
                    `৳${value.toLocaleString()}`,
                    "Income",
                  ]}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#colorGradient)`} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Income List */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle>Recent Income</CardTitle>
          <CardDescription>Your latest earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              </div>
            ) : incomes.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No income records found.
                </p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Income
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                {incomes.map((income, index) => {
                  const SourceIcon = getSourceIcon(income.source);

                  return (
                    <motion.div
                      key={income.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-linear-to-r from-green-500/5 to-emerald-500/5 hover:from-green-500/10 hover:to-emerald-500/10 border border-green-500/10 dark:border-green-500/20 transition-all group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
                          <SourceIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-lg">
                            {income.source}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(income.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            {income.walletName && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                <Wallet className="h-3 w-3" />{" "}
                                {income.walletName}
                              </span>
                            )}
                            {income.description && (
                              <span className="truncate max-w-xs">
                                {income.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-green-400">
                          +৳{income.amount.toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(income.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
