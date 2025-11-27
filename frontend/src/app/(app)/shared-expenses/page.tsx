"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Plus,
    Check,
    Clock,
    TrendingUp,
    TrendingDown,
    Calendar,
    CreditCard,
    Split,
    Percent,
    Hash,
    Trash2,
    CheckCircle2,
    Search,
    BarChart3,
    Sparkles,
    MessageSquare,
    AlertCircle,
    Loader2,
    X,
    DollarSign,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface ApiUser {
    id: number;
    email: string;
    fullName?: string;
}

interface ApiCategory {
    name: string;
}

interface ApiExpenseDetail {
    description: string;
    date: string;
    category?: ApiCategory;
}

interface ApiParticipant {
    id: number;
    user?: ApiUser;
    externalParticipantName?: string;
    externalParticipantEmail?: string;
    shareAmount: number;
    isPaid: boolean;
    paidAt?: string;
    status: "PENDING" | "PAID" | "DISPUTED" | "WAIVED";
}

interface ApiSharedExpense {
    id: number;
    expense?: ApiExpenseDetail;
    description?: string;
    totalAmount: number;
    paidBy: ApiUser;
    splitType: "EQUAL" | "PERCENTAGE" | "EXACT_AMOUNT" | "SHARES";
    isSettled: boolean;
    settledAt?: string;
    groupName?: string;
    createdAt?: string;
    participants?: ApiParticipant[];
}

interface Participant {
    id: number;
    name: string;
    email?: string;
    shareAmount: number;
    isPaid: boolean;
    paidAt?: string;
    status: "PENDING" | "PAID" | "DISPUTED" | "WAIVED";
}

interface SharedExpense {
    id: number;
    title: string;
    totalAmount: number;
    paidBy: {
        id: number;
        name: string;
        email: string;
    };
    splitType: "EQUAL" | "PERCENTAGE" | "EXACT_AMOUNT" | "SHARES";
    isSettled: boolean;
    settledAt?: string;
    groupName?: string;
    date?: string;
    participants: Participant[];
    description?: string;
    category?: string;
}

interface Summary {
    totalYouOwe: number;
    totalOwedToYou: number;
    netBalance: number;
    unsettledExpensesCount: number;
}

