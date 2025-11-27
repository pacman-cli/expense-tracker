"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Wallet,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Calendar,
    BarChart3,
    Settings,
    Edit,
    Trash2,
    Copy,
    ArrowRight,
    DollarSign,
    Activity,
    CheckCircle,
    XCircle,
    Info,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface Budget {
    id: number;
    categoryName: string;
    categoryColor?: string;
    amount: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
    isOverBudget: boolean;
    month: number;
    year: number;
}

interface Category {
    id: number;
    name: string;
}

interface BudgetAnalytics {
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    overBudgetCount: number;
    onTrackCount: number;
    nearLimitCount: number;
    totalBudgets: number;
    overallPercentageUsed: number;
    topSpendingCategories: Array<{
        categoryName: string;
        spent: number;
        budget: number;
        percentage: number;
    }>;
}

interface BudgetAlert {
    type: string;
    severity: string;
    categoryName: string;
    budgetId: number;
    amount: number;
    spent: number;
    remaining?: number;
    over?: number;
    message: string;
}

interface BudgetDetails {
    id: number;
    categoryName: string;
    categoryColor: string;
    amount: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
    isOverBudget: boolean;
    month: number;
    year: number;
    expenses: Array<{
        id: number;
        description: string;
        amount: number;
        date: string;
    }>;
    transactionCount: number;
    dailyAverage?: number;
    projectedMonthlySpending?: number;
    projectedPercentage?: number;
}

