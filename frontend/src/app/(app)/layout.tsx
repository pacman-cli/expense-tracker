"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login");
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

    return (
        <div
            className="flex min-h-screen bg-background"
            suppressHydrationWarning
        >
            <Sidebar />
            <main className="flex-1 overflow-y-auto" suppressHydrationWarning>
                <div className="sticky top-0 z-10 flex justify-end p-4 bg-background/80 backdrop-blur-sm border-b border-border">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
                <div className="p-8">{children}</div>
            </main>
            <FloatingActionButton />
        </div>
    );
}
