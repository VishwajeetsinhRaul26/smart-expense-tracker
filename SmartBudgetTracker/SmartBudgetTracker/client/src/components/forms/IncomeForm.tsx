import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { extendedTransactionSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingUpIcon } from "lucide-react";

// Define a schema for income form
const incomeFormSchema = extendedTransactionSchema
  .omit({ userId: true })
  .extend({
    isExpense: z.literal(false).default(false),
    isRecurring: z.boolean().default(false),
  });

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

interface IncomeFormProps {
  onSuccess?: () => void;
  className?: string;
  compact?: boolean;
}

export function IncomeForm({ onSuccess, className, compact = false }: IncomeFormProps) {
  const { createTransaction } = useTransactions();
  const { incomeCategories } = useCategories();
  const { toast } = useToast();
  
  // Set up the form
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      amount: 0,
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      isExpense: false,
      isRecurring: false,
    },
  });
  
  // Handle form submission
  async function onSubmit(values: IncomeFormValues) {
    try {
      // Remove isRecurring as it's not in the schema
      const { isRecurring, ...transactionData } = values;
      await createTransaction.mutateAsync(transactionData);
      
      form.reset({
        amount: 0,
        description: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        isExpense: false,
        isRecurring: false,
      });
      
      toast({
        title: "Success",
        description: "Income added successfully",
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add income. Please try again.",
        variant: "destructive",
      });
    }
  }
  
  // Determine if we should show the form in a card (for standalone page)
  // or without a card (for embedded form in dashboard)
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">$</span>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    className="pl-7 pr-12"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">USD</span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {incomeCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What was this income for?"
                  className="resize-none"
                  {...field}
                />
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
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Recurring Income</FormLabel>
                <p className="text-sm text-muted-foreground">
                  This is a recurring income source
                </p>
              </div>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          variant="secondary"
          className="w-full bg-green-600 hover:bg-green-700 text-white" 
          disabled={createTransaction.isPending}
        >
          {createTransaction.isPending ? "Adding..." : "Add Income"}
        </Button>
      </form>
    </Form>
  );
  
  if (compact) {
    return <div className={className}>{formContent}</div>;
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUpIcon className="mr-2 h-5 w-5" />
          Add New Income
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}
