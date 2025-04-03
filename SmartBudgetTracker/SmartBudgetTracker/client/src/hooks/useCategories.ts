import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@shared/schema";

export function useCategories() {
  return {
    expenseCategories: EXPENSE_CATEGORIES,
    incomeCategories: INCOME_CATEGORIES,
  };
}
