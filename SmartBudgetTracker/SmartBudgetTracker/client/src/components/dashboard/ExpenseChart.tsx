import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chart from "chart.js/auto";
import { Transaction } from "@shared/schema";

interface ExpenseChartProps {
  transactions: Transaction[];
}

export default function ExpenseChart({ transactions }: ExpenseChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeframe, setTimeframe] = useState("30");

  // Function to filter transactions based on timeframe
  const filterTransactionsByTimeframe = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= cutoffDate;
    });
  };

  // Function to group transactions by date
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const grouped: Record<string, { expenses: number; income: number }> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = { expenses: 0, income: 0 };
      }
      
      if (transaction.isExpense) {
        grouped[dateStr].expenses += Number(transaction.amount);
      } else {
        grouped[dateStr].income += Number(transaction.amount);
      }
    });
    
    return grouped;
  };

  // Create or update chart
  useEffect(() => {
    if (!chartRef.current) return;
    
    const filteredTransactions = filterTransactionsByTimeframe(parseInt(timeframe));
    const groupedData = groupTransactionsByDate(filteredTransactions);
    
    const labels = Object.keys(groupedData).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
    
    const expenses = labels.map(date => groupedData[date].expenses);
    const income = labels.map(date => groupedData[date].income);
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext("2d");
    
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Expenses",
              data: expenses,
              borderColor: "#f43f5e",
              backgroundColor: "rgba(244, 63, 94, 0.1)",
              tension: 0.3,
              fill: true
            },
            {
              label: "Income",
              data: income,
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              tension: 0.3,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              align: "end"
            },
            tooltip: {
              mode: "index",
              intersect: false,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || "";
                  if (label) {
                    label += ": ";
                  }
                  label += new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD"
                  }).format(context.parsed.y);
                  return label;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                drawBorder: false,
                color: "rgba(226, 232, 240, 0.7)"
              },
              ticks: {
                callback: function(value) {
                  return "$" + value;
                }
              }
            },
            x: {
              grid: {
                display: false,
                drawBorder: false
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

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Expense Trend</CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">This year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
