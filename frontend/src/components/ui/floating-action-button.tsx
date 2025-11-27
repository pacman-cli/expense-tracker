"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Receipt, Wallet, Repeat, X, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<'expense' | 'budget' | 'recurring' | null>(null);
  
  // Expense form state
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseCategory, setExpenseCategory] = useState("");
  
  // Budget form state
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetMonth, setBudgetMonth] = useState(new Date().getMonth() + 1);
  
  // Recurring form state
  const [recurringDescription, setRecurringDescription] = useState("");
  const [recurringAmount, setRecurringAmount] = useState("");
  const [recurringFrequency, setRecurringFrequency] = useState("MONTHLY");
  const [recurringStartDate, setRecurringStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post("/expenses", {
        description: expenseDescription,
        amount: parseFloat(expenseAmount),
        date: expenseDate,
        categoryId: expenseCategory ? parseInt(expenseCategory) : null
      });
      
      toast.success("Expense added successfully!");
      setActiveDialog(null);
      setExpenseDescription("");
      setExpenseAmount("");
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setExpenseCategory("");
      
      // Reload page to show new data
      window.location.reload();
    } catch (error) {
      console.error("Failed to add expense", error);
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const now = new Date();
      await api.post("/budgets", {
        categoryId: parseInt(budgetCategory),
        amount: parseFloat(budgetAmount),
        year: now.getFullYear(),
        month: budgetMonth
      });
      
      toast.success("Budget set successfully!");
      setActiveDialog(null);
      setBudgetCategory("");
      setBudgetAmount("");
      setBudgetMonth(new Date().getMonth() + 1);
      
      window.location.reload();
    } catch (error) {
      console.error("Failed to set budget", error);
      toast.error("Failed to set budget");
    } finally {
      setLoading(false);
    }
  };

  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post("/recurring-expenses", {
        description: recurringDescription,
        amount: parseFloat(recurringAmount),
        frequency: recurringFrequency,
        startDate: recurringStartDate,
        active: true
      });
      
      toast.success("Recurring expense added!");
      setActiveDialog(null);
      setRecurringDescription("");
      setRecurringAmount("");
      setRecurringFrequency("MONTHLY");
      setRecurringStartDate(new Date().toISOString().split('T')[0]);
      
      window.location.reload();
    } catch (error) {
      console.error("Failed to add recurring expense", error);
      toast.error("Failed to add recurring expense");
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      icon: Receipt,
      label: "Add Expense",
      gradient: "from-cyan-400 via-blue-500 to-purple-600",
      shadowColor: "shadow-cyan-500/50",
      onClick: () => {
        setActiveDialog('expense');
        setIsOpen(false);
      },
    },
    {
      icon: Wallet,
      label: "Set Budget",
      gradient: "from-purple-400 via-pink-500 to-red-500",
      shadowColor: "shadow-purple-500/50",
      onClick: () => {
        setActiveDialog('budget');
        setIsOpen(false);
      },
    },
    {
      icon: Repeat,
      label: "Add Recurring",
      gradient: "from-green-400 via-emerald-500 to-teal-600",
      shadowColor: "shadow-green-500/50",
      onClick: () => {
        setActiveDialog('recurring');
        setIsOpen(false);
      },
    },
  ];

  return (
    <>
      {/* Add Expense Dialog */}
      <Dialog open={activeDialog === 'expense'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Quick Expense</DialogTitle>
            <DialogDescription>Add a new expense quickly from anywhere</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleExpenseSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Groceries"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (৳)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <select
                  id="category"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  <option value="1">Food</option>
                  <option value="2">Transport</option>
                  <option value="3">Shopping</option>
                  <option value="4">Entertainment</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Adding..." : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set Budget Dialog */}
      <Dialog open={activeDialog === 'budget'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Set Quick Budget</DialogTitle>
            <DialogDescription>Set a spending limit for a category</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBudgetSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="budget-category">Category</Label>
                <select
                  id="budget-category"
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select category</option>
                  <option value="1">Food</option>
                  <option value="2">Transport</option>
                  <option value="3">Shopping</option>
                  <option value="4">Entertainment</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="budget-amount">Amount (৳)</Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    step="0.01"
                    placeholder="5000"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budget-month">Month</Label>
                  <select
                    id="budget-month"
                    value={budgetMonth}
                    onChange={(e) => setBudgetMonth(parseInt(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Setting..." : "Set Budget"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Recurring Dialog */}
      <Dialog open={activeDialog === 'recurring'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Recurring Expense</DialogTitle>
            <DialogDescription>Set up automatic recurring expenses</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecurringSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="recurring-description">Description</Label>
                <Input
                  id="recurring-description"
                  placeholder="e.g., Netflix Subscription"
                  value={recurringDescription}
                  onChange={(e) => setRecurringDescription(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="recurring-amount">Amount (৳)</Label>
                  <Input
                    id="recurring-amount"
                    type="number"
                    step="0.01"
                    placeholder="99.00"
                    value={recurringAmount}
                    onChange={(e) => setRecurringAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <select
                    id="frequency"
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={recurringStartDate}
                  onChange={(e) => setRecurringStartDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Adding..." : "Add Recurring"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Background overlay when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-24 right-0 flex flex-col gap-4"
            >
              {actions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ scale: 0, x: 20, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    x: 0,
                    opacity: 1,
                    transition: { 
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: index * 0.08
                    }
                  }}
                  exit={{ 
                    scale: 0, 
                    x: 20,
                    opacity: 0,
                    transition: { delay: (actions.length - index - 1) * 0.05 }
                  }}
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.onClick}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Label */}
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      className="glass-card border-none px-4 py-2 rounded-full overflow-hidden"
                    >
                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                        {action.label}
                      </span>
                    </motion.div>

                    {/* Icon button */}
                    <div className={`relative p-4 rounded-full bg-gradient-to-br ${action.gradient} shadow-lg ${action.shadowColor} group-hover:shadow-xl transition-all`}>
                      <action.icon className="h-6 w-6 text-white relative z-10" />
                      
                      {/* Rotating gradient border effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: `conic-gradient(from 0deg, transparent, white, transparent)`,
                          filter: "blur(8px)",
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.div className="relative">
          {/* Pulsing rings */}
          {!isOpen && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 opacity-75"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.75, 0, 0.75],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-50"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  delay: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}

          {/* Main button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 shadow-2xl flex items-center justify-center overflow-hidden group"
            style={{
              boxShadow: isOpen 
                ? "0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(14, 165, 233, 0.4)"
                : "0 0 30px rgba(139, 92, 246, 0.5), 0 0 50px rgba(14, 165, 233, 0.3)",
            }}
          >
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Sparkle effect */}
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="absolute top-2 right-2 h-4 w-4 text-white/80" />
              <Sparkles className="absolute bottom-3 left-3 h-3 w-3 text-white/60" />
            </motion.div>

            {/* Icon */}
            <motion.div
              animate={{ rotate: isOpen ? 135 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative z-10"
            >
              <Plus className="h-8 w-8 text-white drop-shadow-lg" strokeWidth={3} />
            </motion.div>

            {/* Ripple effect on click */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white"
              initial={{ scale: 0, opacity: 0.5 }}
              animate={isOpen ? { scale: 2, opacity: 0 } : {}}
              transition={{ duration: 0.5 }}
            />
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}

