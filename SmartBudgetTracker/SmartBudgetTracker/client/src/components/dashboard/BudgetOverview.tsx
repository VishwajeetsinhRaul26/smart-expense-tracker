import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Budget } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BudgetForm } from "../forms/BudgetForm";

interface BudgetItemProps {
  category: string;
  spent: number;
  budgeted: number;
  color: string;
  isOverBudget: boolean;
}

function BudgetItem({ category, spent, budgeted, color, isOverBudget }: BudgetItemProps) {
  const percentage = Math.min(100, Math.round((spent / budgeted) * 100));
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className={`w-3 h-3 rounded-full ${color} mr-2.5`}></span>
          <p className="text-sm font-medium text-slate-700">{category}</p>
        </div>
        <p className="text-sm font-medium text-slate-900">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(spent)} / {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(budgeted)}
        </p>
      </div>
      <Progress value={percentage} className={isOverBudget ? "bg-slate-200" : ""} indicatorClassName={isOverBudget ? "bg-red-500" : ""} />
      <p className={`text-xs ${isOverBudget ? "text-danger-500" : "text-slate-500"} text-right`}>
        {isOverBudget 
          ? `${percentage - 100}% over budget` 
          : `${percentage}% spent`}
      </p>
    </div>
  );
}

interface BudgetOverviewProps {
  budgets: Budget[];
  categoryExpenses: Record<string, number>;
}

export default function BudgetOverview({ budgets, categoryExpenses }: BudgetOverviewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      "Food & Dining": "bg-primary-500",
      "Transportation": "bg-emerald-500",
      "Entertainment": "bg-amber-500",
      "Shopping": "bg-red-500",
      "Bills & Utilities": "bg-indigo-500",
      "Health & Fitness": "bg-cyan-500",
      "Travel": "bg-orange-500",
      "Education": "bg-purple-500",
      "Personal Care": "bg-pink-500",
      "Other": "bg-gray-500",
    };
    
    return colorMap[category] || "bg-primary-500";
  };
  
  const budgetItems = budgets.map(budget => {
    const spent = categoryExpenses[budget.category] || 0;
    const isOverBudget = spent > Number(budget.amount);
    
    return {
      id: budget.id,
      category: budget.category,
      spent,
      budgeted: Number(budget.amount),
      color: getCategoryColor(budget.category),
      isOverBudget,
    };
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Budget Overview</CardTitle>
        <a href="#" className="text-sm font-medium text-primary hover:text-primary-700">Manage</a>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {budgetItems.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No budgets set</p>
          ) : (
            budgetItems.map((item) => (
              <BudgetItem key={item.id} {...item} />
            ))
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-200">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-primary-50 text-primary hover:bg-primary-100">
                Add New Budget Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Budget</DialogTitle>
              </DialogHeader>
              <BudgetForm onSuccess={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
