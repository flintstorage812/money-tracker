import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertSavingsGoalSchema, type InsertSavingsGoalSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Target amount must be a positive number",
  }),
  monthlyContribution: z.string().optional().refine((val) => {
    if (!val || val === "" || val === "0" || val === "0.00") return true;
    return !isNaN(parseFloat(val)) && parseFloat(val) > 0;
  }, {
    message: "Monthly contribution must be a positive number",
  }),
  targetDate: z.string().optional(),
  icon: z.string().default("piggy-bank"),
  color: z.string().default("success"),
  isActive: z.boolean().default(true),
});

type FormSchema = z.infer<typeof formSchema>;

interface SavingsGoalFormProps {
  onClose: () => void;
}

export default function SavingsGoalForm({ onClose }: SavingsGoalFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      targetAmount: "",
      currentAmount: "0",
      monthlyContribution: "",
      icon: "piggy-bank",
      color: "success",
      isActive: true,
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      const goalData = {
        ...data,
        targetAmount: data.targetAmount.toString(),
        currentAmount: "0",
        monthlyContribution: data.monthlyContribution ? data.monthlyContribution.toString() : undefined,
      };
      await apiRequest("POST", "/api/savings-goals", goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Savings goal created successfully",
      });
      onClose();
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
        description: "Failed to create savings goal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormSchema) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    createGoalMutation.mutate(data);
  };

  const iconOptions = [
    { value: "piggy-bank", label: "Piggy Bank", icon: "fas fa-piggy-bank" },
    { value: "home", label: "House", icon: "fas fa-home" },
    { value: "car", label: "Car", icon: "fas fa-car" },
    { value: "plane", label: "Vacation", icon: "fas fa-plane" },
    { value: "graduation-cap", label: "Education", icon: "fas fa-graduation-cap" },
    { value: "ring", label: "Wedding", icon: "fas fa-ring" },
    { value: "shield-alt", label: "Emergency", icon: "fas fa-shield-alt" },
    { value: "laptop", label: "Technology", icon: "fas fa-laptop" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" data-testid="form-title">
        Create Savings Goal
      </h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Emergency Fund"
                    className="h-12 text-base"
                    data-testid="input-goal-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="h-12 text-base"
                    data-testid="input-target-amount"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyContribution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Contribution (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="h-12 text-base"
                    data-testid="input-monthly-contribution"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Date (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="h-12 text-base"
                    data-testid="input-target-date"
                    {...field}
                    value={field.value || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger className="h-12 text-base" data-testid="select-icon">
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <i className={`${option.icon} text-green-500`}></i>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGoalMutation.isPending}
              className="flex-1 h-12"
              data-testid="button-submit"
              onClick={() => {
                // Debug logging to help identify form issues
                console.log("Submit button clicked");
                console.log("Form errors:", form.formState.errors);
                console.log("Form values:", form.getValues());
              }}
            >
              {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
