"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Download,
    Calendar,
    DollarSign,
    TrendingDown,
    Loader2,
    Plus,
    Trash2,
    CheckCircle,
    Clock,
    AlertCircle,
    Eye,
    BarChart3,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

interface TaxExport {
    id: number;
    taxYear: number;
    startDate: string;
    endDate: string;
    format: string;
    exportType: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    status: string;
    totalExpenses: number;
    totalDeductibleExpenses: number;
    totalNonDeductibleExpenses: number;
    totalTransactions: number;
    deductibleTransactions: number;
    generatedAt: string;
}

interface TaxPreview {
    taxYear: number;
    startDate: string;
    endDate: string;
    totalExpenses: number;
    totalDeductibleExpenses: number;
    totalNonDeductibleExpenses: number;
    totalTransactions: number;
    deductibleTransactions: number;
    estimatedTaxSavings: number;
    categoryBreakdown: Record<string, number>;
}

export default function TaxExportPage() {
    const [exports, setExports] = useState<TaxExport[]>([]);
    const [preview, setPreview] = useState<TaxPreview | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [formData, setFormData] = useState({
        taxYear: new Date().getFullYear(),
        format: "CSV",
        exportType: "FULL_YEAR",
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        fetchExports();
        fetchPreview(new Date().getFullYear());
    }, []);

    const fetchExports = async () => {
        try {
            const res = await api.get("/tax-exports");
            setExports(res.data);
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to load tax exports");
        } finally {
            setLoading(false);
        }
    };

    const fetchPreview = async (year: number) => {
        try {
            const res = await api.get(`/tax-exports/preview?taxYear=${year}`);
            setPreview(res.data);
        } catch (error: any) {
            console.error("Failed to fetch preview", error);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await api.post("/tax-exports/generate", formData);
            toast.success("Tax export generated successfully!");
            setShowGenerateModal(false);
            fetchExports();
            setFormData({
                taxYear: new Date().getFullYear(),
                format: "CSV",
                exportType: "FULL_YEAR",
                startDate: "",
                endDate: "",
            });
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to generate tax export");
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async (exportId: number) => {
        try {
            const res = await api.get(`/tax-exports/${exportId}/download`);
            const { fileUrl, fileName } = res.data;

            // Create download link
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = fileName || `tax_export_${exportId}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Download started!");
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to download export");
        }
    };

    const handleDelete = async (exportId: number) => {
        if (!confirm("Are you sure you want to delete this export?")) return;
        try {
            await api.delete(`/tax-exports/${exportId}`);
            toast.success("Export deleted successfully");
            fetchExports();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to delete export");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "text-green-600 bg-green-100";
            case "PENDING":
                return "text-yellow-600 bg-yellow-100";
            case "PROCESSING":
                return "text-blue-600 bg-blue-100";
            case "FAILED":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Tax Export
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Generate comprehensive tax reports and export your financial data
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setShowGenerateModal(true);
                        fetchPreview(formData.taxYear);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Export
                </Button>
            </motion.div>

            {/* Tax Preview Summary */}
            {preview && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {[
                        {
                            label: "Total Expenses",
                            value: `$${preview.totalExpenses.toLocaleString()}`,
                            icon: DollarSign,
                            color: "blue",
                        },
                        {
                            label: "Deductible",
                            value: `$${preview.totalDeductibleExpenses.toLocaleString()}`,
                            icon: TrendingDown,
                            color: "green",
                        },
                        {
                            label: "Est. Tax Savings",
                            value: `$${preview.estimatedTaxSavings.toLocaleString()}`,
                            icon: CheckCircle,
                            color: "emerald",
                        },
                        {
                            label: "Total Transactions",
                            value: preview.totalTransactions,
                            icon: BarChart3,
                            color: "purple",
                            subtitle: `${preview.deductibleTransactions} deductible`,
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold mb-1">{stat.value}</p>
                            {stat.subtitle && (
                                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Export History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl shadow-lg border border-border"
            >
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold">Export History</h2>
                    <p className="text-sm text-muted-foreground">View and download your previous tax exports</p>
                </div>

                <div className="p-6">
                    {exports.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-muted-foreground">No exports yet</h3>
                            <p className="text-sm text-muted-foreground/80 mt-1">
                                Generate your first tax export to get started
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {exports.map((exp, index) => (
                                    <motion.div
                                        key={exp.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                    <h3 className="font-semibold">{exp.fileName}</h3>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                            exp.status
                                                        )}`}
                                                    >
                                                        {exp.status}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Tax Year</p>
                                                        <p className="font-medium">{exp.taxYear}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Total Expenses</p>
                                                        <p className="font-medium">
                                                            ${exp.totalExpenses.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Deductible</p>
                                                        <p className="font-medium text-green-600">
                                                            ${exp.totalDeductibleExpenses.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Transactions</p>
                                                        <p className="font-medium">{exp.totalTransactions}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>
                                                        {new Date(exp.startDate).toLocaleDateString()} -{" "}
                                                        {new Date(exp.endDate).toLocaleDateString()}
                                                    </span>
                                                    <span>•</span>
                                                    <Clock className="w-3 h-3" />
                                                    <span>
                                                        Generated {new Date(exp.generatedAt).toLocaleDateString()}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{(exp.fileSize / 1024).toFixed(2)} KB</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {exp.status === "COMPLETED" && (
                                                    <Button
                                                        onClick={() => handleDownload(exp.id)}
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => handleDelete(exp.id)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Generate Modal */}
            <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Generate Tax Export</DialogTitle>
                        <DialogDescription>
                            Create a comprehensive tax report for the selected period
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="taxYear">Tax Year *</Label>
                                <Select
                                    value={String(formData.taxYear)}
                                    onValueChange={(value) => {
                                        const year = parseInt(value);
                                        setFormData({ ...formData, taxYear: year });
                                        fetchPreview(year);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[...Array(5)].map((_, i) => {
                                            const year = new Date().getFullYear() - i;
                                            return (
                                                <SelectItem key={year} value={String(year)}>
                                                    {year}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="format">Export Format *</Label>
                                <Select
                                    value={formData.format}
                                    onValueChange={(value) => setFormData({ ...formData, format: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CSV">CSV</SelectItem>
                                        <SelectItem value="JSON">JSON</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="exportType">Export Type *</Label>
                            <Select
                                value={formData.exportType}
                                onValueChange={(value) => setFormData({ ...formData, exportType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FULL_YEAR">Full Year</SelectItem>
                                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                    <SelectItem value="CUSTOM_PERIOD">Custom Period</SelectItem>
                                    <SelectItem value="DEDUCTIBLE_ONLY">Deductible Only</SelectItem>
                                    <SelectItem value="BUSINESS_EXPENSES">Business Expenses</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.exportType === "CUSTOM_PERIOD" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
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
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Preview Summary */}
                        {preview && (
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    Preview Summary
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Total Expenses</p>
                                        <p className="font-semibold">${preview.totalExpenses.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Deductible</p>
                                        <p className="font-semibold text-green-600">
                                            ${preview.totalDeductibleExpenses.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Transactions</p>
                                        <p className="font-semibold">{preview.totalTransactions}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Est. Savings</p>
                                        <p className="font-semibold text-emerald-600">
                                            ${preview.estimatedTaxSavings.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowGenerateModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleGenerate} disabled={generating}>
                            {generating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Generate Export
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
