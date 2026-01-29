"use client";

import { useEffect, useState } from "react";
import { User, Shield, Bell, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export default function SettingsPage() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Decode JWT to get user info since we don't have a /me endpoint yet
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ name: payload.sub, email: payload.sub }); // JWT usually has sub as username/email
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  }, []);

  const handleGenerateRecurring = async () => {
    setLoading(true);
    try {
      const res = await api.post("/recurring-expenses/generate-now");
      alert(`Generated ${res.data.generated} recurring expenses.`);
    } catch (error) {
      console.error("Failed to generate expenses", error);
      alert("Failed to generate expenses.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Settings</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card border-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Your account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email / Username</Label>
              <Input value={user.email} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value="********" disabled className="bg-muted/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>System Actions</CardTitle>
            </div>
            <CardDescription>
              Administrative tools and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Process Recurring Expenses</Label>
                <p className="text-sm text-muted-foreground">
                  Manually trigger the scheduler to generate due expenses.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateRecurring}
                disabled={loading}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                {loading ? "Processing..." : "Run Now"}
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4 opacity-50">
              <div className="space-y-0.5">
                <Label className="text-base">Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for budget limits.
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                <Bell className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
