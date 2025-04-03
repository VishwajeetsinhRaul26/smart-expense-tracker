import { useDashboard } from "@/hooks/useTransactions";
import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon, PieChartIcon } from "lucide-react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import CategoryChart from "@/components/dashboard/CategoryChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import BudgetOverview from "@/components/dashboard/BudgetOverview";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { IncomeForm } from "@/components/forms/IncomeForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-600">Error</h2>
            <p className="mt-2 text-gray-600">
              There was an error loading the dashboard data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your financial activity</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Current Balance"
          value={dashboardData.currentBalance}
          trend={{
            value: 8.2,
            direction: "up",
          }}
          icon={<DollarSignIcon className="h-6 w-6" />}
          type="balance"
        />
        <SummaryCard
          title="Monthly Income"
          value={dashboardData.monthlyIncome}
          trend={{
            value: 12.5,
            direction: "up",
          }}
          icon={<TrendingUpIcon className="h-6 w-6" />}
          type="income"
        />
        <SummaryCard
          title="Monthly Expenses"
          value={dashboardData.monthlyExpenses}
          trend={{
            value: 4.3,
            direction: "down",
          }}
          icon={<TrendingDownIcon className="h-6 w-6" />}
          type="expense"
        />
        <SummaryCard
          title="Budget Status"
          value={`${dashboardData.budgetUsed}%`}
          footer={`$${dashboardData.monthlyExpenses} of $${dashboardData.budgetTotal} budget`}
          icon={
            <svg viewBox="0 0 36 36" className="h-12 w-12">
              <path
                className="text-slate-200"
                fill="currentColor"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary"
                fill="currentColor"
                stroke-dasharray={`${dashboardData.budgetUsed}, 100`}
                stroke-dashoffset="0"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          }
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ExpenseChart
          transactions={dashboardData.recentTransactions}
        />
        <CategoryChart
          transactions={dashboardData.recentTransactions}
        />
      </div>

      {/* Recent Transactions / Budget Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RecentTransactions
          transactions={dashboardData.recentTransactions}
        />
        <BudgetOverview
          budgets={dashboardData.budgetStatus}
          categoryExpenses={dashboardData.categoryExpenses}
        />
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Add Expense</h2>
          <ExpenseForm compact />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Add Income</h2>
          <IncomeForm compact />
        </div>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="mb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32 mt-2" />
                <Skeleton className="h-4 w-20 mt-2" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 col-span-2">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-[260px] w-full rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 col-span-2">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="w-3 h-3 rounded-full mr-2.5" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
