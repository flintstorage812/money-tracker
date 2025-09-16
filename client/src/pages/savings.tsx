import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SavingsGoalForm from "@/components/savings-goal-form";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Savings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");

  const { data: savingsGoals, isLoading } = useQuery({
    queryKey: ["/api/savings-goals"],
    retry: false,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
    retry: false,
  });

  const addMoneyMutation = useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: string; amount: string }) => {
      await apiRequest("POST", `/api/savings-goals/${goalId}/add`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Money added to savings goal successfully",
      });
      setShowAddMoney(null);
      setAddAmount("");
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
        description: "Failed to add money to savings goal",
        variant: "destructive",
      });
    },
  });

  const handleAddMoney = (goalId: string) => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    addMoneyMutation.mutate({ goalId, amount: addAmount });
  };

  const totalSaved = savingsGoals?.reduce((sum: number, goal: any) => sum + parseFloat(goal.currentAmount || '0'), 0) || 0;
  const activeGoals = savingsGoals?.filter((goal: any) => goal.isActive).length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-primary rounded-3xl mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading savings goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Savings Goals</h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl bg-accent"
            onClick={() => setShowGoalForm(true)}
            data-testid="button-add-savings-goal"
          >
            <i className="fas fa-plus text-accent-foreground"></i>
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Total Savings Overview */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6">
          <h3 className="text-lg opacity-90 mb-2">Total Saved</h3>
          <p className="text-3xl font-bold mb-4" data-testid="text-total-savings">
            ${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="opacity-80">This Month</p>
              <p className="font-semibold" data-testid="text-monthly-savings">
                +${parseFloat(dashboardData?.totalSavings || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="opacity-80">Goals Progress</p>
              <p className="font-semibold" data-testid="text-active-goals">
                {activeGoals} of {savingsGoals?.length || 0} Active
              </p>
            </div>
          </div>
        </div>

        {/* Savings Goals List */}
        <div className="space-y-4 mb-20">
          {savingsGoals?.length > 0 ? (
            savingsGoals.map((goal: any) => {
              const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
              const remaining = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount);
              const monthsToGoal = goal.monthlyContribution 
                ? Math.ceil(remaining / parseFloat(goal.monthlyContribution))
                : 0;

              return (
                <Card key={goal.id} data-testid={`savings-goal-${goal.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mr-3">
                          <i className={`fas fa-${goal.icon || 'piggy-bank'} text-green-500`}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold" data-testid={`goal-name-${goal.id}`}>
                            {goal.name}
                          </h4>
                          <p className="text-muted-foreground text-sm" data-testid={`goal-target-${goal.id}`}>
                            Target: ${parseFloat(goal.targetAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        data-testid={`button-goal-options-${goal.id}`}
                      >
                        <i className="fas fa-ellipsis-h"></i>
                      </Button>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium" data-testid={`goal-percentage-${goal.id}`}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-lg h-2 mb-2">
                        <div
                          className="bg-green-500 h-2 rounded-lg transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                          data-testid={`goal-progress-bar-${goal.id}`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground" data-testid={`goal-current-${goal.id}`}>
                          ${parseFloat(goal.currentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} saved
                        </span>
                        <span className="text-muted-foreground" data-testid={`goal-remaining-${goal.id}`}>
                          ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} to go
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span data-testid={`goal-monthly-${goal.id}`}>
                          ${parseFloat(goal.monthlyContribution || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}/month
                        </span>
                        {monthsToGoal > 0 && (
                          <>
                            {" • "}
                            <span data-testid={`goal-time-left-${goal.id}`}>
                              {monthsToGoal} months left
                            </span>
                          </>
                        )}
                      </div>
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        onClick={() => setShowAddMoney(goal.id)}
                        data-testid={`button-add-money-${goal.id}`}
                      >
                        Add Money
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-piggy-bank text-2xl text-green-500"></i>
                </div>
                <h3 className="font-semibold mb-2" data-testid="text-no-goals-title">
                  No Savings Goals Yet
                </h3>
                <p className="text-muted-foreground mb-4" data-testid="text-no-goals-description">
                  Create your first savings goal to start building your financial future
                </p>
                <Button
                  onClick={() => setShowGoalForm(true)}
                  data-testid="button-create-first-goal"
                >
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Savings Goal Form Dialog */}
      <Dialog open={showGoalForm} onOpenChange={setShowGoalForm}>
        <DialogContent className="max-w-md mx-auto">
          <SavingsGoalForm onClose={() => setShowGoalForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Add Money Dialog */}
      <Dialog open={!!showAddMoney} onOpenChange={() => setShowAddMoney(null)}>
        <DialogContent className="max-w-md mx-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add Money to Goal</h3>
            <Input
              type="number"
              placeholder="Enter amount"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="h-12 text-base"
              data-testid="input-add-amount"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddMoney(null)}
                className="flex-1"
                data-testid="button-cancel-add"
              >
                Cancel
              </Button>
              <Button
                onClick={() => showAddMoney && handleAddMoney(showAddMoney)}
                disabled={addMoneyMutation.isPending}
                className="flex-1"
                data-testid="button-confirm-add"
              >
                {addMoneyMutation.isPending ? "Adding..." : "Add Money"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
