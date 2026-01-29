'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Camera,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  Trash2,
  Link as LinkIcon,
  Download,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Store,
  Tag,
  ArrowUpRight,
  Sparkles,
  ScanLine,
  Zap
} from 'lucide-react';

interface Receipt {
  id: number;
  imageUrl: string;
  merchantName?: string;
  extractedAmount?: number;
  extractedDate?: string;
  extractedCategory?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'MANUAL_REVIEW_NEEDED';
  confidence?: number;
  ocrText?: string;
  expense?: {
    id: number;
    description: string;
  };
  createdAt: string;
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Mock data for demo
  const mockReceipts: Receipt[] = [
    {
      id: 1,
      imageUrl: '/receipts/receipt1.jpg',
      merchantName: 'Walmart Supercenter',
      extractedAmount: 126.45,
      extractedDate: '2024-01-15',
      extractedCategory: 'Groceries',
      status: 'COMPLETED',
      confidence: 95,
      ocrText: 'WALMART SUPERCENTER\nTotal: $126.45',
      createdAt: '2024-01-15T10:30:00',
    },
    {
      id: 2,
      imageUrl: '/receipts/receipt2.jpg',
      merchantName: 'Starbucks Coffee',
      extractedAmount: 8.75,
      extractedDate: '2024-01-14',
      extractedCategory: 'Dining',
      status: 'COMPLETED',
      confidence: 88,
      createdAt: '2024-01-14T08:15:00',
    },
    {
      id: 3,
      imageUrl: '/receipts/receipt3.jpg',
      merchantName: 'Shell Gas Station',
      extractedAmount: 45.20,
      extractedDate: '2024-01-13',
      extractedCategory: 'Transportation',
      status: 'MANUAL_REVIEW_NEEDED',
      confidence: 65,
      createdAt: '2024-01-13T17:45:00',
    },
    {
      id: 4,
      imageUrl: '/receipts/receipt4.jpg',
      status: 'PROCESSING',
      createdAt: '2024-01-16T12:00:00',
    },
  ];

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    // Simulate upload and OCR processing
    setTimeout(() => {
      const newReceipt: Receipt = {
        id: Date.now(),
        imageUrl: URL.createObjectURL(files[0]),
        status: 'PROCESSING',
        createdAt: new Date().toISOString(),
      };

      setReceipts(prev => [newReceipt, ...prev]);
      setUploading(false);

      // Simulate OCR completion
      setTimeout(() => {
        setReceipts(prev => prev.map(r =>
          r.id === newReceipt.id
            ? {
                ...r,
                status: 'COMPLETED',
                merchantName: 'Auto-detected Merchant',
                extractedAmount: 50.00,
                extractedDate: new Date().toISOString().split('T')[0],
                extractedCategory: 'Shopping',
                confidence: 82,
              } as Receipt
            : r
        ));
      }, 3000);
    }, 1000);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const getStatusColor = (status: Receipt['status']) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'PROCESSING': return 'text-blue-600 bg-blue-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      case 'MANUAL_REVIEW_NEEDED': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: Receipt['status']) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'PROCESSING': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'FAILED': return <XCircle className="w-4 h-4" />;
      case 'MANUAL_REVIEW_NEEDED': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredReceipts = mockReceipts.filter(receipt => {
    const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus;
    const matchesSearch = !searchQuery ||
      receipt.merchantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.extractedCategory?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: mockReceipts.length,
    completed: mockReceipts.filter(r => r.status === 'COMPLETED').length,
    processing: mockReceipts.filter(r => r.status === 'PROCESSING').length,
    needsReview: mockReceipts.filter(r => r.status === 'MANUAL_REVIEW_NEEDED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <ScanLine className="w-12 h-12 text-purple-600" />
              <Sparkles className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Smart Receipt Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload receipts and let AI extract all the details automatically with OCR magic ✨
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Receipts', value: stats.total, icon: FileText, color: 'purple' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'green' },
            { label: 'Processing', value: stats.processing, icon: Loader2, color: 'blue' },
            { label: 'Needs Review', value: stats.needsReview, icon: AlertCircle, color: 'yellow' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 border-dashed transition-all ${
            dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Upload className={`w-16 h-16 ${dragActive ? 'text-purple-600' : 'text-gray-400'} transition-colors`} />
                {uploading && (
                  <Loader2 className="w-16 h-16 text-purple-600 animate-spin absolute inset-0" />
                )}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Upload Receipt</h3>
              <p className="text-gray-600 mt-2">Drag & drop or click to upload</p>
              <p className="text-sm text-gray-500 mt-1">Supports: JPG, PNG, PDF (Max 10MB)</p>
            </div>
            <div className="flex gap-4 justify-center">
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={uploading}
                />
                <div className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Choose File
                </div>
              </label>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Take Photo
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search receipts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'COMPLETED', 'PROCESSING', 'MANUAL_REVIEW_NEEDED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Receipts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredReceipts.map((receipt, index) => (
              <motion.div
                key={receipt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group cursor-pointer"
                onClick={() => setSelectedReceipt(receipt)}
              >
                {/* Image Preview */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                  <FileText className="w-20 h-20 text-gray-400" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(receipt.status)}`}>
                    {getStatusIcon(receipt.status)}
                    {receipt.status.replace('_', ' ')}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 truncate">
                      {receipt.merchantName || 'Processing...'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(receipt.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {receipt.status === 'COMPLETED' && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Amount:
                        </span>
                        <span className="font-bold text-lg text-gray-900">
                          ${receipt.extractedAmount?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          Category:
                        </span>
                        <span className="font-semibold text-purple-600">
                          {receipt.extractedCategory}
                        </span>
                      </div>
                      {receipt.confidence && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Confidence</span>
                            <span className="font-semibold">{receipt.confidence}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                receipt.confidence >= 80 ? 'bg-green-500' :
                                receipt.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${receipt.confidence}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {receipt.status === 'PROCESSING' && (
                    <div className="flex items-center justify-center py-4 text-blue-600">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span className="font-medium">AI is reading...</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all flex items-center justify-center gap-1 text-sm font-medium">
                      <LinkIcon className="w-4 h-4" />
                      Link
                    </button>
                    <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredReceipts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No receipts found</h3>
            <p className="text-gray-500 mt-2">Upload your first receipt to get started!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
