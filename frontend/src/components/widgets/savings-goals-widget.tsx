"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, ArrowRight, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  priority: 'high' | 'medium' | 'low';
}

export function SavingsGoalsWidget() {
  const router = useRouter();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("savingsGoals");
    if (saved) {
      const parsedGoals = JSON.parse(saved);
      // Sort by priority (high first) then by progress (highest first)
      const sorted = parsedGoals.sort((a: SavingsGoal, b: SavingsGoal) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        const progressA = (a.currentAmount / a.targetAmount);
        const progressB = (b.currentAmount / b.targetAmount);
        return progressB - progressA;
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoals(sorted.slice(0, 3));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Card className="glass-card border-none h-full">
        <CardHeader>
          <CardTitle>Savings Goals</CardTitle>
          <CardDescription>Loading your goals...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-none h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-500" />
            Savings Goals
          </CardTitle>
          <CardDescription>Track your dreams</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => router.push('/savings-goals')}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6 text-center space-y-3">
            <div className="p-3 bg-emerald-500/10 rounded-full">
              <Trophy className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No goals set yet</p>
              <p className="text-xs text-muted-foreground">Start saving for your future</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-500"
              onClick={() => router.push('/savings-goals')}
            >
              Create Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-muted-foreground">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>৳{goal.currentAmount.toLocaleString()}</span>
                    <span>Target: ৳{goal.targetAmount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
