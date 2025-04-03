import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@shared/schema";
import { ShoppingCartIcon, TrendingUpIcon, ArrowUpIcon, CheckIcon, ZapIcon } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getIconForCategory = (category: string, isExpense: boolean) => {
    if (!isExpense) return <TrendingUpIcon className="h-5 w-5" />;
    
    switch (category) {
      case "Food & Dining":
        return <ShoppingCartIcon className="h-5 w-5" />;
      case "Shopping":
        return <ShoppingCartIcon className="h-5 w-5" />;
      case "Bills & Utilities":
        return <ZapIcon className="h-5 w-5" />;
      default:
        return <CheckIcon className="h-5 w-5" />;
    }
  };

  const getCategoryBackgroundColor = (category: string, isExpense: boolean) => {
    if (!isExpense) return "bg-success-50 text-success-500";
    
    switch (category) {
      case "Food & Dining":
        return "bg-primary-50 text-primary-600";
      case "Transportation":
        return "bg-amber-50 text-amber-600";
      case "Entertainment":
        return "bg-purple-50 text-purple-600";
      case "Shopping":
        return "bg-pink-50 text-pink-600";
      case "Bills & Utilities":
        return "bg-blue-50 text-blue-600";
      default:
        return "bg-primary-50 text-primary-600";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const txDate = new Date(date);
    
    // If it's today, show time
    if (
      txDate.getDate() === now.getDate() &&
      txDate.getMonth() === now.getMonth() &&
      txDate.getFullYear() === now.getFullYear()
    ) {
      return `Today, ${format(txDate, "h:mm a")}`;
    }
    
    // If it's within 1 week, show relative time
    if (now.getTime() - txDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(txDate, { addSuffix: true });
    }
    
    // Otherwise show full date
    return format(txDate, "MMM d, yyyy");
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <a href="#" className="text-sm font-medium text-primary hover:text-primary-700">View All</a>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No transactions yet</p>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center p-3 hover:bg-slate-50 rounded-lg -mx-3 transition cursor-pointer">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getCategoryBackgroundColor(transaction.category, transaction.isExpense)}`}>
                  {getIconForCategory(transaction.category, transaction.isExpense)}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-slate-900">{transaction.description}</p>
                  <p className="text-xs text-slate-500">{formatTime(new Date(transaction.date))}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${transaction.isExpense ? "text-danger-500" : "text-success-500"}`}>
                    {transaction.isExpense ? "-" : "+"}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(Number(transaction.amount))}
                  </p>
                  <p className="text-xs text-slate-500">{transaction.category}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
