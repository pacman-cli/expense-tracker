import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { isAxiosError } from "axios";

interface SendMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletId?: number;
  walletName?: string;
  onSuccess: () => void;
}

export default function SendMoneyDialog({
  open,
  onOpenChange,
  walletId,
  walletName,
  onSuccess,
}: SendMoneyDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId) {
      toast.error("Wallet information missing");
      return;
    }

    setLoading(true);
    try {
      await api.post("/expenses", {
        description,
        amount: parseFloat(amount),
        date,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        walletId,
      });
      toast.success("Money sent successfully");
      onSuccess();
      onOpenChange(false);
      // Reset form
      setDescription("");
      setAmount("");
      setCategoryId("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Failed to send money", error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to send money");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Send / Pay
          </DialogTitle>
          <DialogDescription>
            Record a payment from {walletName || "your wallet"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="send-description">Recipient / Description</Label>
            <Input
              id="send-description"
              placeholder="e.g. Rent, Grocery shop"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="send-amount">Amount (৳)</Label>
            <Input
              id="send-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="send-category">Category</Label>
            <select
              id="send-category"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select Category (Optional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="send-date">Date</Label>
            <Input
              id="send-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-10 rounded-lg"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg group"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
              )}
              Confirm Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
