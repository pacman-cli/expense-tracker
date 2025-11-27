"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Zap,
    Target,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    DollarSign,
    Calendar,
    TrendingDown,
    Lightbulb,
    X,
    CheckCheck,
    RefreshCw,
    Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "sonner";

interface Nudge {
    id: number;
    type: string;
    title: string;
    message: string;
    priority: string;
    isRead: boolean;
    createdAt: string;
    actionUrl: string;
}

interface NudgeStats {
    unreadCount: number;
    totalCount: number;
    readCount: number;
}

export default function NudgesPage() {
    const [nudges, setNudges] = useState<Nudge[]>([]);
    const [stats, setStats] = useState<NudgeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [filterType, setFilterType] = useState<string>("all");

    useEffect(() => {
        fetchNudges();
        fetchStats();
    }, []);

    const fetchNudges = async () => {
        try {
            const res = await api.get("/nudges");
            setNudges(res.data);
        } catch (error: any) {
            console.error("Failed to fetch nudges", error);
            const errorMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to load nudges";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get("/nudges/stats");
            setStats(res.data);
        } catch (error: any) {
            console.error("Failed to fetch stats", error);
            const errorMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to fetch stats";
            toast.error(errorMessage);
        }
    };

    const generateNudges = async () => {
        setGenerating(true);
        try {
            await api.post("/nudges/generate");
            await fetchNudges();
            await fetchStats();
            toast.success("Smart nudges generated successfully!");
        } catch (error: any) {
            console.error("Failed to generate nudges", error);
            const errorMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to generate nudges. Please ensure you have expenses in your account.";
            toast.error(errorMessage);
        } finally {
            setGenerating(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await api.put(`/nudges/${id}/read`);
            await fetchNudges();
            await fetchStats();
        } catch (error: any) {
            console.error("Failed to mark as read", error);
            const errorMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to update nudge";
            toast.error(errorMessage);
        }
    };

    const dismissNudge = async (id: number) => {
        try {
            await api.delete(`/nudges/${id}`);
            await fetchNudges();
            await fetchStats();
            toast.success("Nudge dismissed");
        } catch (error: any) {
            console.error("Failed to dismiss nudge", error);
            const errorMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to dismiss nudge";
            toast.error(errorMessage);
        }
    };

    const getNudgeTypeConfig = (type: string) => {
        const configs: Record<string, any> = {
            BUDGET_ALERT: {
                icon: DollarSign,
                label: "Budget Alert",
                color: "text-red-400",
                bg: "bg-red-500/20",
                border: "border-red-500/30",
                gradient: "from-red-500 to-orange-500",
            },
            UNUSUAL_SPENDING: {
                icon: TrendingUp,
                label: "Unusual Spending",
                color: "text-orange-400",
                bg: "bg-orange-500/20",
                border: "border-orange-500/30",
                gradient: "from-orange-500 to-yellow-500",
            },
            BILL_REMINDER: {
                icon: Calendar,
                label: "Bill Reminder",
                color: "text-blue-400",
                bg: "bg-blue-500/20",
                border: "border-blue-500/30",
                gradient: "from-blue-500 to-cyan-500",
            },
            SAVINGS_OPPORTUNITY: {
                icon: TrendingDown,
                label: "Savings Tip",
                color: "text-green-400",
                bg: "bg-green-500/20",
                border: "border-green-500/30",
                gradient: "from-green-500 to-emerald-500",
            },
            GOAL_PROGRESS: {
                icon: Target,
                label: "Goal Progress",
                color: "text-purple-400",
                bg: "bg-purple-500/20",
                border: "border-purple-500/30",
                gradient: "from-purple-500 to-pink-500",
            },
            SPENDING_INSIGHT: {
                icon: Lightbulb,
                label: "Insight",
                color: "text-yellow-400",
                bg: "bg-yellow-500/20",
                border: "border-yellow-500/30",
                gradient: "from-yellow-500 to-amber-500",
            },
        };
        return configs[type] || configs.SPENDING_INSIGHT;
    };

    const getPriorityBadge = (priority: string) => {
        const configs: Record<string, any> = {
            URGENT: {
                label: "Urgent",
                color: "bg-red-500/20 text-red-400 border-red-500/30",
            },
            HIGH: {
                label: "High",
                color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
            },
            MEDIUM: {
                label: "Medium",
                color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            },
            LOW: {
                label: "Low",
                color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            },
        };
        return configs[priority] || configs.MEDIUM;
    };

    const filteredNudges =
        filterType === "all"
            ? nudges
            : nudges.filter((n) => n.type === filterType);

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
                            <Zap className="h-8 w-8 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                                Smart Nudges
                            </h2>
                            <p className="text-muted-foreground mt-1 flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Personalized financial insights and reminders
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={generateNudges}
                    disabled={generating}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
                >
                    {generating ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Nudges
                        </>
                    )}
                </Button>
            </motion.div>

            {/* Statistics Cards */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid gap-6 sm:grid-cols-3"
                >
                    <Card className="glass-card border-none overflow-hidden group hover:scale-[1.02] transition-transform">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                    <Bell className="h-6 w-6 text-purple-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Total Nudges
                                </p>
                                <h3 className="text-3xl font-bold text-purple-400">
                                    {stats.totalCount}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    All notifications
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none overflow-hidden group hover:scale-[1.02] transition-transform">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                                    <AlertCircle className="h-6 w-6 text-orange-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Unread
                                </p>
                                <h3 className="text-3xl font-bold text-orange-400">
                                    {stats.unreadCount}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Needs attention
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none overflow-hidden group hover:scale-[1.02] transition-transform">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Read
                                </p>
                                <h3 className="text-3xl font-bold text-green-400">
                                    {stats.readCount}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Reviewed
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {[
                    "all",
                    "BUDGET_ALERT",
                    "UNUSUAL_SPENDING",
                    "BILL_REMINDER",
                    "SAVINGS_OPPORTUNITY",
                    "SPENDING_INSIGHT",
                ].map((type) => (
                    <Button
                        key={type}
                        variant={filterType === type ? "default" : "outline"}
                        onClick={() => setFilterType(type)}
                        className={`rounded-xl ${
                            filterType === type
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                : ""
                        }`}
                        size="sm"
                    >
                        {type === "all"
                            ? "All Nudges"
                            : getNudgeTypeConfig(type).label}
                    </Button>
                ))}
            </div>

            {/* Nudges List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <motion.div className="text-center py-20">
                            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
                            <p className="text-sm text-muted-foreground mt-4">
                                Loading nudges...
                            </p>
                        </motion.div>
                    ) : filteredNudges.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <Card className="glass-card border-none">
                                <CardContent className="p-12">
                                    <div className="p-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                        <Zap className="h-12 w-12 text-purple-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        No Nudges Yet
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Click "Generate Nudges" to receive
                                        personalized financial insights
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        filteredNudges.map((nudge, index) => {
                            const typeConfig = getNudgeTypeConfig(nudge.type);
                            const priorityBadge = getPriorityBadge(
                                nudge.priority,
                            );
                            const TypeIcon = typeConfig.icon;

                            return (
                                <motion.div
                                    key={nudge.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                >
                                    <Card
                                        className={`glass-card border-none overflow-hidden relative group hover:shadow-xl transition-all duration-300 ${
                                            !nudge.isRead
                                                ? "border-l-4 " +
                                                  typeConfig.border
                                                : ""
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${typeConfig.gradient} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`}
                                        />

                                        <CardContent className="p-6 relative z-10">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`p-3 rounded-2xl ${typeConfig.bg} shrink-0`}
                                                >
                                                    <TypeIcon
                                                        className={`h-6 w-6 ${typeConfig.color}`}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-bold text-lg">
                                                                    {
                                                                        nudge.title
                                                                    }
                                                                </h3>
                                                                {!nudge.isRead && (
                                                                    <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={`${typeConfig.bg} ${typeConfig.color} border ${typeConfig.border} text-xs`}
                                                                >
                                                                    {
                                                                        typeConfig.label
                                                                    }
                                                                </Badge>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={`${priorityBadge.color} border text-xs`}
                                                                >
                                                                    {
                                                                        priorityBadge.label
                                                                    }
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(
                                                                        nudge.createdAt,
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                                                        {nudge.message}
                                                    </p>

                                                    <div className="flex items-center gap-2">
                                                        {nudge.actionUrl && (
                                                            <Button
                                                                onClick={() =>
                                                                    (window.location.href =
                                                                        nudge.actionUrl)
                                                                }
                                                                size="sm"
                                                                className={`bg-gradient-to-r ${typeConfig.gradient} hover:opacity-90 rounded-lg`}
                                                            >
                                                                Take Action
                                                            </Button>
                                                        )}
                                                        {!nudge.isRead && (
                                                            <Button
                                                                onClick={() =>
                                                                    markAsRead(
                                                                        nudge.id,
                                                                    )
                                                                }
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-lg"
                                                            >
                                                                <CheckCheck className="h-4 w-4 mr-1" />
                                                                Mark Read
                                                            </Button>
                                                        )}
                                                        <Button
                                                            onClick={() =>
                                                                dismissNudge(
                                                                    nudge.id,
                                                                )
                                                            }
                                                            variant="ghost"
                                                            size="icon"
                                                            className="rounded-lg hover:bg-red-500/10 hover:text-red-400"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
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
