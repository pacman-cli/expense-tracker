"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DebtLoansPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the debts page
        router.replace("/debts");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Redirecting to Debts & Loans...</p>
            </div>
        </div>
    );
}
