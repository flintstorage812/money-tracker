import { useState } from "react";
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
import { insertTransactionSchema, type InsertTransactionSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertTransactionSchema.extend({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

interface TransactionFormProps {
  type: "income" | "expense";
  onClose: () => void;
}

export default function TransactionForm({ type, onClose }: TransactionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type,
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split('T')[0],
      frequency: "one_time",
      isRecurring: false,
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: FormSchema) => {
      const transactionData = {
        ...data,
        amount: data.amount.toString(),
      };
      await apiRequest("POST", "/api/transactions", transactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: `${type === "income" ? "Income" : "Expense"} added successfully`,
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
        description: `Failed to add ${type}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormSchema) => {
    createTransactionMutation.mutate(data);
  };

  const categories = type === "income" 
    ? ["Salary", "Freelance", "Investment", "Gift", "Other"]
    : ["Food", "Transportation", "Shopping", "Bills", "Entertainment", "Healthcare", "Other"];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" data-testid="form-title">
        Add {type === "income" ? "Income" : "Expense"}
      </h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter description"
                    className="h-12 text-base"
                    data-testid="input-description"
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
                    data-testid="input-amount"
                    {...field}
                  />
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
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger className="h-12 text-base" data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="h-12 text-base"
                    data-testid="input-date"
                    {...field}
                  />
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
              disabled={createTransactionMutation.isPending}
              className="flex-1 h-12"
              data-testid="button-submit"
            >
              {createTransactionMutation.isPending ? "Adding..." : `Add ${type === "income" ? "Income" : "Expense"}`}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
