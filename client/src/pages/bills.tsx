import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BillForm from "@/components/bill-form";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Bill } from "@shared/schema";

export default function Bills() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showBillForm, setShowBillForm] = useState(false);

  const { data: bills, isLoading } = useQuery({
    queryKey: ["/api/bills"],
    retry: false,
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (billId: string) => {
      await apiRequest("POST", `/api/bills/${billId}/pay`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Bill marked as paid",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to mark bill as paid",
        variant: "destructive",
      });
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: async (billId: string) => {
      await apiRequest("DELETE", `/api/bills/${billId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Bill deleted successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete bill",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsPaid = (billId: string) => {
    markAsPaidMutation.mutate(billId);
  };

  const handleDeleteBill = (billId: string) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      deleteBillMutation.mutate(billId);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "one_time": return "One Time";
      case "weekly": return "Weekly";
      case "monthly": return "Monthly";
      case "yearly": return "Yearly";
      default: return frequency;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-2xl font-bold">Bills & Subscriptions</h1>
              <p className="text-sm text-muted-foreground">Manage recurring payments</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeBills = Array.isArray(bills) ? bills.filter((bill: Bill) => bill.isActive) : [];
  const upcomingBills = activeBills.filter((bill: Bill) => !bill.isPaid);
  const paidBills = activeBills.filter((bill: Bill) => bill.isPaid);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Bills & Subscriptions</h1>
            <p className="text-sm text-muted-foreground">
              {upcomingBills.length} upcoming bills
            </p>
          </div>
          <Button
            onClick={() => setShowBillForm(true)}
            className="rounded-full w-12 h-12 p-0"
            data-testid="button-add-bill"
          >
            <i className="fas fa-plus text-lg"></i>
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {activeBills.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-3xl mx-auto mb-4 flex items-center justify-center">
              <i className="fas fa-file-invoice-dollar text-2xl text-muted-foreground"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Bills Yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first recurring bill or subscription to start tracking payments.
            </p>
            <Button
              onClick={() => setShowBillForm(true)}
              data-testid="button-create-first-bill"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Your First Bill
            </Button>
          </div>
        ) : (
          <>
            {/* Upcoming Bills */}
            {upcomingBills.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <i className="fas fa-clock mr-2 text-orange-500"></i>
                  Upcoming Bills ({upcomingBills.length})
                </h2>
                <div className="space-y-3">
                  {upcomingBills.map((bill: Bill) => (
                    <Card key={bill.id} className="relative" data-testid={`bill-card-${bill.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                              <i className={`${bill.icon || 'fas fa-file-invoice-dollar'} text-destructive text-sm`}></i>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-foreground">{bill.name}</h3>
                                {isOverdue(bill.nextDueDate || bill.dueDate) && (
                                  <Badge variant="destructive" className="text-xs">Overdue</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{formatCurrency(bill.amount)}</span>
                                <span>•</span>
                                <span>Due {formatDate(bill.nextDueDate || bill.dueDate)}</span>
                                <span>•</span>
                                <span>{getFrequencyLabel(bill.frequency)}</span>
                              </div>
                              {bill.category && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {bill.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsPaid(bill.id)}
                              disabled={markAsPaidMutation.isPending}
                              data-testid={`button-mark-paid-${bill.id}`}
                            >
                              <i className="fas fa-check mr-1"></i>
                              Pay
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteBill(bill.id)}
                              disabled={deleteBillMutation.isPending}
                              data-testid={`button-delete-${bill.id}`}
                            >
                              <i className="fas fa-trash text-destructive"></i>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Paid Bills */}
            {paidBills.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <i className="fas fa-check-circle mr-2 text-green-500"></i>
                  Recently Paid ({paidBills.length})
                </h2>
                <div className="space-y-3">
                  {paidBills.slice(0, 5).map((bill: Bill) => (
                    <Card key={bill.id} className="relative opacity-60" data-testid={`paid-bill-card-${bill.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <i className="fas fa-check text-green-600 text-sm"></i>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-foreground">{bill.name}</h3>
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">Paid</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{formatCurrency(bill.amount)}</span>
                                <span>•</span>
                                <span>Paid on {bill.paidDate && formatDate(bill.paidDate)}</span>
                                <span>•</span>
                                <span>{getFrequencyLabel(bill.frequency)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={showBillForm} onOpenChange={setShowBillForm}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <BillForm onClose={() => setShowBillForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}