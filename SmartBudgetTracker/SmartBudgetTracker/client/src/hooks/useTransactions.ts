import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Transaction, InsertTransaction } from "@shared/schema";

export function useTransactions() {
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const createTransaction = useMutation({
    mutationFn: async (transaction: Omit<InsertTransaction, "userId">) => {
      const res = await apiRequest("POST", "/api/transactions", transaction);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...transaction }: { id: number } & Partial<InsertTransaction>) => {
      const res = await apiRequest("PUT", `/api/transactions/${id}`, transaction);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  return {
    transactions,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

export function useDashboard() {
  return useQuery<any>({
    queryKey: ["/api/dashboard"],
  });
}
