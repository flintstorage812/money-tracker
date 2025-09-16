import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import TransactionForm from "@/components/transaction-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("income");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    retry: false,
  });

  const handleAddTransaction = (type: "income" | "expense") => {
    setTransactionType(type);
    setShowTransactionForm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-primary rounded-3xl mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Good morning,</h2>
            <p className="text-muted-foreground" data-testid="text-user-name">
              {user?.firstName || "User"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl bg-accent"
            data-testid="button-profile"
          >
            <i className="fas fa-user text-accent-foreground"></i>
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-primary-foreground mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="opacity-80 text-sm">Current Balance</p>
              <h3 className="text-3xl font-bold" data-testid="text-current-balance">
                ${parseFloat(dashboardData?.currentBalance || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="text-right">
              <p className="opacity-80 text-sm">This Month</p>
              <p className="text-lg font-semibold text-green-300" data-testid="text-monthly-change">
                +${(parseFloat(dashboardData?.monthlyIncome || '0') - parseFloat(dashboardData?.monthlyExpenses || '0')).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="opacity-80">Income</p>
              <p className="font-semibold" data-testid="text-monthly-income">
                ${parseFloat(dashboardData?.monthlyIncome || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="opacity-80">Expenses</p>
              <p className="font-semibold" data-testid="text-monthly-expenses">
                ${parseFloat(dashboardData?.monthlyExpenses || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            variant="outline"
            className="h-auto p-4 text-left rounded-xl border-border justify-start"
            onClick={() => handleAddTransaction("income")}
            data-testid="button-add-income"
          >
            <div className="flex flex-col items-start">
              <i className="fas fa-plus-circle text-green-500 text-xl mb-2"></i>
              <p className="font-medium">Add Income</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 text-left rounded-xl border-border justify-start"
            onClick={() => handleAddTransaction("expense")}
            data-testid="button-add-expense"
          >
            <div className="flex flex-col items-start">
              <i className="fas fa-minus-circle text-red-500 text-xl mb-2"></i>
              <p className="font-medium">Add Expense</p>
            </div>
          </Button>
        </div>

        {/* Upcoming Bills */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Upcoming Bills</h4>
              <Link href="/bills" className="text-primary text-sm" data-testid="link-view-all-bills">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData?.upcomingBills?.length > 0 ? (
                dashboardData.upcomingBills.map((bill: any) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                    data-testid={`bill-item-${bill.id}`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center mr-3">
                        <i className={`fas ${bill.icon || 'fa-file-invoice'} text-red-500`}></i>
                      </div>
                      <div>
                        <p className="font-medium" data-testid={`bill-name-${bill.id}`}>
                          {bill.name}
                        </p>
                        <p className="text-muted-foreground text-sm" data-testid={`bill-due-${bill.id}`}>
                          Due {new Date(bill.nextDueDate || bill.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-red-500" data-testid={`bill-amount-${bill.id}`}>
                      -${parseFloat(bill.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4" data-testid="text-no-upcoming-bills">
                  No upcoming bills
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Savings Goals Preview */}
        <Card className="mb-20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Savings Goals</h4>
              <Button
                variant="ghost"
                className="text-primary text-sm h-auto p-0"
                data-testid="button-view-savings-goals"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {dashboardData?.savingsGoals?.length > 0 ? (
                dashboardData.savingsGoals.map((goal: any) => {
                  const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
                  return (
                    <div key={goal.id} data-testid={`savings-goal-${goal.id}`}>
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1" data-testid={`goal-name-${goal.id}`}>
                          {goal.name}
                        </p>
                        <div className="w-full bg-muted rounded-lg h-2 mb-1">
                          <div
                            className="bg-green-500 h-2 rounded-lg transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                            data-testid={`goal-progress-${goal.id}`}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground" data-testid={`goal-amount-${goal.id}`}>
                          ${parseFloat(goal.currentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} of ${parseFloat(goal.targetAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-4" data-testid="text-no-savings-goals">
                  No savings goals yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Form Dialog */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-md mx-auto">
          <TransactionForm
            type={transactionType}
            onClose={() => setShowTransactionForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
