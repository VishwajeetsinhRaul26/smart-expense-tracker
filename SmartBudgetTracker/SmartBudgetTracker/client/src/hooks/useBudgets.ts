import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Budget, InsertBudget } from "@shared/schema";

export function useBudgets() {
  const {
    data: budgets = [],
    isLoading,
    error,
  } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const createBudget = useMutation({
    mutationFn: async (budget: Omit<InsertBudget, "userId">) => {
      const res = await apiRequest("POST", "/api/budgets", budget);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...budget }: { id: number } & Partial<InsertBudget>) => {
      const res = await apiRequest("PUT", `/api/budgets/${id}`, budget);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/budgets/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  return {
    budgets,
    isLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
  };
}