export default function SharedExpensesPage() {
    const [activeTab, setActiveTab] = useState<"all" | "you-owe" | "owe-you">(
        "all",
    );
    const [filterGroup, setFilterGroup] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const [sharedExpenses, setSharedExpenses] = useState<SharedExpense[]>([]);
    const [summary, setSummary] = useState<Summary>({
        totalYouOwe: 0,
        totalOwedToYou: 0,
        netBalance: 0,
        unsettledExpensesCount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        console.log("🚀 Shared Expenses Page - Initializing...");
        console.log("Current URL:", window.location.href);
        console.log(
            "localStorage accessToken:",
            localStorage.getItem("accessToken") ? "EXISTS" : "MISSING",
        );

        fetchCurrentUser();
        fetchExpenses();
        fetchSummary();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch("/api/users/me");
            if (response.ok) {
                const user = await response.json();
                setCurrentUserId(user.id);
            }
        } catch (error) {
            console.error("Failed to fetch current user", error);
        }
    };

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("🔍 Fetching shared expenses...");
            console.log("API Base URL:", "http://localhost:8080/api");
            console.log("Token exists:", !!localStorage.getItem("accessToken"));

            const response = await api.get("/shared-expenses");
            console.log("✅ Response received:", response.status);
            const data = response.data as ApiSharedExpense[];
            console.log("📊 Data count:", data.length);
            const mappedData = data.map((item: ApiSharedExpense) => ({
                id: item.id,
                title:
                    item.expense?.description ||
                    item.description ||
                    "Shared Expense",
                totalAmount: item.totalAmount,
                paidBy: {
                    id: item.paidBy.id,
                    name: item.paidBy.fullName || item.paidBy.email,
                    email: item.paidBy.email,
                },
                splitType: item.splitType,
                isSettled: item.isSettled,
                settledAt: item.settledAt,
                groupName: item.groupName,
                date: item.expense?.date || item.createdAt,
                category: item.expense?.category?.name || "Uncategorized",
                description: item.description,
                participants:
                    item.participants?.map((p: ApiParticipant) => ({
                        id: p.id,
                        name: p.user
                            ? p.user.fullName || p.user.email
                            : p.externalParticipantName || "Unknown",
                        email: p.user?.email || p.externalParticipantEmail,
                        shareAmount: p.shareAmount,
                        isPaid: p.isPaid,
                        paidAt: p.paidAt,
                        status: p.status,
                    })) || [],
            }));
            setSharedExpenses(mappedData);
        } catch (error: any) {
            console.error("❌ Failed to fetch shared expenses", error);
            console.error("Error details:", {
                message: error?.message,
                status: error?.response?.status,
                data: error?.response?.data,
                config: error?.config,
            });

            let errorMsg = "Network error: Unable to fetch shared expenses";

            if (error?.response?.status === 401) {
                errorMsg = "Authentication failed. Please log in again.";
                console.error(
                    "🔐 Authentication issue - redirecting to login in 2s",
                );
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            } else if (error?.response?.data?.error) {
                errorMsg = error.response.data.error;
            } else if (error?.message) {
                errorMsg = `Error: ${error.message}`;
            }

            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await api.get("/shared-expenses/summary");
            setSummary(response.data);
        } catch (error: any) {
            console.error("Failed to fetch summary", error);
            toast.error("Failed to fetch summary");
        }
    };

    const handlePayShare = async (expenseId: number, participantId: number) => {
        try {
            setActionLoading(participantId);
            await api.post(
                `/shared-expenses/${expenseId}/participants/${participantId}/pay`,
            );
            await fetchExpenses();
            await fetchSummary();
            toast.success("Payment marked successfully!");
        } catch (error: any) {
            console.error("Failed to pay share", error);
            const errorMsg =
                error?.response?.data?.error || "Failed to mark payment";
            toast.error(errorMsg);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSettleExpense = async (expenseId: number) => {
        if (
            !confirm(
                "Are you sure you want to settle this expense? This will mark all participants as paid.",
            )
        ) {
            return;
        }

        try {
            setActionLoading(expenseId);
            await api.post(`/shared-expenses/${expenseId}/settle`);
            await fetchExpenses();
            await fetchSummary();
            toast.success("Expense settled successfully!");
        } catch (error: any) {
            console.error("Failed to settle expense", error);
            const errorMsg =
                error?.response?.data?.error || "Failed to settle expense";
            toast.error(errorMsg);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteExpense = async (expenseId: number) => {
        if (!confirm("Are you sure you want to delete this shared expense?")) {
            return;
        }

        try {
            setActionLoading(expenseId);
            await api.delete(`/shared-expenses/${expenseId}`);
            await fetchExpenses();
            await fetchSummary();
            toast.success("Expense deleted successfully!");
        } catch (error: any) {
            console.error("Failed to delete expense", error);
            const errorMsg =
                error?.response?.data?.error || "Failed to delete expense";
            toast.error(errorMsg);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredExpenses = sharedExpenses.filter((exp) => {
        const isPaidByMe = currentUserId && exp.paidBy.id === currentUserId;
        const myParticipant = exp.participants.find(
            (p) => p.id === currentUserId,
        );

        // Filter by tab
        if (activeTab === "you-owe") {
            if (isPaidByMe || exp.isSettled) return false;
            if (!myParticipant || myParticipant.isPaid) return false;
        }
        if (activeTab === "owe-you") {
            if (!isPaidByMe || exp.isSettled) return false;
        }

        // Filter by group
        if (filterGroup !== "all" && exp.groupName !== filterGroup)
            return false;

        // Filter by search
        if (
            searchQuery &&
            !exp.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !exp.groupName?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return false;
        }

        return true;
    });

    const groups = Array.from(
        new Set(sharedExpenses.map((exp) => exp.groupName).filter(Boolean)),
    );

    const getSplitTypeIcon = (type: SharedExpense["splitType"]) => {
        switch (type) {
            case "EQUAL":
                return <Split className="w-4 h-4" />;
            case "PERCENTAGE":
                return <Percent className="w-4 h-4" />;
            case "EXACT_AMOUNT":
                return <DollarSign className="w-4 h-4" />;
            case "SHARES":
                return <Hash className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-lg text-muted-foreground">
                        Loading shared expenses...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="flex items-center justify-center gap-3">
                        <div className="relative">
                            <Users className="w-12 h-12 text-indigo-600" />
                            <Sparkles className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <Split className="w-12 h-12 text-purple-600" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Shared Expenses
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Split bills fairly, track who owes what, and settle up
                        with friends easily 🤝
                    </p>
                </motion.div>

                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-500 hover:text-red-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        {
                            label: "You Owe",
                            value: `$${summary.totalYouOwe.toFixed(2)}`,
                            icon: TrendingDown,
                            color: "text-red-600",
                            bgColor: "from-red-500/10 to-orange-500/10",
                            trend: `${sharedExpenses.filter((e) => !e.isSettled && currentUserId && e.paidBy.id !== currentUserId).length} expenses`,
                        },
                        {
                            label: "Owed to You",
                            value: `$${summary.totalOwedToYou.toFixed(2)}`,
                            icon: TrendingUp,
                            color: "text-green-600",
                            bgColor: "from-green-500/10 to-emerald-500/10",
                            trend: `${sharedExpenses.filter((e) => !e.isSettled && currentUserId && e.paidBy.id === currentUserId).length} expenses`,
                        },
                        {
                            label: "Net Balance",
                            value: `${summary.netBalance >= 0 ? "+" : ""}$${summary.netBalance.toFixed(2)}`,
                            icon: BarChart3,
                            color:
                                summary.netBalance >= 0
                                    ? "text-emerald-600"
                                    : "text-orange-600",
                            bgColor:
                                summary.netBalance >= 0
                                    ? "from-emerald-500/10 to-teal-500/10"
                                    : "from-orange-500/10 to-yellow-500/10",
                            trend:
                                summary.netBalance >= 0
                                    ? "Net positive"
                                    : "Net negative",
                        },
                        {
                            label: "Active",
                            value: summary.unsettledExpensesCount,
                            icon: Users,
                            color: "text-indigo-600",
                            bgColor: "from-indigo-500/10 to-blue-500/10",
                            trend: `${sharedExpenses.filter((e) => e.isSettled).length} settled`,
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-3 rounded-xl bg-card shadow-sm">
                                    <stat.icon
                                        className={`w-6 h-6 ${stat.color}`}
                                    />
                                </div>
                            </div>
                            <p className="text-muted-foreground text-sm font-medium mb-1">
                                {stat.label}
                            </p>
                            <p className="text-3xl font-bold mb-1">
                                {stat.value}
                            </p>
                            <p className={`text-sm ${stat.color} font-medium`}>
                                {stat.trend}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs & Actions */}
                <div className="bg-card rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-2">
                            {[
                                {
                                    id: "all",
                                    label: "All Expenses",
                                    icon: Users,
                                },
                                {
                                    id: "you-owe",
                                    label: "You Owe",
                                    icon: TrendingDown,
                                },
                                {
                                    id: "owe-you",
                                    label: "Owed to You",
                                    icon: TrendingUp,
                                },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() =>
                                        setActiveTab(
                                            tab.id as
                                                | "all"
                                                | "you-owe"
                                                | "owe-you",
                                        )
                                    }
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === tab.id ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg" : "bg-muted text-foreground hover:bg-muted/80"}`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <a
                            href="/expenses"
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Expense First
                        </a>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search expenses..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                        <select
                            value={filterGroup}
                            onChange={(e) => setFilterGroup(e.target.value)}
                            className="px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="all">All Groups</option>
                            {groups.map((group) => (
                                <option key={group} value={group}>
                                    {group}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Expenses List */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {filteredExpenses.map((expense, index) => {
                            const paidParticipants =
                                expense.participants.filter(
                                    (p) => p.isPaid,
                                ).length;
                            const totalParticipants =
                                expense.participants.length;
                            const progressPercent =
                                totalParticipants > 0
                                    ? (paidParticipants / totalParticipants) *
                                      100
                                    : 0;
                            const isPaidByMe =
                                currentUserId &&
                                expense.paidBy.id === currentUserId;
                            const myParticipant = expense.participants.find(
                                (p) => p.id === currentUserId,
                            );

                            return (
                                <motion.div
                                    key={expense.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden ${expense.isSettled ? "opacity-75" : ""}`}
                                >
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div
                                                        className={`p-2 rounded-lg ${isPaidByMe ? "bg-green-500/20" : "bg-blue-500/20"}`}
                                                    >
                                                        {isPaidByMe ? (
                                                            <TrendingUp className="w-5 h-5 text-green-400" />
                                                        ) : (
                                                            <TrendingDown className="w-5 h-5 text-blue-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-foreground">
                                                            {expense.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 flex-wrap mt-1">
                                                            {expense.groupName && (
                                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                                                                    {
                                                                        expense.groupName
                                                                    }
                                                                </span>
                                                            )}
                                                            {expense.category && (
                                                                <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
                                                                    {
                                                                        expense.category
                                                                    }
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {expense.date
                                                                    ? new Date(
                                                                          expense.date,
                                                                      ).toLocaleDateString()
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold text-foreground">
                                                    $
                                                    {expense.totalAmount.toFixed(
                                                        2,
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                    {getSplitTypeIcon(
                                                        expense.splitType,
                                                    )}
                                                    {expense.splitType.replace(
                                                        "_",
                                                        " ",
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Paid By Info */}
                                        <div
                                            className={`p-4 rounded-xl mb-4 ${isPaidByMe ? "bg-green-500/10 border border-green-500/30" : "bg-blue-500/10 border border-blue-500/30"}`}
                                        >
                                            <p className="text-sm font-medium text-foreground mb-1">
                                                {isPaidByMe
                                                    ? "You paid this expense"
                                                    : `Paid by ${expense.paidBy.name}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {isPaidByMe
                                                    ? `${expense.participants.filter((p) => !p.isPaid).length} people haven't paid yet`
                                                    : myParticipant?.isPaid
                                                      ? "You have paid your share"
                                                      : `You owe $${myParticipant?.shareAmount.toFixed(2) || "0.00"}`}
                                            </p>
                                        </div>

                                        {/* Payment Progress */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Payment Status
                                                </span>
                                                <span className="text-sm font-bold text-foreground">
                                                    {paidParticipants}/
                                                    {totalParticipants} paid
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${progressPercent}%`,
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        ease: "easeOut",
                                                    }}
                                                    className={`h-2 rounded-full ${expense.isSettled ? "bg-green-500" : progressPercent >= 50 ? "bg-blue-500" : "bg-yellow-500"}`}
                                                />
                                            </div>
                                        </div>

                                        {/* Participants */}
                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Participants (
                                                {expense.participants.length})
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {expense.participants.map(
                                                    (participant) => (
                                                        <div
                                                            key={participant.id}
                                                            className={`flex items-center justify-between p-3 rounded-lg border ${participant.isPaid ? "bg-green-500/10 border-green-500/30" : "bg-muted/50 border-border"}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${participant.isPaid ? "bg-green-500" : "bg-muted"}`}
                                                                >
                                                                    {participant.isPaid ? (
                                                                        <Check className="w-5 h-5 text-white" />
                                                                    ) : (
                                                                        <Clock className="w-5 h-5 text-white" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-semibold text-foreground">
                                                                        {
                                                                            participant.name
                                                                        }
                                                                    </p>
                                                                    {participant.email && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {
                                                                                participant.email
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-bold text-foreground">
                                                                    $
                                                                    {participant.shareAmount.toFixed(
                                                                        2,
                                                                    )}
                                                                </p>
                                                                {participant.isPaid &&
                                                                    participant.paidAt && (
                                                                        <p className="text-xs text-green-600">
                                                                            {new Date(
                                                                                participant.paidAt,
                                                                            ).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {expense.description && (
                                            <div className="bg-muted/50 rounded-lg p-3 mb-4">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    Description
                                                </p>
                                                <p className="text-sm text-foreground">
                                                    {expense.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4 border-t">
                                            {!expense.isSettled && (
                                                <>
                                                    {isPaidByMe ? (
                                                        <button
                                                            onClick={() =>
                                                                handleSettleExpense(
                                                                    expense.id,
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading ===
                                                                expense.id
                                                            }
                                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
                                                        >
                                                            {actionLoading ===
                                                            expense.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            )}
                                                            Settle All
                                                        </button>
                                                    ) : (
                                                        myParticipant &&
                                                        !myParticipant.isPaid && (
                                                            <button
                                                                onClick={() =>
                                                                    handlePayShare(
                                                                        expense.id,
                                                                        myParticipant.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading ===
                                                                    myParticipant.id
                                                                }
                                                                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
                                                            >
                                                                {actionLoading ===
                                                                myParticipant.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <CreditCard className="w-4 h-4" />
                                                                )}
                                                                Pay My Share
                                                            </button>
                                                        )
                                                    )}
                                                </>
                                            )}
                                            {isPaidByMe &&
                                                !expense.isSettled && (
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteExpense(
                                                                expense.id,
                                                            )
                                                        }
                                                        disabled={
                                                            actionLoading ===
                                                            expense.id
                                                        }
                                                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            {expense.isSettled && (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-semibold">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Settled
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {filteredExpenses.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 bg-card rounded-2xl shadow-lg"
                    >
                        <Users className="w-20 h-20 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-muted-foreground">
                            No shared expenses found
                        </h3>
                        <p className="text-muted-foreground/80 mt-2">
                            {activeTab === "you-owe"
                                ? "You don't owe anyone right now!"
                                : activeTab === "owe-you"
                                  ? "No one owes you money!"
                                  : "Start splitting bills with friends!"}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
