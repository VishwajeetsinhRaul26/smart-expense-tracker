import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chart from "chart.js/auto";
import { Transaction } from "@shared/schema";

interface CategoryChartProps {
  transactions: Transaction[];
}

export default function CategoryChart({ transactions }: CategoryChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeframe, setTimeframe] = useState("current");

  // Get expense transactions in the specified timeframe
  const getFilteredExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions.filter(tx => {
      if (!tx.isExpense) return false;
      
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
        default:
          return true;
      }
    });
  };

  // Group expenses by category
  const getCategoryData = () => {
    const filteredExpenses = getFilteredExpenses();
    const categorySums: Record<string, number> = {};
    
    filteredExpenses.forEach(tx => {
      if (!categorySums[tx.category]) {
        categorySums[tx.category] = 0;
      }
      categorySums[tx.category] += Number(tx.amount);
    });
    
    return categorySums;
  };

  // Create or update chart
  useEffect(() => {
    if (!chartRef.current) return;
    
    const categoryData = getCategoryData();
    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);
    
    // Background colors for categories
    const backgroundColors = [
      "#4f46e5", // primary
      "#10b981", // success
      "#f59e0b", // amber
      "#f43f5e", // danger
      "#6366f1", // indigo
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#14b8a6", // teal
      "#06b6d4", // cyan
      "#0ea5e9", // sky
    ];
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext("2d");
    
    if (ctx && categories.length > 0) {
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: categories,
          datasets: [{
            data: amounts,
            backgroundColor: backgroundColors.slice(0, categories.length),
            borderWidth: 0,
            hoverOffset: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 15,
                usePointStyle: true,
                pointStyle: "circle"
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw as number;
                  const total = amounts.reduce((acc, curr) => acc + curr, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `$${value.toFixed(2)} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
    
    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [transactions, timeframe]);

  const timeframeLabels = {
    current: "This month",
    last: "Last month",
    quarter: "Last 3 months"
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Expenses by Category</CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={timeframeLabels[timeframe as keyof typeof timeframeLabels]} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">This month</SelectItem>
            <SelectItem value="last">Last month</SelectItem>
            <SelectItem value="quarter">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
