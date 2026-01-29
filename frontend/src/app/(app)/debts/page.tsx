"use client";

import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CreditCard,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Wallet,
  User,
  FileText,
  Activity,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

interface Debt {
  id: number;
  title: string;
  type: "BORROWED" | "LENT";
  principalAmount: number;
  remainingAmount: number;
  interestRate: number;
  creditorDebtor: string;
  contactInfo?: string;
  startDate: string;
  dueDate?: string;
  status: "ACTIVE" | "PAID_OFF" | "OVERDUE" | "PARTIALLY_PAID";
  paymentFrequency?: string;
  installmentAmount?: number;
  isRecurring: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  notes?: string;
}

interface Stats {
  totalBorrowed: number;
  totalLent: number;
  netDebt: number;
  activeCount: number;
  paidOffCount: number;
}

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    if (data?.message || data?.error) {
      return data.message ?? data.error ?? fallback;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default function DebtsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "borrowed" | "lent">(
    "all"
  );
  const [debts, setDebts] = useState<Debt[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    type: "BORROWED" as "BORROWED" | "LENT",
    principalAmount: "",
    interestRate: "0",
    creditorDebtor: "",
    contactInfo: "",
    startDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentFrequency: "MONTHLY",
    installmentAmount: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  });

  const [payment, setPayment] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "BANK_TRANSFER",
    notes: "",
  });

  useEffect(() => {
    fetchDebts();
    fetchStats();
  }, []);

  const fetchDebts = async () => {
    try {
      const res = await api.get("/debts");
      setDebts(res.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load debts"));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/debts/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
      toast.error(getErrorMessage(error, "Failed to fetch debt stats"));
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        principalAmount: parseFloat(formData.principalAmount),
        interestRate: parseFloat(formData.interestRate),
        installmentAmount: formData.installmentAmount
          ? parseFloat(formData.installmentAmount)
          : null,
        isRecurring: !!formData.installmentAmount,
      };

      if (isEditing && selectedDebt) {
        await api.put(`/debts/${selectedDebt.id}`, payload);
        toast.success("Debt updated successfully");
      } else {
        await api.post("/debts", payload);
        toast.success("Debt added successfully");
      }

      setShowAddModal(false);
      reset();
      fetchDebts();
      fetchStats();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save debt"));
    }
  };

  const handlePayment = async () => {
    if (!selectedDebt) return;
    try {
      await api.post(`/debts/${selectedDebt.id}/payments`, {
        amount: parseFloat(payment.amount),
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        notes: payment.notes,
      });
      toast.success("Payment recorded successfully");
      setShowPaymentModal(false);
      setPayment({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "BANK_TRANSFER",
        notes: "",
      });
      fetchDebts();
      fetchStats();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to record payment"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this debt?")) return;
    try {
      await api.delete(`/debts/${id}`);
      toast.success("Debt deleted successfully");
      fetchDebts();
      fetchStats();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete debt"));
    }
  };

  const handleEdit = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsEditing(true);
    setFormData({
      title: debt.title,
      type: debt.type,
      principalAmount: debt.principalAmount.toString(),
      interestRate: debt.interestRate.toString(),
      creditorDebtor: debt.creditorDebtor,
      contactInfo: debt.contactInfo || "",
      startDate: debt.startDate,
      dueDate: debt.dueDate || "",
      paymentFrequency: debt.paymentFrequency || "MONTHLY",
      installmentAmount: debt.installmentAmount?.toString() || "",
      priority: debt.priority,
    });
    setShowAddModal(true);
  };

  const reset = () => {
    setFormData({
      title: "",
      type: "BORROWED",
      principalAmount: "",
      interestRate: "0",
      creditorDebtor: "",
      contactInfo: "",
      startDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      paymentFrequency: "MONTHLY",
      installmentAmount: "",
      priority: "MEDIUM",
    });
    setIsEditing(false);
    setSelectedDebt(null);
  };

  const filteredDebts = debts.filter((debt) => {
    if (activeTab === "borrowed") return debt.type === "BORROWED";
    if (activeTab === "lent") return debt.type === "LENT";
    return true;
  });

  const getStatusColor = (status: Debt["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-blue-100 text-blue-700";
      case "PAID_OFF":
        return "bg-green-100 text-green-700";
      case "OVERDUE":
        return "bg-red-100 text-red-700";
      case "PARTIALLY_PAID":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: Debt["priority"]) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "LOW":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const calculateProgress = (debt: Debt) => {
    const paid = debt.principalAmount - debt.remainingAmount;
    return (paid / debt.principalAmount) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 md:space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <PiggyBank className="w-10 h-10 md:w-12 md:h-12 text-emerald-600" />
            <CreditCard className="w-10 h-10 md:w-12 md:h-12 text-teal-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Debt & Loan Ledger
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Track what you owe and what others owe you. Stay on top of all your
            debts and loans 💰
          </p>
        </motion.div>

        {/* Summary Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "You Owe",
                value: `$${stats.totalBorrowed.toLocaleString()}`,
                icon: TrendingDown,
                color: "red",
              },
              {
                label: "Others Owe You",
                value: `$${stats.totalLent.toLocaleString()}`,
                icon: TrendingUp,
                color: "green",
              },
              {
                label: "Net Position",
                value: `${stats.netDebt >= 0 ? "-" : "+"}$${Math.abs(
                  stats.netDebt
                ).toLocaleString()}`,
                icon: Activity,
                color: stats.netDebt >= 0 ? "orange" : "emerald",
              },
              {
                label: "Active Accounts",
                value: stats.activeCount,
                icon: FileText,
                color: "blue",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium mb-2">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mb-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs & Actions */}
        <div className="bg-card rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              {[
                { id: "all", label: "All Debts", icon: FileText },
                { id: "borrowed", label: "I Owe", icon: TrendingDown },
                { id: "lent", label: "They Owe Me", icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "all" | "borrowed" | "lent")
                  }
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                reset();
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Debt/Loan
            </button>
          </div>
        </div>

        {/* Debts List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredDebts.map((debt, index) => {
              const progress = calculateProgress(debt);
              const isOverdue = debt.status === "OVERDUE";

              return (
                <motion.div
                  key={debt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden ${
                    debt.status === "PAID_OFF" ? "opacity-75" : ""
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`p-2 rounded-lg ${
                              debt.type === "BORROWED"
                                ? "bg-red-100"
                                : "bg-green-100"
                            }`}
                          >
                            {debt.type === "BORROWED" ? (
                              <ArrowDownRight className="w-5 h-5 text-red-600" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {debt.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {debt.creditorDebtor}
                              </span>
                              {debt.contactInfo && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-sm text-gray-600">
                                    {debt.contactInfo}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getPriorityColor(
                            debt.priority
                          )}`}
                        />
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            debt.status
                          )}`}
                        >
                          {debt.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Amount Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 mb-1">Principal</p>
                        <p className="text-xl font-bold text-gray-900">
                          ${debt.principalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 mb-1">Remaining</p>
                        <p className="text-xl font-bold text-red-600">
                          ${debt.remainingAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 mb-1">
                          Interest Rate
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {debt.interestRate}%
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 mb-1">Paid Off</p>
                        <p className="text-xl font-bold text-green-600">
                          $
                          {(
                            debt.principalAmount - debt.remainingAmount
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Payment Progress
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-3 rounded-full ${
                            progress === 100
                              ? "bg-green-500"
                              : progress >= 50
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Dates & Installment */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          Start:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(debt.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      {debt.dueDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            Due:
                          </span>
                          <span
                            className={`font-semibold ${
                              isOverdue
                                ? "text-red-600"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {new Date(debt.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {debt.installmentAmount && (
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            Installment:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${debt.installmentAmount}/
                            {debt.paymentFrequency?.toLowerCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <button
                        onClick={() => {
                          setSelectedDebt(debt);
                          setPayment({
                            amount: "",
                            paymentDate: new Date().toISOString().split("T")[0],
                            paymentMethod: "BANK_TRANSFER",
                            notes: "",
                          });
                          setShowPaymentModal(true);
                        }}
                        disabled={debt.status === "PAID_OFF"}
                        className="flex-1 px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <DollarSign className="w-4 h-4" />
                        {debt.type === "BORROWED"
                          ? "Make Payment"
                          : "Record Payment"}
                      </button>
                      <button
                        onClick={() => handleEdit(debt)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all flex items-center gap-2 font-semibold"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(debt.id)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredDebts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-card rounded-2xl shadow-lg"
          >
            <PiggyBank className="w-20 h-20 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">
              No debts or loans found
            </h3>
            <p className="text-muted-foreground/80 mt-2">
              Start tracking your debts and loans!
            </p>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Debt" : "Add New Debt/Loan"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the debt information below"
                : "Fill in the details to add a new debt or loan"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Car Loan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "BORROWED" | "LENT") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BORROWED">I Borrowed (Owe)</SelectItem>
                    <SelectItem value="LENT">I Lent (Others Owe Me)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principalAmount">Amount *</Label>
                <Input
                  id="principalAmount"
                  type="number"
                  value={formData.principalAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      principalAmount: e.target.value,
                    })
                  }
                  placeholder="10000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%) *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) =>
                    setFormData({ ...formData, interestRate: e.target.value })
                  }
                  placeholder="5.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="creditorDebtor">
                  {formData.type === "BORROWED" ? "Creditor" : "Debtor"} *
                </Label>
                <Input
                  id="creditorDebtor"
                  value={formData.creditorDebtor}
                  onChange={(e) =>
                    setFormData({ ...formData, creditorDebtor: e.target.value })
                  }
                  placeholder="Name or Institution"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Info</Label>
                <Input
                  id="contactInfo"
                  value={formData.contactInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, contactInfo: e.target.value })
                  }
                  placeholder="Email or Phone"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installmentAmount">Installment Amount</Label>
                <Input
                  id="installmentAmount"
                  type="number"
                  value={formData.installmentAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      installmentAmount: e.target.value,
                    })
                  }
                  placeholder="450"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentFrequency">Payment Frequency</Label>
                <Select
                  value={formData.paymentFrequency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentFrequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "LOW" | "MEDIUM" | "HIGH" | "URGENT") =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? "Update" : "Add"} Debt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {selectedDebt?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={payment.amount}
                onChange={(e) =>
                  setPayment({ ...payment, amount: e.target.value })
                }
                placeholder="500"
              />
              {selectedDebt && (
                <p className="text-xs text-muted-foreground">
                  Remaining: ${selectedDebt.remainingAmount.toLocaleString()}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={payment.paymentDate}
                onChange={(e) =>
                  setPayment({ ...payment, paymentDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={payment.paymentMethod}
                onValueChange={(value) =>
                  setPayment({ ...payment, paymentMethod: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                  <SelectItem value="ONLINE">Online Payment</SelectItem>
                  <SelectItem value="AUTO_DEBIT">Auto Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={payment.notes}
                onChange={(e) =>
                  setPayment({ ...payment, notes: e.target.value })
                }
                placeholder="Payment notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
