"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { redirect } from "next/navigation";
import { useState } from "react";
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
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PricingRule = {
  id: string;
  region: string;
  position: string;
  durationType: string;
  basePrice: number;
  multiplier: number;
};

export default function AdPricingPage() {
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [newRule, setNewRule] = useState<Partial<PricingRule>>({});

  // Redirect if not admin
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const handleSaveRule = async () => {
    if (!newRule.region || !newRule.position || !newRule.basePrice) {
      toast({
        variant: "destructive",
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/ad-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule),
      });

      if (!response.ok) {
        throw new Error("Failed to save pricing rule");
      }

      const savedRule = await response.json();
      setPricingRules([...pricingRules, savedRule]);
      setNewRule({});
      toast({
        description: "Pricing rule saved successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to save pricing rule",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/ad-pricing/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete pricing rule");
      }

      setPricingRules(pricingRules.filter((rule) => rule.id !== id));
      toast({
        description: "Pricing rule deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to delete pricing rule",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Advertisement Pricing Management
        </h2>
      </div>

      <Tabs defaultValue="pricing-rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pricing-rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="new-rule">Add New Rule</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing-rules" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pricingRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {rule.region} - {rule.position}
                  </CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    Delete
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${rule.basePrice}</div>
                  <p className="text-xs text-muted-foreground">
                    Multiplier: {rule.multiplier}x
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new-rule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Pricing Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={newRule.region}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, region: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOCAL">
                        Local (Single Country)
                      </SelectItem>
                      <SelectItem value="MULTI_COUNTRY">
                        Multi-Country
                      </SelectItem>
                      <SelectItem value="ALL_AFRICA">
                        All African Countries
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Ad Position</Label>
                  <Select
                    value={newRule.position}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, position: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOP_BANNER">Top Banner</SelectItem>
                      <SelectItem value="SIDEBAR">Sidebar</SelectItem>
                      <SelectItem value="IN_FEED">In Feed</SelectItem>
                      <SelectItem value="POPUP">Popup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={newRule.basePrice || ""}
                    onChange={(e) =>
                      setNewRule({
                        ...newRule,
                        basePrice: parseFloat(e.target.value),
                      })
                    }
                    placeholder="Enter base price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="multiplier">Duration Multiplier</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    step="0.1"
                    value={newRule.multiplier || ""}
                    onChange={(e) =>
                      setNewRule({
                        ...newRule,
                        multiplier: parseFloat(e.target.value),
                      })
                    }
                    placeholder="Enter multiplier"
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSaveRule}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Pricing Rule"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
