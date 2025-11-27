"use client";

import { useEffect, useState } from "react";
import { Plus, Repeat, Calendar, CheckCircle2, XCircle, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";

interface RecurringExpense {
  id: number;
  description: string;
  amount: number;
  frequency: string;
  startDate: string;
  nextDueDate: string;
  active: boolean;
  categoryName: string;
  categoryId: number | null;
}

interface Category {
  id: number;
  name: string;
}

export default function RecurringExpensesPage() {
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);

  // Form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState("");

  const fetchData = async () => {
    try {
      const [expensesRes, categoriesRes] = await Promise.all([
        api.get("/recurring-expenses"),
        api.get("/categories"),
      ]);
      setExpenses(expensesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Failed to fetch recurring data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setFrequency("MONTHLY");
    setStartDate(new Date().toISOString().split('T')[0]);
    setCategoryId("");
    setEditingExpense(null);
  };

  const handleOpenDialog = (expense?: RecurringExpense) => {
    if (expense) {
      setEditingExpense(expense);
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setFrequency(expense.frequency);
      setStartDate(expense.startDate);
      setCategoryId(expense.categoryId ? expense.categoryId.toString() : "");
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        description,
        amount: parseFloat(amount),
        frequency,
        startDate,
        categoryId: categoryId ? parseInt(categoryId) : null,
        active: editingExpense ? editingExpense.active : true,
      };

      if (editingExpense) {
        await api.put(`/recurring-expenses/${editingExpense.id}`, payload);
        toast.success("Recurring expense updated");
      } else {
        await api.post("/recurring-expenses", payload);
        toast.success("Recurring expense created");
      }
      
      setIsDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      console.error("Failed to save recurring expense", error);
      toast.error("Failed to save recurring expense");
    }
  };

  const handleDelete = async () => {
    if (!deletingExpenseId) return;
    
    try {
      await api.delete(`/recurring-expenses/${deletingExpenseId}`);
      toast.success("Recurring expense deleted");
      fetchData();
    } catch (error) {
      console.error("Failed to delete recurring expense", error);
      toast.error("Failed to delete recurring expense");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingExpenseId(null);
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingExpenseId(id);
    setIsDeleteDialogOpen(true);
  };

  const toggleActive = async (expense: RecurringExpense) => {
    try {
      await api.put(`/recurring-expenses/${expense.id}`, {
        description: expense.description,
        amount: expense.amount,
        frequency: expense.frequency,
        startDate: expense.startDate,
        active: !expense.active,
        categoryId: expense.categoryId 
      });
      fetchData();
      toast.success(`Expense ${!expense.active ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Recurring Expenses</h2>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Recurring
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Recurring Expense" : "New Recurring Expense"}</DialogTitle>
            <DialogDescription>
              {editingExpense ? "Update the details of your recurring expense." : "Set up an automatic expense like a subscription or rent."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">
                  Frequency
                </Label>
                <select
                  id="frequency"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <select
                  id="category"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">None</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{editingExpense ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the recurring expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center glass-card rounded-xl border-dashed border-2 border-muted">
            <Repeat className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No recurring expenses</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Set up automatic tracking for subscriptions, rent, and other regular bills.
            </p>
            <Button 
              onClick={() => handleOpenDialog()}
              variant="outline"
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Create First
            </Button>
          </div>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className={`glass-card border-none transition-all duration-300 hover:shadow-lg group ${!expense.active ? 'opacity-70' : ''}`}>
              <CardHeader className="pb-2 relative">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => handleOpenDialog(expense)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    onClick={() => confirmDelete(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between pr-16">
                  <CardTitle className="text-lg font-medium truncate" title={expense.description}>
                    {expense.description}
                  </CardTitle>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${expense.active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  {expense.categoryName || "Uncategorized"} • {expense.frequency}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  ৳{expense.amount.toFixed(2)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                    <Calendar className="mr-2 h-3 w-3" />
                    Next: {new Date(expense.nextDueDate).toLocaleDateString()}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleActive(expense)}
                    className={expense.active ? "text-green-400 hover:text-green-300 hover:bg-green-500/10" : "text-muted-foreground hover:text-foreground"}
                  >
                    {expense.active ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Active</span>
                    ) : (
                      <span className="flex items-center gap-1"><XCircle className="h-4 w-4" /> Paused</span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
