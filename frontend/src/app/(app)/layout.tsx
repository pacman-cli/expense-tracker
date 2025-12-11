"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/");
    };

    // Suppress hydration warnings caused by browser extensions
    useEffect(() => {
        const originalError = console.error;
        console.error = (...args) => {
            if (
                typeof args[0] === "string" &&
                (args[0].includes("Hydration") || args[0].includes("hydration"))
            ) {
                return;
            }
            originalError.apply(console, args);
        };

        return () => {
            console.error = originalError;
        };
    }, []);

    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div
            className="flex min-h-screen bg-background"
            suppressHydrationWarning
        >
            {/* Desktop Sidebar */}
            <div className="hidden md:flex fixed inset-y-0 z-50 w-64 flex-col">
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetContent side="left" className="p-0 border-none w-64 bg-transparent">
                    <Sidebar onNavigate={() => setIsMobileOpen(false)} />
                </SheetContent>
            </Sheet>

            <main className="flex-1 flex flex-col min-h-screen md:pl-64 transition-all duration-300 ease-in-out" suppressHydrationWarning>
                <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b border-border">
                    <div className="flex items-center gap-2 md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            TakaTrack
                        </span>
                    </div>

                    <div className="flex-1 flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
            </main>
            <FloatingActionButton />
        </div>
    );
}
