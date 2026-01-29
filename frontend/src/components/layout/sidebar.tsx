"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
    BarChart3,
    Bell,
    BrainCircuit,
    FileSpreadsheet,
    FileText,
    HandCoins,
    LayoutDashboard,
    PieChart,
    Receipt,
    Repeat,
    Scan,
    Settings,
    Target,
    TrendingUp,
    TrendingUpDown,
    Users,
    Wallet,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        category: "main",
    },
    {
        title: "Expenses",
        href: "/expenses",
        icon: Receipt,
        category: "main",
    },
    {
        title: "Income",
        href: "/income",
        icon: TrendingUp,
        category: "main",
    },
    {
        title: "Wallets",
        href: "/wallets",
        icon: Wallet,
        category: "main",
    },
    {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        category: "main",
    },
    {
        title: "Budgets",
        href: "/budgets",
        icon: PieChart,
        category: "main",
    },
    {
        title: "Recurring",
        href: "/recurring",
        icon: Repeat,
        category: "main",
    },
    {
        title: "AI Insights",
        href: "/ai-insights",
        icon: BrainCircuit,
        category: "ai",
    },
    {
        title: "AI Predictions",
        href: "/ai-predictions",
        icon: TrendingUpDown,
        category: "ai",
        badge: "AI",
    },
    {
        title: "Receipt OCR",
        href: "/receipt-ocr",
        icon: Scan,
        category: "advanced",
        badge: "New",
    },
    {
        title: "Shared Expenses",
        href: "/shared-expenses",
        icon: Users,
        category: "advanced",
    },
    {
        title: "Debt & Loans",
        href: "/debt-loans",
        icon: HandCoins,
        category: "advanced",
    },
    {
        title: "Tax Export",
        href: "/tax-export",
        icon: FileSpreadsheet,
        category: "advanced",
    },
    {
        title: "Nudge Engine",
        href: "/nudges",
        icon: Bell,
        category: "ai",
        badge: "Smart",
    },
    {
        title: "Lifestyle Reports",
        href: "/lifestyle-reports",
        icon: FileText,
        category: "insights",
    },
    {
        title: "Savings Goals",
        href: "/savings-goals",
        icon: Target,
        category: "insights",
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        category: "other",
    },
]

interface SidebarProps {
    className?: string
    onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        router.push("/login")
    }

    const mainItems = sidebarItems.filter((item) => item.category === "main")
    const aiItems = sidebarItems.filter((item) => item.category === "ai")
    const advancedItems = sidebarItems.filter(
        (item) => item.category === "advanced",
    )
    const insightItems = sidebarItems.filter(
        (item) => item.category === "insights",
    )
    const otherItems = sidebarItems.filter((item) => item.category === "other")

    const renderNavSection = (items: typeof sidebarItems, title?: string) => (
        <div className="space-y-1">
            {title && (
                <div className="px-3 py-2 mt-4 first:mt-0">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
                        {title}
                    </h3>
                </div>
            )}
            {items.map((item) => {
                const isActive = pathname === item.href

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative group overflow-hidden",
                            isActive
                                ? "text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-slate-800/50",
                        )}
                    >
                        {/* Hover/Active Background Animation */}
                        {isActive && (
                            <motion.div
                                layoutId="sidebar-active"
                                className="absolute inset-0 bg-primary/10 dark:bg-primary/5 border-r-2 border-primary z-0"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}

                        <div className="relative z-10 flex items-center gap-3 w-full">
                            <motion.div
                                whileHover={{ rotate: 5, scale: 1.1 }}
                                className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    isActive ? "bg-primary/20 text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                            </motion.div>
                            <span className="flex-1 font-medium truncate">{item.title}</span>

                            {item.badge && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm",
                                        item.badge === "AI" &&
                                        "bg-purple-500/10 text-purple-500 border-purple-500/20",
                                        item.badge === "New" &&
                                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                                        item.badge === "Smart" &&
                                        "bg-blue-500/10 text-blue-500 border-blue-500/20",
                                    )}
                                >
                                    {item.badge}
                                </motion.span>
                            )}
                        </div>
                    </Link>
                )
            })}
        </div>
    )

    return (
        <div className={cn("flex h-screen w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl", className)}>
            <div className="flex h-16 items-center border-b border-border px-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                    <Wallet className="h-5 w-5 text-indigo-400" />
                </div>
                <span className="ml-3 text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    TakaTrack
                </span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {renderNavSection(mainItems)}

                    <div className="my-2 border-t border-border/50" />
                    {renderNavSection(aiItems, "AI Powered")}

                    <div className="my-2 border-t border-border/50" />
                    {renderNavSection(advancedItems, "Advanced")}

                    <div className="my-2 border-t border-border/50" />
                    {renderNavSection(insightItems, "Insights")}

                    <div className="my-2 border-t border-border/50" />
                    {renderNavSection(otherItems)}
                </nav>
            </div>
            <div className="border-t border-border p-4">
                <div className="flex items-center justify-center">
                    <ThemeToggle />
                </div>
            </div>
        </div>
    )
}
