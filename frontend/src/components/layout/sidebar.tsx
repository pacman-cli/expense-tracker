"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Receipt,
    BarChart3,
    Wallet,
    PieChart,
    Repeat,
    Settings,
    BrainCircuit,
    Target,
    TrendingUp,
    Scan,
    Users,
    FileText,
    HandCoins,
    FileSpreadsheet,
    Bell,
    TrendingUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

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
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login");
    };

    const mainItems = sidebarItems.filter((item) => item.category === "main");
    const aiItems = sidebarItems.filter((item) => item.category === "ai");
    const advancedItems = sidebarItems.filter(
        (item) => item.category === "advanced",
    );
    const insightItems = sidebarItems.filter(
        (item) => item.category === "insights",
    );
    const otherItems = sidebarItems.filter((item) => item.category === "other");

    const renderNavSection = (items: typeof sidebarItems, title?: string) => (
        <>
            {title && (
                <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        {title}
                    </h3>
                </div>
            )}
            {items.map((item, index) => {
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={`${item.category}-${index}`}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all relative group",
                            isActive
                                ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-accent-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                        )}
                    >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{item.title}</span>
                        {item.badge && (
                            <span
                                className={cn(
                                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                    item.badge === "AI" &&
                                        "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400",
                                    item.badge === "New" &&
                                        "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400",
                                    item.badge === "Smart" &&
                                        "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400",
                                )}
                            >
                                {item.badge}
                            </span>
                        )}
                        {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
                        )}
                    </Link>
                );
            })}
        </>
    );

    return (
        <div className="flex h-screen w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl">
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
    );
}
