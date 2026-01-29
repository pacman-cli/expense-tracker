"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { isAxiosError } from "axios"
import { motion } from "framer-motion"
import { Inbox, Plus, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Expense {
  id: number
  description: string
  amount: number
  date: string
  category: {
    id: number
    name: string
  } | null
  walletId?: number
  walletName?: string
}

interface Wallet {
  id: number
  name: string
}

interface ExpenseRequest {
  description: string
  amount: number
  date: string
  categoryId?: number
  walletId?: number
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentExpenseId, setCurrentExpenseId] = useState<number | null>(null)

  // New/Edit expense form state
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [categoryId, setCategoryId] = useState("")
  const [walletId, setWalletId] = useState("")

  // Categories & Wallets
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string }>
  >([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const suggestedCategories = [
    "Food",
    "Transport",
    "Shopping",
    "Entertainment",
    "Bills",
    "Other",
  ]

  const fetchExpenses = async () => {
    try {
      const response = await api.get("/expenses?page=0&size=100") // Fetching first 100 for simplicity
      setExpenses(response.data.content)
    } catch (error) {
      console.error("Failed to fetch expenses", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
    fetchWallets()
  }, [])

  const fetchWallets = async () => {
    try {
      const response = await api.get("/wallets")
      setWallets(response.data)
    } catch (error: unknown) {
      console.error("Failed to fetch wallets", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories")
      setCategories(response.data)
    } catch (error: unknown) {
      console.error("Failed to fetch categories", error)
    }
  }

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const requestData: ExpenseRequest = {
        description,
        amount: parseFloat(amount),
        date,
      }

      if (categoryId) {
        requestData.categoryId = parseInt(categoryId)
      }
      if (walletId) {
        requestData.walletId = parseInt(walletId)
      }

      if (isEditMode && currentExpenseId) {
        await api.put(`/expenses/${currentExpenseId}`, requestData)
        toast.success("Expense updated successfully")
      } else {
        await api.post("/expenses", requestData)
        toast.success("Expense added successfully")
      }

      setIsDialogOpen(false)
      fetchExpenses()
      resetForm()
    } catch (error) {
      console.error("Failed to save expense", error)
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to save expense"
        : "An unexpected error occurred"
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setDescription("")
    setAmount("")
    setDate(new Date().toISOString().split("T")[0])
    setCategoryId("")
    setWalletId("")
    setIsEditMode(false)
    setCurrentExpenseId(null)
  }

  const handleEditExpense = (expense: Expense) => {
    setDescription(expense.description)
    setAmount(expense.amount.toString())
    setDate(expense.date)
    setCategoryId(expense.category?.id?.toString() || "")
    setWalletId(expense.walletId?.toString() || "")
    setIsEditMode(true)
    setCurrentExpenseId(expense.id)
    setIsDialogOpen(true)
  }

  const handleDeleteExpense = async (id: number) => {
    // Using toast promise for better UX or just simple toast
    // For now simple toast
    try {
      await api.delete(`/expenses/${id}`)
      setExpenses(expenses.filter((e) => e.id !== id))
      toast.success("Expense deleted")
    } catch (error) {
      console.error("Failed to delete expense", error)
      toast.error("Failed to delete expense")
    }
  }

  const filteredExpenses = expenses.filter((expense) =>
    expense.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Expenses
        </h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open: boolean) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-primary/20 hover:bg-primary/10 hover:border-primary/40"
              onClick={() => {
                setIsEditMode(false)
                resetForm()
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Expense" : "Add New Expense"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update your expense details"
                  : "Track your spending with detailed categorization"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveExpense}>
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
                  <Label className="text-sm text-muted-foreground">
                    Quick Select
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedCategories.map((catName) => {
                      const matchingCat = categories.find(
                        (c) => c.name.toLowerCase() === catName.toLowerCase()
                      )
                      return (
                        <Button
                          key={catName}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() =>
                            matchingCat &&
                            setCategoryId(matchingCat.id.toString())
                          }
                        >
                          {catName}
                        </Button>
                      )
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
                <Button type="submit" className="w-full">
                  {isEditMode ? "Update Expense" : "Add Expense"}
                </Button>
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

      <Card className="glass-card border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b border-white/10 transition-colors hover:bg-white/5">
                  <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground/70 tracking-wider uppercase text-[10px]">
                    Date
                  </th>
                  <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground/70 tracking-wider uppercase text-[10px]">
                    Description
                  </th>
                  <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground/70 tracking-wider uppercase text-[10px]">
                    Category
                  </th>
                  <th className="h-12 px-6 text-right align-middle font-semibold text-muted-foreground/70 tracking-wider uppercase text-[10px]">
                    Amount
                  </th>
                  <th className="h-12 px-6 text-right align-middle font-semibold text-muted-foreground/70 tracking-wider uppercase text-[10px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Plus className="h-8 w-8 text-primary/40" />
                        </motion.div>
                        <span>Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-64 text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-10 text-center"
                      >
                        <div className="p-4 rounded-full bg-white/5 mb-4">
                          <Inbox className="h-12 w-12 text-muted-foreground/20" />
                        </div>
                        <p className="text-xl font-semibold text-foreground">
                          No expenses found
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-[250px] mx-auto">
                          Try adjusting your search or add a new transaction to get started.
                        </p>
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense, index) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group border-b border-white/5 transition-colors hover:bg-white/5 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4 align-middle text-muted-foreground">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {expense.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className={cn(
                          "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-all",
                          expense.category
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted text-muted-foreground border-transparent"
                        )}>
                          {expense.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-right">
                        <span className="font-bold text-lg">
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditExpense(expense)}
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
  )
}
