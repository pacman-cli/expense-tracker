"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Scan,
    Upload,
    Camera,
    Image as ImageIcon,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Sparkles,
    FileText,
    DollarSign,
    Calendar,
    Tag,
    Trash2,
    Download,
    Eye,
    RefreshCw,
    Zap,
    Search,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Receipt {
    id: number;
    imageUrl: string;
    ocrText: string;
    merchantName: string;
    extractedAmount: number;
    extractedDate: string;
    extractedCategory: string;
    status:
        | "PENDING"
        | "PROCESSING"
        | "COMPLETED"
        | "FAILED"
        | "MANUAL_REVIEW_NEEDED";
    confidence: number;
    errorMessage?: string;
    createdAt: string;
}

export default function ReceiptOCRPage() {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(
        null,
    );
    const [previewOpen, setPreviewOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const res = await api.get("/receipts");
            setReceipts(res.data);
        } catch (error) {
            console.error("Failed to fetch receipts", error);
            toast.error("Failed to load receipts");
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleFileUpload(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await handleFileUpload(e.target.files[0]);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post("/receipts/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Receipt uploaded successfully!");
            await fetchReceipts();
        } catch (error) {
            console.error("Failed to upload receipt", error);
            toast.error("Failed to upload receipt");
        } finally {
            setUploading(false);
        }
    };

    const processReceipt = async (id: number) => {
        try {
            await api.post(`/receipts/${id}/process`);
            toast.success("Processing receipt...");
            setTimeout(fetchReceipts, 2000);
        } catch (error) {
            console.error("Failed to process receipt", error);
            toast.error("Failed to process receipt");
        }
    };

    const createExpenseFromReceipt = async (receipt: Receipt) => {
        try {
            await api.post(`/receipts/${receipt.id}/create-expense`);
            toast.success("Expense created successfully!");
            setPreviewOpen(false);
        } catch (error) {
            console.error("Failed to create expense", error);
            toast.error("Failed to create expense");
        }
    };

    const deleteReceipt = async (id: number) => {
        if (!confirm("Are you sure you want to delete this receipt?")) return;
        try {
            await api.delete(`/receipts/${id}`);
            toast.success("Receipt deleted");
            fetchReceipts();
        } catch (error) {
            console.error("Failed to delete receipt", error);
            toast.error("Failed to delete receipt");
        }
    };

    const getStatusConfig = (status: Receipt["status"]) => {
        const configs = {
            PENDING: {
                color: "text-yellow-400",
                bg: "bg-yellow-500/20",
                border: "border-yellow-500/30",
                icon: Clock,
                label: "Pending",
            },
            PROCESSING: {
                color: "text-blue-400",
                bg: "bg-blue-500/20",
                border: "border-blue-500/30",
                icon: RefreshCw,
                label: "Processing",
            },
            COMPLETED: {
                color: "text-green-400",
                bg: "bg-green-500/20",
                border: "border-green-500/30",
                icon: CheckCircle2,
                label: "Completed",
            },
            FAILED: {
                color: "text-red-400",
                bg: "bg-red-500/20",
                border: "border-red-500/30",
                icon: XCircle,
                label: "Failed",
            },
            MANUAL_REVIEW_NEEDED: {
                color: "text-orange-400",
                bg: "bg-orange-500/20",
                border: "border-orange-500/30",
                icon: AlertTriangle,
                label: "Review Needed",
            },
        };
        return configs[status];
    };

    const filteredReceipts = receipts.filter((receipt) => {
        const matchesSearch =
            receipt.merchantName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            receipt.extractedCategory
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterStatus === "all" || receipt.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: receipts.length,
        completed: receipts.filter((r) => r.status === "COMPLETED").length,
        processing: receipts.filter((r) => r.status === "PROCESSING").length,
        failed: receipts.filter((r) => r.status === "FAILED").length,
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm">
                            <Scan className="h-8 w-8 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                Receipt OCR Scanner
                            </h2>
                            <p className="text-muted-foreground mt-1 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                AI-powered receipt scanning and expense
                                extraction
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
                <Card className="glass-card border-none overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                <FileText className="h-6 w-6 text-purple-400" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Total Receipts
                            </p>
                            <h3 className="text-3xl font-bold text-purple-400">
                                {stats.total}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                All time
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                                <CheckCircle2 className="h-6 w-6 text-green-400" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Completed
                            </p>
                            <h3 className="text-3xl font-bold text-green-400">
                                {stats.completed}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Successfully processed
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                                <RefreshCw className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Processing
                            </p>
                            <h3 className="text-3xl font-bold text-blue-400">
                                {stats.processing}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                In queue
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20">
                                <XCircle className="h-6 w-6 text-red-400" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Failed
                            </p>
                            <h3 className="text-3xl font-bold text-red-400">
                                {stats.failed}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Needs attention
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Upload Zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card
                    className={`glass-card border-2 border-dashed transition-all duration-300 ${
                        dragActive
                            ? "border-green-500 bg-green-500/10 scale-[1.02]"
                            : "border-white/20"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <CardContent className="p-12">
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div
                                className={`p-8 rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 transition-transform duration-300 ${
                                    dragActive ? "scale-110" : ""
                                }`}
                            >
                                {uploading ? (
                                    <RefreshCw className="h-16 w-16 text-green-400 animate-spin" />
                                ) : (
                                    <Upload className="h-16 w-16 text-green-400" />
                                )}
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold">
                                    {dragActive
                                        ? "Drop your receipt here"
                                        : "Upload Receipt"}
                                </h3>
                                <p className="text-muted-foreground">
                                    Drag & drop your receipt image or click to
                                    browse
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Supports JPG, PNG, HEIC • Max 10MB
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() =>
                                        document
                                            .getElementById("file-input")
                                            ?.click()
                                    }
                                    disabled={uploading}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl"
                                >
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Choose File
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={uploading}
                                    className="rounded-xl border-green-500/30 hover:bg-green-500/10"
                                >
                                    <Camera className="mr-2 h-4 w-4" />
                                    Take Photo
                                </Button>
                            </div>

                            <input
                                id="file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileInput}
                                className="hidden"
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search receipts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                        { key: "all", label: "All" },
                        { key: "COMPLETED", label: "Completed" },
                        { key: "PROCESSING", label: "Processing" },
                        { key: "FAILED", label: "Failed" },
                    ].map((filter) => (
                        <Button
                            key={filter.key}
                            variant={
                                filterStatus === filter.key
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() => setFilterStatus(filter.key)}
                            className={`rounded-xl ${
                                filterStatus === filter.key
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : ""
                            }`}
                        >
                            {filter.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Receipts Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full flex items-center justify-center py-20"
                        >
                            <div className="text-center space-y-4">
                                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
                                <p className="text-sm text-muted-foreground">
                                    Loading receipts...
                                </p>
                            </div>
                        </motion.div>
                    ) : filteredReceipts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full"
                        >
                            <Card className="glass-card border-none border-dashed border-2 border-white/20">
                                <CardContent className="flex flex-col items-center justify-center py-20">
                                    <div className="p-6 rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-6">
                                        <Scan className="h-16 w-16 text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                        No Receipts Yet
                                    </h3>
                                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                                        Upload your first receipt to get started
                                        with AI-powered expense tracking
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        filteredReceipts.map((receipt, index) => {
                            const config = getStatusConfig(receipt.status);
                            const StatusIcon = config.icon;

                            return (
                                <motion.div
                                    key={receipt.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                    whileHover={{ y: -8 }}
                                >
                                    <Card className="glass-card border-none overflow-hidden relative group cursor-pointer hover:shadow-xl transition-all duration-300">
                                        {/* Receipt Image */}
                                        <div className="relative h-48 bg-gradient-to-br from-green-500/10 to-emerald-500/10 overflow-hidden">
                                            <img
                                                src={
                                                    receipt.imageUrl ||
                                                    "/placeholder-receipt.jpg"
                                                }
                                                alt="Receipt"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            <Badge
                                                className={`absolute top-3 right-3 ${config.bg} ${config.color} ${config.border} border`}
                                            >
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {config.label}
                                            </Badge>
                                        </div>

                                        <CardContent className="p-4 space-y-3">
                                            {/* Merchant Name */}
                                            <div>
                                                <h3 className="font-bold text-lg truncate">
                                                    {receipt.merchantName ||
                                                        "Unknown Merchant"}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        receipt.extractedDate ||
                                                            receipt.createdAt,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>

                                            {/* Amount */}
                                            {receipt.extractedAmount && (
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-green-400" />
                                                    <span className="text-2xl font-bold text-green-400">
                                                        ৳
                                                        {receipt.extractedAmount.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Category */}
                                            {receipt.extractedCategory && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Tag className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground capitalize">
                                                        {
                                                            receipt.extractedCategory
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            {/* Confidence */}
                                            {receipt.confidence && (
                                                <div className="pt-2 border-t border-white/10">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">
                                                            Confidence
                                                        </span>
                                                        <span
                                                            className={
                                                                receipt.confidence >=
                                                                80
                                                                    ? "text-green-400"
                                                                    : receipt.confidence >=
                                                                        60
                                                                      ? "text-yellow-400"
                                                                      : "text-orange-400"
                                                            }
                                                        >
                                                            {receipt.confidence}
                                                            %
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${receipt.confidence}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedReceipt(
                                                            receipt,
                                                        );
                                                        setPreviewOpen(true);
                                                    }}
                                                    className="flex-1 rounded-lg hover:bg-green-500/10 hover:text-green-400"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                                {receipt.status ===
                                                    "COMPLETED" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            createExpenseFromReceipt(
                                                                receipt,
                                                            )
                                                        }
                                                        className="flex-1 rounded-lg hover:bg-blue-500/10 hover:text-blue-400"
                                                    >
                                                        <Zap className="h-4 w-4 mr-1" />
                                                        Create
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        deleteReceipt(
                                                            receipt.id,
                                                        )
                                                    }
                                                    className="rounded-lg hover:bg-red-500/10 hover:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="sm:max-w-[700px] glass-card border-white/20">
                    {selectedReceipt && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                    Receipt Details
                                </DialogTitle>
                                <DialogDescription>
                                    Review extracted information and create
                                    expense
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Receipt Image */}
                                <div className="relative h-64 rounded-xl overflow-hidden border border-white/20">
                                    <img
                                        src={selectedReceipt.imageUrl}
                                        alt="Receipt"
                                        className="w-full h-full object-contain bg-black/20"
                                    />
                                </div>

                                {/* Extracted Data */}
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-sm font-semibold">
                                            Merchant
                                        </Label>
                                        <Input
                                            value={
                                                selectedReceipt.merchantName ||
                                                ""
                                            }
                                            readOnly
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="text-sm font-semibold">
                                                Amount
                                            </Label>
                                            <Input
                                                value={
                                                    selectedReceipt.extractedAmount
                                                        ? `৳${selectedReceipt.extractedAmount.toFixed(2)}`
                                                        : ""
                                                }
                                                readOnly
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-sm font-semibold">
                                                Date
                                            </Label>
                                            <Input
                                                value={new Date(
                                                    selectedReceipt.extractedDate ||
                                                        selectedReceipt.createdAt,
                                                ).toLocaleDateString()}
                                                readOnly
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-sm font-semibold">
                                            Category
                                        </Label>
                                        <Input
                                            value={
                                                selectedReceipt.extractedCategory ||
                                                ""
                                            }
                                            readOnly
                                            className="rounded-xl capitalize"
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setPreviewOpen(false)}
                                    className="rounded-xl"
                                >
                                    Close
                                </Button>
                                {selectedReceipt.status === "COMPLETED" && (
                                    <Button
                                        onClick={() =>
                                            createExpenseFromReceipt(
                                                selectedReceipt,
                                            )
                                        }
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl"
                                    >
                                        <Zap className="mr-2 h-4 w-4" />
                                        Create Expense
                                    </Button>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
