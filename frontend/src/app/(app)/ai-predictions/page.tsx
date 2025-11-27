"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    TrendingDown,
    Brain,
    Sparkles,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    Calendar,
    DollarSign,
    Target,
    Activity,
    BarChart3,
    PieChart as PieChartIcon,
    Zap,
    LineChart,
    Info,
    ArrowUpRight,
    ArrowDownRight,
    Lightbulb,
    Trash2,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from "recharts";

interface Prediction {
    id: number;
    categoryName: string | null;
    predictionDate: string;
    predictedAmount: number;
    actualAmount: number | null;
    confidence: number;
    predictionType: string;
    predictionPeriod: string;
    algorithmUsed: string;
    insights: string;
    isAccurate: boolean;
    accuracyPercentage: number | null;
    variance: number | null;
}

interface AccuracyStats {
    totalPredictions: number;
    accuratePredictions: number;
    accuracyRate: number;
    averageAccuracy: number;
}

export default function AIPredictionsPage() {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [accuracyStats, setAccuracyStats] = useState<AccuracyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "category" | "recurring" | "alerts">("all");

    useEffect(() => {
        fetchPredictions();
        fetchAccuracyStats();
    }, []);

    const fetchPredictions = async () => {
        try {
            const res = await api.get("/predictions");
            setPredictions(res.data);
        } catch (error) {
            console.error("Failed to fetch predictions", error);
            toast.error("Failed to load predictions");
        } finally {
            setLoading(false);
        }
    };

    const fetchAccuracyStats = async () => {
        try {
            const res = await api.get("/predictions/accuracy");
            setAccuracyStats(res.data);
        } catch (error) {
            console.error("Failed to fetch accuracy stats", error);
        }
    };

    const generatePredictions = async () => {
        setGenerating(true);
        try {
            await api.post("/predictions/generate");
            await fetchPredictions();
            await fetchAccuracyStats();
            toast.success("AI predictions generated successfully!");
        } catch (error) {
            console.error("Failed to generate predictions", error);
            toast.error("Failed to generate predictions");
        } finally {
            setGenerating(false);
        }
    };

    const resetPredictions = async () => {
        if (!window.confirm("Are you sure you want to delete all predictions? This action cannot be undone.")) {
            return;
        }
        
        setGenerating(true);
        try {
            await api.delete("/predictions");
            await fetchPredictions();
            await fetchAccuracyStats();
            toast.success("All predictions have been reset");
        } catch (error) {
            console.error("Failed to reset predictions", error);
            toast.error("Failed to reset predictions");
        } finally {
            setGenerating(false);
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return "text-green-400";
        if (confidence >= 60) return "text-yellow-400";
        return "text-orange-400";
    };

    const getConfidenceBadgeVariant = (confidence: number) => {
        if (confidence >= 80) return "bg-green-500/20 text-green-400 border-green-500/30";
        if (confidence >= 60) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    };

    const getPredictionTypeConfig = (type: string) => {
        const configs: Record<string, any> = {
            TOTAL_EXPENSE: {
                icon: DollarSign,
                label: "Total Expense",
                color: "text-blue-400",
                bg: "bg-blue-500/20",
                gradient: "from-blue-500 to-cyan-500",
            },
            CATEGORY_EXPENSE: {
                icon: PieChartIcon,
                label: "Category",
                color: "text-purple-400",
                bg: "bg-purple-500/20",
                gradient: "from-purple-500 to-pink-500",
            },
            UNUSUAL_SPENDING: {
                icon: AlertTriangle,
                label: "Unusual Spending",
                color: "text-orange-400",
                bg: "bg-orange-500/20",
                gradient: "from-orange-500 to-red-500",
            },
            RECURRING_EXPENSE: {
                icon: Target,
                label: "Recurring",
                color: "text-green-400",
                bg: "bg-green-500/20",
                gradient: "from-green-500 to-emerald-500",
            },
            BUDGET_BREACH: {
                icon: AlertTriangle,
                label: "Budget Alert",
                color: "text-red-400",
                bg: "bg-red-500/20",
                gradient: "from-red-500 to-rose-500",
            },
        };
        return configs[type] || configs.TOTAL_EXPENSE;
    };

    const filteredPredictions = predictions.filter((p) => {
        if (activeTab === "all") return true;
        if (activeTab === "category") return p.predictionType === "CATEGORY_EXPENSE";
        if (activeTab === "recurring") return p.predictionType === "RECURRING_EXPENSE";
        if (activeTab === "alerts")
            return p.predictionType === "UNUSUAL_SPENDING" || p.predictionType === "BUDGET_BREACH";
        return true;
    });

    // Prepare chart data
    const categoryPredictions = predictions
        .filter((p) => p.predictionType === "CATEGORY_EXPENSE")
        .map((p) => ({
            name: p.categoryName || "Other",
            value: p.predictedAmount,
            confidence: p.confidence,
        }));

    const COLORS = ["#3b82f6", "#a855f7", "#ec4899", "#10b981", "#f59e0b", "#06b6d4"];

    const accuracyData = predictions
        .filter((p) => p.actualAmount !== null)
        .slice(0, 10)
        .map((p) => ({
            name: p.categoryName || "Total",
            predicted: p.predictedAmount,
            actual: p.actualAmount || 0,
            accuracy: p.accuracyPercentage || 0,
        }));

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                            <Brain className="h-8 w-8 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                                AI Expense Predictions
                            </h2>
                            <p className="text-muted-foreground mt-1 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Smart forecasting powered by machine learning
                            </p>
                        </div>
                    </div>
                </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={generatePredictions}
                            disabled={generating}
                            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 rounded-xl"
                        >
                            {generating ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Predictions
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={resetPredictions}
                            disabled={generating || predictions.length === 0}
                            variant="outline"
                            className="rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Reset All
                        </Button>
                    </div>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
                {/* Total Predictions */}
                <motion.div variants={itemVariants}>
                    <Card className="glass-card border-none overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                    <Activity className="h-6 w-6 text-purple-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Total Predictions
                                </p>
                                <h3 className="text-3xl font-bold text-purple-400">
                                    {predictions.length}
                                </h3>
                                <p className="text-xs text-muted-foreground">Active forecasts</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Accuracy Rate */}
                <motion.div variants={itemVariants}>
                    <Card className="glass-card border-none overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                                    <Target className="h-6 w-6 text-green-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Accuracy Rate
                                </p>
                                <h3 className="text-3xl font-bold text-green-400">
                                    {accuracyStats ? `${accuracyStats.accuracyRate.toFixed(1)}%` : "N/A"}
                                </h3>
                                <p className="text-xs text-muted-foreground">Model performance</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Average Accuracy */}
                <motion.div variants={itemVariants}>
                    <Card className="glass-card border-none overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                                    <BarChart3 className="h-6 w-6 text-blue-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Avg Accuracy
                                </p>
                                <h3 className="text-3xl font-bold text-blue-400">
                                    {accuracyStats
                                        ? `${accuracyStats.averageAccuracy.toFixed(1)}%`
                                        : "N/A"}
                                </h3>
                                <p className="text-xs text-muted-foreground">Mean precision</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Accurate Predictions */}
                <motion.div variants={itemVariants}>
                    <Card className="glass-card border-none overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                                    <CheckCircle2 className="h-6 w-6 text-indigo-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Accurate
                                </p>
                                <h3 className="text-3xl font-bold text-indigo-400">
                                    {accuracyStats ? accuracyStats.accuratePredictions : 0}
                                </h3>
                                <p className="text-xs text-muted-foreground">Successful forecasts</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Charts Section */}
            {predictions.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Category Predictions Pie Chart */}
                    {categoryPredictions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass-card border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <PieChartIcon className="h-5 w-5 text-purple-400" />
                                        Category Predictions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={categoryPredictions}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) =>
                                                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                                                }
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {categoryPredictions.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "rgba(0,0,0,0.9)",
                                                    border: "none",
                                                    borderRadius: "12px",
                                                    color: "#fff",
                                                    padding: "12px",
                                                }}
                                                formatter={(value: number) => `৳${value.toFixed(2)}`}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Accuracy Comparison Chart */}
                    {accuracyData.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="glass-card border-none">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-blue-400" />
                                        Predicted vs Actual
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={accuracyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="name" stroke="#888" />
                                            <YAxis stroke="#888" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "rgba(0,0,0,0.9)",
                                                    border: "none",
                                                    borderRadius: "12px",
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="predicted" fill="#3b82f6" name="Predicted" />
                                            <Bar dataKey="actual" fill="#10b981" name="Actual" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { key: "all" as const, label: "All Predictions", icon: Activity },
                    { key: "category" as const, label: "Category", icon: PieChartIcon },
                    { key: "recurring" as const, label: "Recurring", icon: Target },
                    { key: "alerts" as const, label: "Alerts", icon: AlertTriangle },
                ].map((tab) => (
                    <Button
                        key={tab.key}
                        variant={activeTab === tab.key ? "default" : "outline"}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 rounded-xl ${
                            activeTab === tab.key
                                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                : ""
                        }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Predictions List */}
            <div className="grid gap-6 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full flex items-center justify-center py-20"
                        >
                            <div className="text-center space-y-4">
                                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
                                <p className="text-sm text-muted-foreground">
                                    Loading AI predictions...
                                </p>
                            </div>
                        </motion.div>
                    ) : filteredPredictions.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full"
                        >
                            <Card className="glass-card border-none border-dashed border-2 border-white/20">
                                <CardContent className="flex flex-col items-center justify-center py-20">
                                    <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6">
                                        <Brain className="h-16 w-16 text-purple-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        No Predictions Yet
                                    </h3>
                                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                                        Generate AI-powered predictions to forecast your future
                                        expenses based on historical data
                                    </p>
                                    <Button
                                        onClick={generatePredictions}
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
                                    >
                                        <Zap className="mr-2 h-4 w-4" />
                                        Generate Predictions
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        filteredPredictions.map((prediction, index) => {
                            const config = getPredictionTypeConfig(prediction.predictionType);
                            const Icon = config.icon;

                            return (
                                <motion.div
                                    key={prediction.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                >
                                    <Card className="glass-card border-none overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
                                        />

                                        <CardHeader className="relative z-10 pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`p-3 rounded-xl ${config.bg} ${config.color}`}
                                                    >
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg font-bold">
                                                            {prediction.categoryName || config.label}
                                                        </CardTitle>
                                                        <p className="text-xs text-muted-foreground">
                                                            {config.label} •{" "}
                                                            {new Date(
                                                                prediction.predictionDate,
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={`${getConfidenceBadgeVariant(prediction.confidence)} border`}
                                                >
                                                    {prediction.confidence}%
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="relative z-10 space-y-4">
                                            {/* Predicted Amount */}
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                                    Predicted Amount
                                                </p>
                                                <p
                                                    className={`text-3xl font-bold ${config.color}`}
                                                >
                                                    ৳{prediction.predictedAmount.toFixed(2)}
                                                </p>
                                            </div>

                                            {/* Actual Amount if available */}
                                            {prediction.actualAmount !== null && (
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-slate-800/30">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Actual Amount
                                                        </p>
                                                        <p className="text-lg font-semibold">
                                                            ৳{prediction.actualAmount.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    {prediction.accuracyPercentage !== null && (
                                                        <div className="text-right">
                                                            <p className="text-xs text-muted-foreground">
                                                                Accuracy
                                                            </p>
                                                            <p
                                                                className={`text-lg font-semibold ${
                                                                    prediction.isAccurate
                                                                        ? "text-green-400"
                                                                        : "text-orange-400"
                                                                }`}
                                                            >
                                                                {prediction.accuracyPercentage.toFixed(
                                                                    1,
                                                                )}
                                                                %
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Insights */}
                                            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                                    <Lightbulb className="h-16 w-16 text-amber-500" />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2 text-amber-500">
                                                        <Lightbulb className="h-4 w-4" />
                                                        <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
                                                    </div>
                                                    <p className="text-sm font-medium leading-relaxed text-foreground/90">
                                                        {prediction.insights}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Algorithm Info */}
                                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-white/10">
                                                <span className="flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" />
                                                    {prediction.algorithmUsed}
                                                </span>
                                                <span className="capitalize">
                                                    {prediction.predictionPeriod.toLowerCase()}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
