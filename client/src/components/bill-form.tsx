import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertBillSchema, type InsertBillSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Bill name is required"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  dueDate: z.string().min(1, "Due date is required"),
  frequency: z.enum(["one_time", "daily", "weekly", "monthly", "yearly"]),
  category: z.string().optional(),
  icon: z.string().default("fas fa-file-invoice-dollar"),
  color: z.string().default("destructive"),
  isActive: z.boolean().default(true),
});

type FormSchema = z.infer<typeof formSchema>;

interface BillFormProps {
  onClose: () => void;
}

export default function BillForm({ onClose }: BillFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: "",
      dueDate: new Date().toISOString().split('T')[0],
      frequency: "monthly",
      category: "",
      icon: "fas fa-file-invoice-dollar",
      color: "destructive",
      isActive: true,
    },
  });

  const createBillMutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      console.log("Form submitted with data:", data);
      console.log("Form errors:", form.formState.errors);
      
      const billData = {
        ...data,
        amount: data.amount.toString(),
        nextDueDate: data.dueDate, // Set initial next due date same as due date
      };
      await apiRequest("POST", "/api/bills", billData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Bill added successfully",
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
      console.error("Error creating bill:", error);
      toast({
        title: "Error",
        description: "Failed to add bill",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormSchema) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    createBillMutation.mutate(data);
  };

  const categoryOptions = [
    { value: "utilities", label: "Utilities" },
    { value: "rent", label: "Rent/Mortgage" },
    { value: "insurance", label: "Insurance" },
    { value: "subscriptions", label: "Subscriptions" },
    { value: "phone", label: "Phone/Internet" },
    { value: "loan", label: "Loan Payment" },
    { value: "credit_card", label: "Credit Card" },
    { value: "other", label: "Other" },
  ];

  const iconOptions = [
    { value: "fas fa-file-invoice-dollar", label: "Invoice", icon: "fas fa-file-invoice-dollar" },
    { value: "fas fa-bolt", label: "Utilities", icon: "fas fa-bolt" },
    { value: "fas fa-home", label: "Housing", icon: "fas fa-home" },
    { value: "fas fa-car", label: "Transportation", icon: "fas fa-car" },
    { value: "fas fa-phone", label: "Phone", icon: "fas fa-phone" },
    { value: "fas fa-wifi", label: "Internet", icon: "fas fa-wifi" },
    { value: "fas fa-shield-alt", label: "Insurance", icon: "fas fa-shield-alt" },
    { value: "fas fa-credit-card", label: "Credit Card", icon: "fas fa-credit-card" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Add New Bill</h2>
        <p className="text-muted-foreground">
          Set up recurring bills and subscriptions
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bill Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Electric Bill, Netflix"
                    className="h-12 text-base"
                    data-testid="input-bill-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="h-12 text-base"
                    data-testid="input-bill-amount"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="h-12 text-base"
                    data-testid="input-due-date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-12 text-base" data-testid="select-frequency">
                      <SelectValue placeholder="How often?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One Time</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category (Optional)</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger className="h-12 text-base" data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                            <i className={`${option.icon} text-destructive`}></i>
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
              disabled={createBillMutation.isPending}
              className="flex-1 h-12"
              data-testid="button-submit"
              onClick={() => {
                console.log("Submit button clicked");
                console.log("Form errors:", form.formState.errors);
                console.log("Form values:", form.getValues());
              }}
            >
              {createBillMutation.isPending ? "Adding..." : "Add Bill"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}