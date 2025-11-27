"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Search, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: {
    id: number;
    name: string;
  } | null;
  walletId?: number;
  walletName?: string;
}

interface Wallet {
  id: number;
  name: string;
}

interface ExpenseRequest {
  description: string;
  amount: number;
  date: string;
  categoryId?: number;
  walletId?: number;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New expense form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState("");
  const [walletId, setWalletId] = useState("");
  
  // Categories & Wallets
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const suggestedCategories = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Other"];

  const fetchExpenses = async () => {
    try {
      const response = await api.get("/expenses?page=0&size=100"); // Fetching first 100 for simplicity
      setExpenses(response.data.content);
    } catch (error) {
      console.error("Failed to fetch expenses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await api.get("/wallets");
      setWallets(response.data);
    } catch (error) {
      console.error("Failed to fetch wallets", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };



  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requestData: ExpenseRequest = {
        description,
        amount: parseFloat(amount),
        date,
      };
      
      if (categoryId) {
        requestData.categoryId = parseInt(categoryId);
      }
      if (walletId) {
        requestData.walletId = parseInt(walletId);
      }
      
      await api.post("/expenses", requestData);
      setIsDialogOpen(false);
      fetchExpenses();
      setDescription("");
      setAmount("");
      setCategoryId("");
      setWalletId("");
      toast.success("Expense added successfully");
    } catch (error) {
      console.error("Failed to add expense", error);
      toast.error("Failed to add expense");
    }
  };

  const handleDeleteExpense = async (id: number) => {
    // Using toast promise for better UX or just simple toast
    // For now simple toast
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(e => e.id !== id));
      toast.success("Expense deleted");
    } catch (error) {
      console.error("Failed to delete expense", error);
      toast.error("Failed to delete expense");
    }
  };

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Expenses</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-primary/20 hover:bg-primary/10 hover:border-primary/40">
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Track your spending with detailed categorization
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddExpense}>
              <div className="grid gap-6 py-4">
                {/* Description */}
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Grocery shopping"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Amount and Date Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Category Dropdown */}
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Suggested Categories */}
                <div className="grid gap-2">
                  <Label className="text-sm text-muted-foreground">Quick Select</Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedCategories.map((catName) => {
                      const matchingCat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
                      return (
                        <Button
                          key={catName}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => matchingCat && setCategoryId(matchingCat.id.toString())}
                        >
                          {catName}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                {/* Wallet Dropdown */}
                <div className="grid gap-2">
                  <Label htmlFor="wallet">Paid From</Label>
                  <select
                    id="wallet"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                  >
                    <option value="">Select Wallet</option>
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Add Expense</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search expenses..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="glass-card border-none">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="h-24 text-center">Loading...</td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Inbox className="h-12 w-12 text-muted-foreground/50 mb-2" />
                        <p className="text-lg font-medium text-muted-foreground">No expenses found</p>
                        <p className="text-sm text-muted-foreground/60">Add a new expense to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <motion.tr 
                      key={expense.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle">{expense.date}</td>
                      <td className="p-4 align-middle font-medium">{expense.description}</td>
                      <td className="p-4 align-middle">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                          {expense.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">৳{expense.amount.toFixed(2)}</td>
                      <td className="p-4 align-middle text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