const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#ef4444",
];

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [analytics, setAnalytics] = useState<BudgetAnalytics | null>(null);
    const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isRolloverDialogOpen, setIsRolloverDialogOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [budgetDetails, setBudgetDetails] = useState<BudgetDetails | null>(
        null,
    );
    const [activeTab, setActiveTab] = useState("overview");
    const [historyData, setHistoryData] = useState<Budget[]>([]);
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

    // Form state
    const [categoryId, setCategoryId] = useState("");
    const [amount, setAmount] = useState("");
    const [editAmount, setEditAmount] = useState("");
    const [rolloverToYear, setRolloverToYear] = useState("");
    const [rolloverToMonth, setRolloverToMonth] = useState("");

    const fetchData = async () => {
        try {
            const [budgetsRes, categoriesRes, analyticsRes, alertsRes] =
                await Promise.all([
                    api.get("/budgets/current"),
                    api.get("/categories"),
                    api.get("/budgets/analytics"),
                    api.get("/budgets/alerts"),
                ]);
            setBudgets(budgetsRes.data);
            setCategories(categoriesRes.data);
            setAnalytics(analyticsRes.data);
            setAlerts(alertsRes.data);
        } catch (error) {
            console.error("Failed to fetch budget data", error);
            toast.error("Failed to load budget data");
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get("/budgets/history?months=6");
            setHistoryData(res.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchHistory();
    }, []);

    const handleCreateBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/budgets", {
                categoryId: parseInt(categoryId),
                amount: parseFloat(amount),
            });
            setIsDialogOpen(false);
            fetchData();
            setCategoryId("");
            setAmount("");
            toast.success("Budget created successfully");
        } catch (error) {
            console.error("Failed to create budget", error);
            toast.error("Failed to create budget");
        }
    };

    const handleEditBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBudget) return;

        try {
            await api.post("/budgets", {
                categoryId: selectedBudget.id,
                amount: parseFloat(editAmount),
                year: selectedBudget.year,
                month: selectedBudget.month,
            });
            setIsEditDialogOpen(false);
            fetchData();
            setSelectedBudget(null);
            setEditAmount("");
            toast.success("Budget updated successfully");
        } catch (error) {
            console.error("Failed to update budget", error);
            toast.error("Failed to update budget");
        }
    };

    const handleDeleteBudget = async (budgetId: number) => {
        if (!confirm("Are you sure you want to delete this budget?")) return;

        try {
            await api.delete(`/budgets/${budgetId}`);
            fetchData();
            toast.success("Budget deleted successfully");
        } catch (error) {
            console.error("Failed to delete budget", error);
            toast.error("Failed to delete budget");
        }
    };

    const handleDuplicateBudget = async (budget: Budget) => {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        try {
            await api.post(`/budgets/${budget.id}/duplicate`, {
                year: nextMonth.getFullYear(),
                month: nextMonth.getMonth() + 1,
            });
            toast.success("Budget duplicated to next month");
            fetchData();
        } catch (error) {
            console.error("Failed to duplicate budget", error);
            toast.error("Failed to duplicate budget");
        }
    };

    const handleRollover = async (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date();

        try {
            const res = await api.post("/budgets/rollover", {
                fromYear: now.getFullYear(),
                fromMonth: now.getMonth() + 1,
                toYear: parseInt(rolloverToYear),
                toMonth: parseInt(rolloverToMonth),
            });

            toast.success(
                `${res.data.budgetsRolledOver} budgets rolled over successfully`,
            );
            setIsRolloverDialogOpen(false);
            setRolloverToYear("");
            setRolloverToMonth("");
            fetchData();
        } catch (error) {
            console.error("Failed to rollover budgets", error);
            toast.error("Failed to rollover budgets");
        }
    };

    const handleAdjustBudget = async (
        budgetId: number,
        amount: number,
        type: string,
    ) => {
        try {
            await api.post(`/budgets/${budgetId}/adjust`, {
                amount: amount,
                type: type,
            });
            toast.success(`Budget ${type}d by ৳${amount}`);
            fetchData();
        } catch (error) {
            console.error("Failed to adjust budget", error);
            toast.error("Failed to adjust budget");
        }
    };

    const openEditDialog = (budget: Budget) => {
        setSelectedBudget(budget);
        setEditAmount(budget.amount.toString());
        setIsEditDialogOpen(true);
    };

    const openDetailsDialog = async (budgetId: number) => {
        try {
            const res = await api.get(`/budgets/${budgetId}/details`);
            setBudgetDetails(res.data);
            setIsDetailsDialogOpen(true);
        } catch (error) {
            console.error("Failed to fetch budget details", error);
            toast.error("Failed to load budget details");
        }
    };

    const toggleCardExpansion = (budgetId: number) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(budgetId)) {
            newExpanded.delete(budgetId);
        } else {
            newExpanded.add(budgetId);
        }
        setExpandedCards(newExpanded);
    };

    const getBudgetStatusColor = (budget: Budget) => {
        if (budget.isOverBudget) return "text-red-400";
        if (budget.percentageUsed >= 90) return "text-orange-400";
        if (budget.percentageUsed >= 75) return "text-yellow-400";
        return "text-green-400";
    };

    const getBudgetStatusIcon = (budget: Budget) => {
        if (budget.isOverBudget) return XCircle;
        if (budget.percentageUsed >= 90) return AlertTriangle;
        if (budget.percentageUsed >= 75) return Info;
        return CheckCircle;
    };

    const getAlertColor = (severity: string) => {
        switch (severity) {
            case "high":
                return "bg-red-500/20 border-red-500/50 text-red-400";
            case "medium":
                return "bg-orange-500/20 border-orange-500/50 text-orange-400";
            case "low":
                return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
            default:
                return "bg-blue-500/20 border-blue-500/50 text-blue-400";
        }
    };

    // Prepare chart data
    const budgetChartData = budgets.map((b) => ({
        name: b.categoryName,
        budget: b.amount,
        spent: b.spent,
    }));

    const pieChartData = budgets.map((b) => ({
        name: b.categoryName,
        value: b.spent,
    }));

    const historyChartData = historyData
        .reduce(
            (
                acc: Array<{ month: string; spent: number; budget: number }>,
                budget,
            ) => {
                const key = `${budget.year}-${String(budget.month).padStart(2, "0")}`;
                const existing = acc.find((item) => item.month === key);

                if (existing) {
                    existing.spent += budget.spent;
                    existing.budget += budget.amount;
                } else {
                    acc.push({
                        month: key,
                        spent: budget.spent,
                        budget: budget.amount,
                    });
                }

                return acc;
            },
            [],
        )
        .sort((a, b) => a.month.localeCompare(b.month));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Budgets
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track and manage your spending limits
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="border-primary/20 hover:bg-primary/10"
                        onClick={() => setIsRolloverDialogOpen(true)}
                    >
                        <ArrowRight className="mr-2 h-4 w-4" /> Rollover
                    </Button>
                    <Button
                        variant="outline"
                        className="border-primary/20 hover:bg-primary/10 hover:border-primary/40"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Set Budget
                    </Button>
                </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-2">
                    {alerts.map((alert, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border ${getAlertColor(alert.severity)} backdrop-blur-sm`}
                        >
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium">
                                        {alert.message}
                                    </p>
                                    <p className="text-xs mt-1 opacity-80">
                                        {alert.type === "over_budget"
                                            ? `Over by ৳${alert.over?.toFixed(2)}`
                                            : `৳${alert.remaining?.toFixed(2)} remaining`}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        openDetailsDialog(alert.budgetId)
                                    }
                                >
                                    View
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Analytics Cards */}
            {analytics && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="glass-card border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Budget
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ৳{analytics.totalBudget.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {analytics.totalBudgets} active budgets
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Spent
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ৳{analytics.totalSpent.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {analytics.overallPercentageUsed.toFixed(1)}% of
                                budget
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Remaining
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ৳{analytics.totalRemaining.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Available to spend
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Status
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-green-400">
                                        On Track: {analytics.onTrackCount}
                                    </span>
                                    <span className="text-orange-400">
                                        Near Limit: {analytics.nearLimitCount}
                                    </span>
                                </div>
                                <div className="text-xs">
                                    <span className="text-red-400">
                                        Over Budget: {analytics.overBudgetCount}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="glass-card border-none">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : budgets.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center glass-card rounded-xl border-dashed border-2 border-muted">
                            <Wallet className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold">
                                No budgets set
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2">
                                Create a budget to track your spending limits
                                for specific categories.
                            </p>
                            <Button
                                className="mt-4"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Create Budget
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {budgets.map((budget) => {
                                const StatusIcon = getBudgetStatusIcon(budget);
                                const isExpanded = expandedCards.has(budget.id);

                                return (
                                    <motion.div
                                        key={budget.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <Card className="glass-card border-none hover:border-primary/20 transition-all">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    budget.categoryColor ||
                                                                    "#6366f1",
                                                            }}
                                                        />
                                                        <CardTitle className="text-lg font-medium">
                                                            {
                                                                budget.categoryName
                                                            }
                                                        </CardTitle>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <Settings className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="glass-card border-primary/20"
                                                        >
                                                            <DropdownMenuLabel>
                                                                Actions
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openDetailsDialog(
                                                                        budget.id,
                                                                    )
                                                                }
                                                            >
                                                                <Info className="mr-2 h-4 w-4" />{" "}
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openEditDialog(
                                                                        budget,
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />{" "}
                                                                Edit Budget
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDuplicateBudget(
                                                                        budget,
                                                                    )
                                                                }
                                                            >
                                                                <Copy className="mr-2 h-4 w-4" />{" "}
                                                                Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleAdjustBudget(
                                                                        budget.id,
                                                                        100,
                                                                        "increase",
                                                                    )
                                                                }
                                                            >
                                                                <TrendingUp className="mr-2 h-4 w-4" />{" "}
                                                                Increase ৳100
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleAdjustBudget(
                                                                        budget.id,
                                                                        100,
                                                                        "decrease",
                                                                    )
                                                                }
                                                            >
                                                                <TrendingDown className="mr-2 h-4 w-4" />{" "}
                                                                Decrease ৳100
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDeleteBudget(
                                                                        budget.id,
                                                                    )
                                                                }
                                                                className="text-red-400"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />{" "}
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                <CardDescription>
                                                    ৳{budget.spent.toFixed(2)}{" "}
                                                    of ৳
                                                    {budget.amount.toFixed(2)}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <Progress
                                                        value={Math.min(
                                                            budget.percentageUsed,
                                                            100,
                                                        )}
                                                        className={
                                                            budget.isOverBudget
                                                                ? "bg-red-900/20 [&>div]:bg-red-500"
                                                                : ""
                                                        }
                                                    />

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <StatusIcon
                                                                className={`h-4 w-4 ${getBudgetStatusColor(budget)}`}
                                                            />
                                                            <span className="text-xs text-muted-foreground">
                                                                {budget.percentageUsed.toFixed(
                                                                    1,
                                                                )}
                                                                % used
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={`text-sm font-medium ${budget.isOverBudget ? "text-red-400" : ""}`}
                                                        >
                                                            {budget.remaining >=
                                                            0
                                                                ? `৳${budget.remaining.toFixed(2)} left`
                                                                : `৳${Math.abs(budget.remaining).toFixed(2)} over`}
                                                        </span>
                                                    </div>

                                                    {budget.isOverBudget && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="w-full justify-center"
                                                        >
                                                            Over Budget!
                                                        </Badge>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() =>
                                                            toggleCardExpansion(
                                                                budget.id,
                                                            )
                                                        }
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <ChevronUp className="mr-2 h-4 w-4" />{" "}
                                                                Show Less
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="mr-2 h-4 w-4" />{" "}
                                                                Show More
                                                            </>
                                                        )}
                                                    </Button>

                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    height: "auto",
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                }}
                                                                className="space-y-2 pt-2 border-t border-primary/10"
                                                            >
                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                    <div className="glass-card p-2 rounded">
                                                                        <p className="text-muted-foreground">
                                                                            Month
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {
                                                                                budget.month
                                                                            }
                                                                            /
                                                                            {
                                                                                budget.year
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="glass-card p-2 rounded">
                                                                        <p className="text-muted-foreground">
                                                                            Category
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {
                                                                                budget.categoryName
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full"
                                                                    onClick={() =>
                                                                        openDetailsDialog(
                                                                            budget.id,
                                                                        )
                                                                    }
                                                                >
                                                                    View Full
                                                                    Details
                                                                </Button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Charts Tab */}
                <TabsContent value="charts" className="space-y-6">
                    {budgets.length === 0 ? (
                        <Card className="glass-card border-none">
                            <CardContent className="py-12 text-center">
                                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    No budget data to display
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Card className="glass-card border-none">
                                <CardHeader>
                                    <CardTitle>Budget vs Spending</CardTitle>
                                    <CardDescription>
                                        Compare budgets with actual spending
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <BarChart data={budgetChartData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#333"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#888"
                                            />
                                            <YAxis stroke="#888" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor:
                                                        "rgba(0, 0, 0, 0.8)",
                                                    border: "1px solid #333",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="budget"
                                                fill="#6366f1"
                                                name="Budget"
                                            />
                                            <Bar
                                                dataKey="spent"
                                                fill="#8b5cf6"
                                                name="Spent"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <div className="grid gap-6 md:grid-cols-2">
                                <Card className="glass-card border-none">
                                    <CardHeader>
                                        <CardTitle>
                                            Spending Distribution
                                        </CardTitle>
                                        <CardDescription>
                                            Breakdown by category
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={pieChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    label={(entry: any) =>
                                                        `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`
                                                    }
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {pieChartData.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    COLORS[
                                                                        index %
                                                                            COLORS.length
                                                                    ]
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor:
                                                            "rgba(0, 0, 0, 0.8)",
                                                        border: "1px solid #333",
                                                        borderRadius: "8px",
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {analytics && (
                                    <Card className="glass-card border-none">
                                        <CardHeader>
                                            <CardTitle>
                                                Top Spending Categories
                                            </CardTitle>
                                            <CardDescription>
                                                Highest spending this month
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {analytics.topSpendingCategories.map(
                                                    (cat, index) => (
                                                        <div
                                                            key={index}
                                                            className="space-y-2"
                                                        >
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="font-medium">
                                                                    {
                                                                        cat.categoryName
                                                                    }
                                                                </span>
                                                                <span className="text-muted-foreground">
                                                                    ৳
                                                                    {cat.spent.toFixed(
                                                                        2,
                                                                    )}{" "}
                                                                    / ৳
                                                                    {cat.budget.toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <Progress
                                                                value={
                                                                    cat.percentage
                                                                }
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </>
                    )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-6">
                    {historyData.length === 0 ? (
                        <Card className="glass-card border-none">
                            <CardContent className="py-12 text-center">
                                <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    No history data available
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Card className="glass-card border-none">
                                <CardHeader>
                                    <CardTitle>6-Month Trend</CardTitle>
                                    <CardDescription>
                                        Budget and spending over time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <LineChart data={historyChartData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#333"
                                            />
                                            <XAxis
                                                dataKey="month"
                                                stroke="#888"
                                            />
                                            <YAxis stroke="#888" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor:
                                                        "rgba(0, 0, 0, 0.8)",
                                                    border: "1px solid #333",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="budget"
                                                stroke="#6366f1"
                                                strokeWidth={2}
                                                name="Budget"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="spent"
                                                stroke="#ec4899"
                                                strokeWidth={2}
                                                name="Spent"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="glass-card border-none">
                                <CardHeader>
                                    <CardTitle>Historical Budgets</CardTitle>
                                    <CardDescription>
                                        Past budget records
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {historyData
                                            .slice(0, 20)
                                            .map((budget, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 glass-card rounded-lg hover:bg-primary/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    budget.categoryColor ||
                                                                    "#6366f1",
                                                            }}
                                                        />
                                                        <div>
                                                            <p className="font-medium text-sm">
                                                                {
                                                                    budget.categoryName
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {budget.month}/
                                                                {budget.year}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">
                                                            ৳
                                                            {budget.spent.toFixed(
                                                                2,
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            of ৳
                                                            {budget.amount.toFixed(
                                                                2,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>
            </Tabs>

            {/* Create Budget Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass-card border-primary/20">
                    <DialogHeader>
                        <DialogTitle>Set Monthly Budget</DialogTitle>
                        <DialogDescription>
                            Define a spending limit for a category.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateBudget}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="category"
                                    className="text-right"
                                >
                                    Category
                                </Label>
                                <select
                                    id="category"
                                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={categoryId}
                                    onChange={(e) =>
                                        setCategoryId(e.target.value)
                                    }
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                    Limit (৳)
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="col-span-3"
                                    placeholder="1000.00"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Create Budget</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Budget Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="glass-card border-primary/20">
                    <DialogHeader>
                        <DialogTitle>Edit Budget</DialogTitle>
                        <DialogDescription>
                            Update the budget amount for{" "}
                            {selectedBudget?.categoryName || "this category"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditBudget}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="edit-amount"
                                    className="text-right"
                                >
                                    New Amount (৳)
                                </Label>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    step="0.01"
                                    value={editAmount}
                                    onChange={(e) =>
                                        setEditAmount(e.target.value)
                                    }
                                    className="col-span-3"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Update Budget</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Budget Details Dialog */}
            <Dialog
                open={isDetailsDialogOpen}
                onOpenChange={setIsDetailsDialogOpen}
            >
                <DialogContent className="glass-card border-primary/20 max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Budget Details</DialogTitle>
                        <DialogDescription>
                            {budgetDetails?.categoryName} -{" "}
                            {budgetDetails?.month}/{budgetDetails?.year}
                        </DialogDescription>
                    </DialogHeader>
                    {budgetDetails && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="glass-card border-none">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">
                                            Budget Amount
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">
                                            ৳{budgetDetails.amount.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="glass-card border-none">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">
                                            Spent
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">
                                            ৳{budgetDetails.spent.toFixed(2)}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {budgetDetails.dailyAverage && (
                                <Card className="glass-card border-none">
                                    <CardHeader>
                                        <CardTitle className="text-sm">
                                            Projections
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Daily Average:
                                            </span>
                                            <span className="font-medium">
                                                ৳
                                                {budgetDetails.dailyAverage.toFixed(
                                                    2,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Projected Monthly:
                                            </span>
                                            <span className="font-medium">
                                                ৳
                                                {budgetDetails.projectedMonthlySpending?.toFixed(
                                                    2,
                                                )}
                                            </span>
                                        </div>
                                        {budgetDetails.projectedPercentage && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Projected Usage:
                                                </span>
                                                <span
                                                    className={`font-medium ${budgetDetails.projectedPercentage > 100 ? "text-red-400" : ""}`}
                                                >
                                                    {budgetDetails.projectedPercentage.toFixed(
                                                        1,
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="glass-card border-none">
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Recent Transactions (
                                        {budgetDetails.transactionCount})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {budgetDetails.expenses.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No transactions yet
                                            </p>
                                        ) : (
                                            budgetDetails.expenses.map(
                                                (expense) => (
                                                    <div
                                                        key={expense.id}
                                                        className="flex items-center justify-between p-2 glass-card rounded hover:bg-primary/5"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {
                                                                    expense.description
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {expense.date}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm font-bold">
                                                            ৳
                                                            {expense.amount.toFixed(
                                                                2,
                                                            )}
                                                        </p>
                                                    </div>
                                                ),
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Rollover Dialog */}
            <Dialog
                open={isRolloverDialogOpen}
                onOpenChange={setIsRolloverDialogOpen}
            >
                <DialogContent className="glass-card border-primary/20">
                    <DialogHeader>
                        <DialogTitle>Rollover Budgets</DialogTitle>
                        <DialogDescription>
                            Copy current month&apos;s budgets to another month
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRollover}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="to-year" className="text-right">
                                    To Year
                                </Label>
                                <Input
                                    id="to-year"
                                    type="number"
                                    value={rolloverToYear}
                                    onChange={(e) =>
                                        setRolloverToYear(e.target.value)
                                    }
                                    className="col-span-3"
                                    placeholder={new Date()
                                        .getFullYear()
                                        .toString()}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="to-month"
                                    className="text-right"
                                >
                                    To Month
                                </Label>
                                <Input
                                    id="to-month"
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={rolloverToMonth}
                                    onChange={(e) =>
                                        setRolloverToMonth(e.target.value)
                                    }
                                    className="col-span-3"
                                    placeholder={(
                                        new Date().getMonth() + 2
                                    ).toString()}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Rollover Budgets</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
