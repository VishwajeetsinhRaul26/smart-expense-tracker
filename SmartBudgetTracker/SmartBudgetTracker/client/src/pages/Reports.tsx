import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState("monthly");
  const [timeframe, setTimeframe] = useState("current");
  
  const { transactions, isLoading: isLoadingTransactions } = useTransactions();
  const { budgets, isLoading: isLoadingBudgets } = useBudgets();
  
  const isLoading = isLoadingTransactions || isLoadingBudgets;
  
  const getFilteredTransactions = () => {
    if (!transactions) return [];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      
      switch (timeframe) {
        case "current":
          return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        case "last":
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return txDate.getMonth() === lastMonth && txDate.getFullYear() === lastMonthYear;
        case "quarter":
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return txDate >= threeMonthsAgo;
        case "year":
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          return txDate >= oneYearAgo;
        default:
          return true;
      }
    });
  };
  
  const getFilteredExpenses = () => {
    return getFilteredTransactions().filter(tx => tx.isExpense);
  };
  
  const getFilteredIncome = () => {
    return getFilteredTransactions().filter(tx => !tx.isExpense);
  };
  
  const getTotalExpenses = () => {
    return getFilteredExpenses().reduce((sum, tx) => sum + Number(tx.amount), 0);
  };
  
  const getTotalIncome = () => {
    return getFilteredIncome().reduce((sum, tx) => sum + Number(tx.amount), 0);
  };
  
  const getExpensesByCategory = () => {
    const expenses = getFilteredExpenses();
    const categorySums: Record<string, number> = {};
    
    expenses.forEach(tx => {
      if (!categorySums[tx.category]) {
        categorySums[tx.category] = 0;
      }
      categorySums[tx.category] += Number(tx.amount);
    });
    
    return Object.entries(categorySums)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };
  
  const getIncomeByCategory = () => {
    const income = getFilteredIncome();
    const categorySums: Record<string, number> = {};
    
    income.forEach(tx => {
      if (!categorySums[tx.category]) {
        categorySums[tx.category] = 0;
      }
      categorySums[tx.category] += Number(tx.amount);
    });
    
    return Object.entries(categorySums)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };
  
  const getBudgetProgress = () => {
    if (!budgets) return [];
    
    const expensesByCategory = getExpensesByCategory();
    const expenseLookup: Record<string, number> = {};
    
    expensesByCategory.forEach(({ category, amount }) => {
      expenseLookup[category] = amount;
    });
    
    return budgets.map(budget => {
      const spent = expenseLookup[budget.category] || 0;
      const percentage = Math.min(100, Math.round((spent / Number(budget.amount)) * 100));
      const isOverBudget = spent > Number(budget.amount);
      
      return {
        id: budget.id,
        category: budget.category,
        budgeted: Number(budget.amount),
        spent,
        percentage,
        isOverBudget,
      };
    });
  };
  
  const getTimeframeLabel = () => {
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toLocaleString('default', { month: 'long' });
    
    switch (timeframe) {
      case "current":
        return currentMonth;
      case "last":
        return lastMonth;
      case "quarter":
        return "Last 3 Months";
      case "year":
        return "Past Year";
      default:
        return "";
    }
  };
  
  if (isLoading) {
    return (
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 mt-1">Loading report data...</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">Analyze your financial data</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Month</SelectItem>
            <SelectItem value="last">Last Month</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
            <SelectItem value="year">Past Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Summary for {getTimeframeLabel()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Total Income</p>
                  <TrendingUpIcon className="h-4 w-4 text-success-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(getTotalIncome())}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Total Expenses</p>
                  <TrendingDownIcon className="h-4 w-4 text-danger-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(getTotalExpenses())}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Net Savings</p>
                  <span className={getTotalIncome() - getTotalExpenses() >= 0 ? "text-success-500" : "text-danger-500"}>
                    {getTotalIncome() - getTotalExpenses() >= 0 ? "+" : ""}
                    {Math.round(((getTotalIncome() - getTotalExpenses()) / getTotalIncome()) * 100)}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(getTotalIncome() - getTotalExpenses())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <Tabs defaultValue="expenses" onValueChange={setReportType}>
          <TabsList className="mb-6">
            <TabsTrigger value="expenses">Expenses by Category</TabsTrigger>
            <TabsTrigger value="income">Income by Source</TabsTrigger>
            <TabsTrigger value="budget">Budget Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getExpensesByCategory().length === 0 ? (
                    <p className="text-center text-slate-500 py-4">No expense data available</p>
                  ) : (
                    getExpensesByCategory().map(({ category, amount }) => {
                      const percentage = Math.round((amount / getTotalExpenses()) * 100);
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">{category}</p>
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-slate-900 mr-2">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(amount)}
                              </p>
                              <span className="text-xs text-slate-500">{percentage}%</span>
                            </div>
                          </div>
                          <Progress value={percentage} />
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="income">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  Income Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getIncomeByCategory().length === 0 ? (
                    <p className="text-center text-slate-500 py-4">No income data available</p>
                  ) : (
                    getIncomeByCategory().map(({ category, amount }) => {
                      const percentage = Math.round((amount / getTotalIncome()) * 100);
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">{category}</p>
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-slate-900 mr-2">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(amount)}
                              </p>
                              <span className="text-xs text-slate-500">{percentage}%</span>
                            </div>
                          </div>
                          <Progress value={percentage} className="bg-slate-200" indicatorClassName="bg-success-500" />
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="budget">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  Budget Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getBudgetProgress().length === 0 ? (
                    <p className="text-center text-slate-500 py-4">No budget data available</p>
                  ) : (
                    getBudgetProgress().map(({ id, category, budgeted, spent, percentage, isOverBudget }) => (
                      <div key={id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-700">{category}</p>
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
                        <Progress 
                          value={percentage} 
                          className="bg-slate-200"
                          indicatorClassName={isOverBudget ? "bg-red-500" : undefined}
                        />
                        <p className={`text-xs ${isOverBudget ? "text-danger-500" : "text-slate-500"} text-right`}>
                          {isOverBudget 
                            ? `${percentage - 100}% over budget` 
                            : `${percentage}% spent`}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
