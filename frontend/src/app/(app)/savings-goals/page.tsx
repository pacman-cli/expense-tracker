"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, TrendingUp, Calendar, DollarSign, Edit, Trash2, Trophy, Star, Medal, Award, Wallet, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

interface ContributionHistory {
  date: string;
  amount: number;
}

interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  contributions: ContributionHistory[];
  createdAt: string;
}

const goalTemplates = [
  { name: "Emergency Fund", target: 50000, category: "Safety", icon: "🛡️" },
  { name: "Vacation Fund", target: 30000, category: "Travel", icon: "✈️" },
  { name: "New Car", target: 200000, category: "Vehicle", icon: "🚗" },
  { name: "Wedding", target: 150000, category: "Life Event", icon: "💍" },
  { name: "Education", target: 100000, category: "Education", icon: "🎓" },
  { name: "Home Down Payment", target: 500000, category: "Home", icon: "🏠" },
];

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [contributeAmount, setContributeAmount] = useState("");

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("savingsGoals");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoals(JSON.parse(saved));
    } else {
      // Demo data with all new fields
      setGoals([
        {
          id: 1,
          name: "Emergency Fund",
          targetAmount: 50000,
          currentAmount: 32500,
          deadline: "2025-12-31",
          category: "Safety",
          priority: 'high',
          contributions: [
            { date: "2025-01-15", amount: 10000 },
            { date: "2025-02-10", amount: 12500 },
            { date: "2025-03-20", amount: 10000 }
          ],
          createdAt: "2025-01-01"
        },
        {
          id: 2,
          name: "Vacation to Bali",
          targetAmount: 30000,
          currentAmount: 18000,
          deadline: "2025-06-30",
          category: "Travel",
          priority: 'medium',
          contributions: [
            { date: "2025-01-20", amount: 8000 },
            { date: "2025-02-25", amount: 10000 }
          ],
          createdAt: "2025-01-10"
        }
      ]);
    }
  }, []);

  const saveGoals = (newGoals: SavingsGoal[]) => {
    setGoals(newGoals);
    localStorage.setItem("savingsGoals", JSON.stringify(newGoals));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal: SavingsGoal = {
      id: new Date().getTime(),
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline,
      category,
      priority,
      contributions: currentAmount !== "0" ? [{ date: new Date().toISOString().split('T')[0], amount: parseFloat(currentAmount) }] : [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    saveGoals([...goals, newGoal]);
    setIsDialogOpen(false);
    resetForm();
    toast.success("Savings goal created!");
  };

  const handleEditGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    const updatedGoals = goals.map(g => 
      g.id === selectedGoal.id 
        ? { ...g, name, targetAmount: parseFloat(targetAmount), deadline, category, priority }
        : g
    );
    
    saveGoals(updatedGoals);
    setIsEditDialogOpen(false);
    setSelectedGoal(null);
    resetForm();
    toast.success("Goal updated!");
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    const amount = parseFloat(contributeAmount);
    const updatedGoals = goals.map(g => 
      g.id === selectedGoal.id 
        ? { 
            ...g, 
            currentAmount: g.currentAmount + amount,
            contributions: [...g.contributions, { date: new Date().toISOString().split('T')[0], amount }]
          }
        : g
    );
    
    saveGoals(updatedGoals);
    setIsContributeDialogOpen(false);
    setSelectedGoal(null);
    setContributeAmount("");
    toast.success(`Added ৳${amount} to ${selectedGoal.name}!`);
  };

  const handleDeleteGoal = (id: number) => {
    saveGoals(goals.filter(g => g.id !== id));
    toast.success("Goal deleted");
  };

  const handleUseTemplate = (template: typeof goalTemplates[0]) => {
    setName(template.name);
    setTargetAmount(template.target.toString());
    setCategory(template.category);
    setIsDialogOpen(true);
  };

  const openEditDialog = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setDeadline(goal.deadline);
    setCategory(goal.category);
    setPriority(goal.priority);
    setIsEditDialogOpen(true);
  };

  const openContributeDialog = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsContributeDialogOpen(true);
  };

  const resetForm = () => {
    setName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setDeadline("");
    setCategory("General");
    setPriority('medium');
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const target = new Date(deadline);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getMonthlyTarget = (current: number, target: number, deadline: string) => {
    const remaining = target - current;
    const days = getDaysRemaining(deadline);
    const months = days / 30;
    return months > 0 ? (remaining / months).toFixed(0) : "0";
  };

  const getMilestones = (progress: number) => {
    const milestones = [
      { percent: 25, label: "Started!", icon: Star, color: "text-yellow-400" },
      { percent: 50, label: "Halfway!", icon: Medal, color: "text-blue-400" },
      { percent: 75, label: "Almost there!", icon: Award, color: "text-purple-400" },
      { percent: 100, label: "Achieved!", icon: Trophy, color: "text-green-400" }
    ];
    
    return milestones.filter(m => progress >= m.percent);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  // Sort goals by priority and progress
  const sortedGoals = [...goals].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Savings Goals
          </h2>
          <p className="text-muted-foreground">Track your financial goals and make progress towards your dreams</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsDialogOpen(true); }}
          variant="outline" 
          className="border-primary/20 hover:bg-primary/10 hover:border-primary/40"
        >
          <Plus className="mr-2 h-4 w-4" /> New Goal
        </Button>
      </div>

      {/* Goal Templates */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Quick Start Templates
          </CardTitle>
          <CardDescription>Choose a template to start saving faster</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {goalTemplates.map((template, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleUseTemplate(template)}
                className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-center transition-all border border-slate-600/50"
              >
                <div className="text-3xl mb-2">{template.icon}</div>
                <div className="text-sm font-semibold mb-1">{template.name}</div>
                <div className="text-xs text-muted-foreground">৳{template.target.toLocaleString()}</div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals Grid */}
      {sortedGoals.length === 0 ? (
        <Card className="glass-card border-none">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Savings Goals Yet</h3>
            <p className="text-muted-foreground mb-4">Start tracking your financial goals today!</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sortedGoals.map((goal, index) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysLeft = getDaysRemaining(goal.deadline);
            const monthlyNeeded = getMonthlyTarget(goal.currentAmount, goal.targetAmount, goal.deadline);
            const isComplete = progress >= 100;
            const milestones = getMilestones(progress);
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card border-none overflow-hidden relative group">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/10 dark:to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="pb-3 relative z-10">
                    {/* Priority badge - repositioned to header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <Badge variant="outline" className={`${getPriorityColor(goal.priority)} whitespace-nowrap`}>
                        <span className="mr-1">{getPriorityIcon(goal.priority)}</span>
                        <span className="capitalize font-semibold">{goal.priority}</span>
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(goal)}
                          className="h-8 w-8 p-0 hover:bg-indigo-500/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="h-8 w-8 p-0 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Goal title and icon */}
                    <div className="flex items-center gap-3">
                      {isComplete ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", duration: 0.6 }}
                          className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50"
                        >
                          <Trophy className="h-6 w-6 text-white" />
                        </motion.div>
                      ) : (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent truncate">
                          {goal.name}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium">{goal.category}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 relative z-10">
                    {/* Circular Progress with Center Stats */}
                    <div className="flex items-center gap-6">
                      {/* Circular Progress */}
                      <div className="relative w-28 h-28 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r="50"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-muted/20 dark:text-muted/10"
                          />
                          <motion.circle
                            cx="56"
                            cy="56"
                            r="50"
                            fill="none"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="text-gradient-to-r from-indigo-500 to-purple-500"
                            stroke="url(#gradient-${goal.id})"
                            strokeDasharray={`${2 * Math.PI * 50}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - progress / 100) }}
                            transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                          />
                          <defs>
                            <linearGradient id={`gradient-${goal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Amount Display */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Current Amount</div>
                          <div className="text-2xl font-bold text-foreground">৳{goal.currentAmount.toLocaleString()}</div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Target Amount</div>
                          <div className="text-xl font-semibold text-muted-foreground">৳{goal.targetAmount.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Milestones */}
                    {milestones.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {milestones.map((milestone, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
                          >
                            <Badge 
                              variant="outline" 
                              className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border-indigo-500/20 backdrop-blur-sm"
                            >
                              <milestone.icon className={`h-3.5 w-3.5 mr-1.5 ${milestone.color}`} />
                              <span className="font-medium">{milestone.label}</span>
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-indigo-400" />
                        <div>
                          <div className="text-xs text-muted-foreground">Days Left</div>
                          <div className="font-semibold">{daysLeft > 0 ? daysLeft : 0}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-cyan-400" />
                        <div>
                          <div className="text-xs text-muted-foreground">Per Month</div>
                          <div className="font-semibold">৳{monthlyNeeded}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-yellow-400" />
                        <div>
                          <div className="text-xs text-muted-foreground">Remaining</div>
                          <div className="font-semibold">৳{remaining.toFixed(0)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Contribution Button */}
                    {!isComplete && (
                      <Button 
                        onClick={() => openContributeDialog(goal)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Add Money
                      </Button>
                    )}

                    {/* Last Contribution */}
                    {goal.contributions.length > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last: ৳{goal.contributions[goal.contributions.length - 1].amount.toLocaleString()} on{' '}
                        {new Date(goal.contributions[goal.contributions.length - 1].date).toLocaleDateString()}
                      </div>
                    )}

                    {/* Achievement Status */}
                    {isComplete && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">Goal Achieved! 🎉</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Savings Goal</DialogTitle>
            <DialogDescription>
              Set a new financial goal and track your progress
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddGoal}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Emergency Fund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="target">Target Amount (৳)</Label>
                  <Input
                    id="target"
                    type="number"
                    step="0.01"
                    placeholder="10000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="current">Current Amount (৳)</Label>
                  <Input
                    id="current"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🔵 Low</option>
                  </select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>General</option>
                  <option>Travel</option>
                  <option>Safety</option>
                  <option>Education</option>
                  <option>Home</option>
                  <option>Vehicle</option>
                  <option>Life Event</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Create Goal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>Update your goal details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditGoal}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Goal Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-target">Target Amount (৳)</Label>
                <Input
                  id="edit-target"
                  type="number"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-deadline">Deadline</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <select
                    id="edit-priority"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🔵 Low</option>
                  </select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>General</option>
                  <option>Travel</option>
                  <option>Safety</option>
                  <option>Education</option>
                  <option>Home</option>
                  <option>Vehicle</option>
                  <option>Life Event</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Update Goal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribute Money Dialog */}
      <Dialog open={isContributeDialogOpen} onOpenChange={setIsContributeDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Money to Goal</DialogTitle>
            <DialogDescription>
              Contribute to: {selectedGoal?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContribute}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="contribute-amount">Amount (৳)</Label>
                <Input
                  id="contribute-amount"
                  type="number"
                  step="0.01"
                  placeholder="1000"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              
              {selectedGoal && (
                <div className="bg-slate-800/50 p-3 rounded-lg space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current:</span>
                    <span className="font-semibold">৳{selectedGoal.currentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-semibold">৳{selectedGoal.targetAmount.toLocaleString()}</span>
                  </div>
                  {contributeAmount && (
                    <div className="flex justify-between text-green-400 pt-2 border-t border-slate-700">
                      <span>New Total:</span>
                      <span className="font-bold">৳{(selectedGoal.currentAmount + parseFloat(contributeAmount)).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                <Wallet className="mr-2 h-4 w-4" />
                Add Money
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
