import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { isAxiosError } from "axios";

interface AddMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletId?: number;
  walletName?: string;
  onSuccess: () => void;
}

export default function AddMoneyDialog({
  open,
  onOpenChange,
  walletId,
  walletName,
  onSuccess,
}: AddMoneyDialogProps) {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId) {
      toast.error("Wallet information missing");
      return;
    }

    setLoading(true);
    try {
      await api.post("/incomes", {
        source,
        amount: parseFloat(amount),
        date,
        description,
        walletId,
      });
      toast.success("Money added successfully");
      onSuccess();
      onOpenChange(false);
      // Reset form
      setSource("");
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Failed to add money", error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to add money");
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
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Add Money
          </DialogTitle>
          <DialogDescription>
            Add funds to {walletName || "your wallet"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="e.g. Salary, Top up"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (৳)</Label>
            <Input
              id="amount"
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
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Additional notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 rounded-lg"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg group"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              )}
              Add Funds
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
