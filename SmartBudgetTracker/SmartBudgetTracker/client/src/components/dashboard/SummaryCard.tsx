import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

const cardVariants = cva(
  "bg-white rounded-lg shadow-sm border border-slate-200 p-6",
  {
    variants: {
      type: {
        balance: "text-primary-600",
        income: "text-success-500",
        expense: "text-danger-500",
        budget: "",
      },
    },
    defaultVariants: {
      type: "balance",
    },
  }
);

interface SummaryCardProps extends VariantProps<typeof cardVariants> {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down";
    label?: string;
  };
  icon?: React.ReactNode;
  footer?: string;
}

export default function SummaryCard({
  title,
  value,
  trend,
  icon,
  footer,
  type,
}: SummaryCardProps) {
  const formattedValue = typeof value === "number" 
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(value)
    : value;

  return (
    <div className={cardVariants({ type })}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formattedValue}</h3>
          
          {trend && (
            <p 
              className={cn(
                "text-sm font-medium flex items-center mt-1",
                trend.direction === "up" ? "text-success-500" : "text-danger-500"
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {trend.value}% {trend.label || "from last month"}
            </p>
          )}
          
          {footer && <p className="text-sm text-slate-500 font-medium mt-1">{footer}</p>}
        </div>
        
        {icon && (
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center",
            type === "balance" && "bg-primary-50 text-primary-600",
            type === "income" && "bg-success-50 text-success-500",
            type === "expense" && "bg-danger-50 text-danger-500"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
