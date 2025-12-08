"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Wallet,
    CreditCard,
    Banknote,
    Smartphone,
    Plus,
    Trash2,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Building2,
    Eye,
    EyeOff,
    RefreshCw,
    DollarSign,
    PieChart as PieChartIcon,
    Activity,
    Sparkles,
    Edit2,
    MoreVertical,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

interface WalletType {
    id: number;
    name: string;
    type: string;
    balance: number;
    currency: string;
}

export default function WalletsPage() {
    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [balanceVisible, setBalanceVisible] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [type, setType] = useState("CASH");
    const [balance, setBalance] = useState("");

    const fetchWallets = async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) setRefreshing(true);
            const res = await api.get("/wallets");
            setWallets(res.data);
            if (showRefreshToast) toast.success("Wallets refreshed");
        } catch (error: any) {
            console.error("=== WALLET FETCH ERROR ===");
            console.error("Full error:", error);

            const hasAuthToken = localStorage.getItem("accessToken");
            if (!hasAuthToken) {
                toast.error("Please log in first");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
                return;
            }

            if (error.response) {
                if (error.response.status === 401) {
                    toast.error("Session expired. Please log in again");
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 1500);
                } else {
                    toast.error(`Server error: ${error.response.status}`);
                }
            } else if (error.request) {
                toast.error("Cannot connect to backend server on port 8080");
            } else {
                toast.error("Error: " + error.message);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/wallets", {
                name,
                type,
                balance: parseFloat(balance),
                currency: "BDT",
            });
            setIsDialogOpen(false);
            fetchWallets();
            setName("");
            setBalance("");
            setType("CASH");
            toast.success("Wallet created successfully");
        } catch (error) {
            console.error("Failed to create wallet", error);
            toast.error("Failed to create wallet");
        }
    };

    const handleDelete = async (id: number) => {
        if (
            !confirm(
                "Are you sure? This will delete the wallet and its history.",
            )
        )
            return;
        try {
            await api.delete(`/wallets/${id}`);
            fetchWallets();
            toast.success("Wallet deleted");
        } catch (error) {
            console.error("Failed to delete wallet", error);
            toast.error("Failed to delete wallet");
        }
    };

    const getWalletConfig = (walletType: string) => {
        const configs = {
            CASH: {
                icon: Banknote,
                gradient: "from-emerald-500 via-green-500 to-teal-500",
                iconBg: "bg-emerald-500/20",
                iconColor: "text-emerald-400",
                borderColor: "border-emerald-500/30",
                pattern: "💵",
                shadowColor: "shadow-emerald-500/20",
                hoverShadow: "hover:shadow-emerald-500/40",
                bgGlow: "bg-emerald-500/5",
            },
            MOBILE_BANKING: {
                icon: Smartphone,
                gradient: "from-pink-500 via-rose-500 to-fuchsia-500",
                iconBg: "bg-pink-500/20",
                iconColor: "text-pink-400",
                borderColor: "border-pink-500/30",
                pattern: "📱",
                shadowColor: "shadow-pink-500/20",
                hoverShadow: "hover:shadow-pink-500/40",
                bgGlow: "bg-pink-500/5",
            },
            BANK: {
                icon: Building2,
                gradient: "from-blue-500 via-cyan-500 to-indigo-500",
                iconBg: "bg-blue-500/20",
                iconColor: "text-blue-400",
                borderColor: "border-blue-500/30",
                pattern: "🏦",
                shadowColor: "shadow-blue-500/20",
                hoverShadow: "hover:shadow-blue-500/40",
                bgGlow: "bg-blue-500/5",
            },
            CREDIT_CARD: {
                icon: CreditCard,
                gradient: "from-purple-500 via-violet-500 to-indigo-500",
                iconBg: "bg-purple-500/20",
                iconColor: "text-purple-400",
                borderColor: "border-purple-500/30",
                pattern: "💳",
                shadowColor: "shadow-purple-500/20",
                hoverShadow: "hover:shadow-purple-500/40",
                bgGlow: "bg-purple-500/5",
            },
            OTHER: {
                icon: Wallet,
                gradient: "from-orange-500 via-amber-500 to-yellow-500",
                iconBg: "bg-orange-500/20",
                iconColor: "text-orange-400",
                borderColor: "border-orange-500/30",
                pattern: "💰",
                shadowColor: "shadow-orange-500/20",
                hoverShadow: "hover:shadow-orange-500/40",
                bgGlow: "bg-orange-500/5",
            },
        };
        return configs[walletType as keyof typeof configs] || configs.OTHER;
    };

    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
    const highestBalance = Math.max(...wallets.map((w) => w.balance), 0);
    const lowestBalance = Math.min(...wallets.map((w) => w.balance), 0);
    const averageBalance =
        wallets.length > 0 ? totalBalance / wallets.length : 0;

    // Prepare data for pie chart
    const pieData = wallets.map((w) => ({
        name: w.name,
        value: w.balance,
        type: w.type,
    }));

    const COLORS = [
        "#10b981",
        "#ec4899",
        "#3b82f6",
        "#a855f7",
        "#f59e0b",
        "#14b8a6",
        "#f97316",
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
            },
        },
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm">
                            <Wallet className="h-8 w-8 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Wallets & Accounts
                            </h2>
                            <p className="text-muted-foreground mt-1 flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Manage your money across different accounts
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fetchWallets(true)}
                        disabled={refreshing}
                        className="h-10 w-10 rounded-xl border-white/20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                        />
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Add Wallet
                                </span>
                                <span className="sm:hidden">Add</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] glass-card border-white/20">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    Add New Wallet
                                </DialogTitle>
                                <DialogDescription>
                                    Create a new account to track your funds
                                    across different sources.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate}>
                                <div className="grid gap-6 py-6">
                                    <div className="grid gap-3">
                                        <Label
                                            htmlFor="name"
                                            className="text-sm font-semibold"
                                        >
                                            Wallet Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            placeholder="e.g. My Cash, bKash, DBBL Account"
                                            required
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label
                                            htmlFor="type"
                                            className="text-sm font-semibold"
                                        >
                                            Wallet Type
                                        </Label>
                                        <Select
                                            value={type}
                                            onValueChange={setType}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CASH">
                                                    💵 Cash
                                                </SelectItem>
                                                <SelectItem value="BANK">
                                                    🏦 Bank Account
                                                </SelectItem>
                                                <SelectItem value="MOBILE_BANKING">
                                                    📱 Mobile Banking
                                                    (bKash/Nagad)
                                                </SelectItem>
                                                <SelectItem value="CREDIT_CARD">
                                                    💳 Credit Card
                                                </SelectItem>
                                                <SelectItem value="OTHER">
                                                    💰 Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label
                                            htmlFor="balance"
                                            className="text-sm font-semibold"
                                        >
                                            Initial Balance (৳)
                                        </Label>
                                        <Input
                                            id="balance"
                                            type="number"
                                            step="0.01"
                                            value={balance}
                                            onChange={(e) =>
                                                setBalance(e.target.value)
                                            }
                                            placeholder="0.00"
                                            required
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl"
                                    >
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Create Wallet
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            {/* Statistics Section */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
                {/* Total Balance Card */}
                <motion.div variants={itemVariants}>
                    <Card className="glass-card border-none bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                                    <DollarSign className="h-6 w-6 text-indigo-400" />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        setBalanceVisible(!balanceVisible)
                                    }
                                    className="h-8 w-8 rounded-lg hover:bg-white/20"
                                >
                                    {balanceVisible ? (
                                        <Eye className="h-4 w-4" />
                                    ) : (
                                        <EyeOff className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Total Balance
                                </p>
                                <motion.h3
                                    className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                >
                                    {balanceVisible
                                        ? `৳${totalBalance.toLocaleString()}`
                                        : "৳••••••"}
                                </motion.h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Wallet className="h-3 w-3" />
                                    {wallets.length}{" "}
                                    {wallets.length === 1
                                        ? "wallet"
                                        : "wallets"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Highest Balance Card */}
                <motion.div variants={itemVariants}>
                    <Card className="glass-card border-none overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                                    <TrendingUp className="h-6 w-6 text-green-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Highest Balance
                                </p>
                                <h3 className="text-3xl font-bold text-green-400">
                                    {balanceVisible
                                        ? `৳${highestBalance.toLocaleString()}`
                                        : "৳••••••"}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Largest wallet
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Average Balance Card */}
                <motion.div variants={itemVariants}>
                    <Card className="glass-card border-none overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                                    <Activity className="h-6 w-6 text-blue-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Average Balance
                                </p>
                                <h3 className="text-3xl font-bold text-blue-400">
                                    {balanceVisible
                                        ? `৳${averageBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                                        : "৳••••••"}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Per wallet
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Wallet Types Card */}
                <motion.div variants={itemVariants}>
                    <Card className="glass-card border-none overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                    <PieChartIcon className="h-6 w-6 text-purple-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Wallet Types
                                </p>
                                <h3 className="text-3xl font-bold text-purple-400">
                                    {new Set(wallets.map((w) => w.type)).size}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Different types
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Chart Section */}
            {wallets.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="glass-card border-none overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5 text-indigo-400" />
                                    Wallet Distribution
                                </CardTitle>
                                <div className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-white/50 dark:bg-slate-800/50">
                                    Visual Overview
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="flex items-center justify-center">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={280}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }: { name?: string | number; percent?: number }) =>
                                                    `${name ?? ""} (${((percent || 0) * 100).toFixed(0)}%)`
                                                }
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            COLORS[
                                                                index %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor:
                                                        "rgba(0,0,0,0.9)",
                                                    border: "none",
                                                    borderRadius: "12px",
                                                    color: "#fff",
                                                    padding: "12px",
                                                }}
                                                formatter={(value: number) =>
                                                    `৳${value.toLocaleString()}`
                                                }
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-col justify-center space-y-3">
                                    <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
                                        Breakdown
                                    </h4>
                                    {wallets.map((wallet, index) => {
                                        const percentage = (
                                            (wallet.balance / totalBalance) *
                                            100
                                        ).toFixed(1);
                                        return (
                                            <div
                                                key={wallet.id}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all"
                                            >
                                                <div
                                                    className="h-4 w-4 rounded-full flex-shrink-0"
                                                    style={{
                                                        backgroundColor:
                                                            COLORS[
                                                                index %
                                                                    COLORS.length
                                                            ],
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {wallet.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {wallet.type
                                                            .replace("_", " ")
                                                            .toLowerCase()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">
                                                        ৳
                                                        {wallet.balance.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {percentage}%
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Wallets Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">Your Wallets</h3>
                    {wallets.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {wallets.length}{" "}
                            {wallets.length === 1 ? "item" : "items"}
                        </p>
                    )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full flex items-center justify-center py-20"
                            >
                                <div className="text-center space-y-4">
                                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
                                    <p className="text-sm text-muted-foreground">
                                        Loading wallets...
                                    </p>
                                </div>
                            </motion.div>
                        ) : wallets.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="col-span-full"
                            >
                                <Card className="glass-card border-none border-dashed border-2 border-white/20">
                                    <CardContent className="flex flex-col items-center justify-center py-20">
                                        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-6">
                                            <Wallet className="h-16 w-16 text-indigo-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                            No Wallets Yet
                                        </h3>
                                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                                            Create your first wallet to start
                                            tracking your finances across
                                            different accounts
                                        </p>
                                        <Button
                                            onClick={() =>
                                                setIsDialogOpen(true)
                                            }
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />{" "}
                                            Create Your First Wallet
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            wallets.map((wallet, index) => {
                                const config = getWalletConfig(wallet.type);
                                const Icon = config.icon;

                                return (
                                    <motion.div
                                        key={wallet.id}
                                        variants={itemVariants}
                                        layout
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 20,
                                        }}
                                    >
                                        <Card
                                            className={`glass-card border-none ${config.borderColor} border overflow-hidden relative group cursor-pointer transition-all duration-300 ${config.shadowColor} shadow-lg ${config.hoverShadow} hover:shadow-2xl`}
                                        >
                                            {/* Animated Background Gradient */}
                                            <div
                                                className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
                                            />

                                            {/* Pattern Decoration */}
                                            <div className="absolute -top-6 -right-6 text-8xl opacity-5 group-hover:opacity-10 transition-opacity duration-500 group-hover:scale-110">
                                                {config.pattern}
                                            </div>

                                            {/* Glow Effect */}
                                            <div
                                                className={`absolute inset-0 ${config.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
                                            />

                                            <CardHeader className="relative z-10 pb-3 space-y-0">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div
                                                        className={`p-3 rounded-xl ${config.iconBg} ${config.iconColor} shadow-lg ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300`}
                                                    >
                                                        <Icon className="h-7 w-7" />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg font-bold mb-1 line-clamp-1">
                                                        {wallet.name}
                                                    </CardTitle>
                                                    <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50"></span>
                                                        {wallet.type
                                                            .replace("_", " ")
                                                            .toLowerCase()}
                                                    </p>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="relative z-10 space-y-4">
                                                {/* Balance Section */}
                                                <div className="space-y-1">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                                        Balance
                                                    </p>
                                                    <motion.p
                                                        className={`text-3xl font-bold ${config.iconColor}`}
                                                        initial={{ scale: 0.8 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{
                                                            type: "spring",
                                                            delay: index * 0.05,
                                                        }}
                                                    >
                                                        {balanceVisible
                                                            ? `৳${wallet.balance.toLocaleString()}`
                                                            : "৳••••••"}
                                                    </motion.p>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <TrendingUp className="h-3 w-3" />
                                                        <span>
                                                            {(
                                                                (wallet.balance /
                                                                    totalBalance) *
                                                                100
                                                            ).toFixed(1)}
                                                            % of total
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 pt-3 border-t border-white/10 dark:border-slate-700/50">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`flex-1 ${config.iconColor} hover:${config.iconBg} rounded-lg transition-all hover:scale-105`}
                                                    >
                                                        <ArrowUpRight className="h-4 w-4 mr-1" />
                                                        Add
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`flex-1 ${config.iconColor} hover:${config.iconBg} rounded-lg transition-all hover:scale-105`}
                                                    >
                                                        <ArrowDownRight className="h-4 w-4 mr-1" />
                                                        Send
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all hover:scale-105"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(
                                                                wallet.id,
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>

                                            {/* Shine Effect on Hover */}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
