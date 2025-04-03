import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3Icon,
  PlusIcon,
  TrendingUpIcon,
  Settings2Icon,
  DollarSignIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    {
      href: "/",
      icon: <BarChart3Icon className="h-5 w-5 mr-3" />,
      label: "Dashboard",
    },
    {
      href: "/add-expense",
      icon: <PlusIcon className="h-5 w-5 mr-3" />,
      label: "Add Expense",
    },
    {
      href: "/add-income",
      icon: <TrendingUpIcon className="h-5 w-5 mr-3" />,
      label: "Income",
    },
    {
      href: "/reports",
      icon: <BarChart3Icon className="h-5 w-5 mr-3" />,
      label: "Reports",
    },
    {
      href: "/settings",
      icon: <Settings2Icon className="h-5 w-5 mr-3" />,
      label: "Settings",
    },
  ];

  return (
    <div className="bg-white border-r border-slate-200 w-full md:w-64 md:flex-shrink-0 md:fixed md:h-screen overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary flex items-center">
          <DollarSignIcon className="h-6 w-6 mr-2" />
          Smart Expense
        </h1>
      </div>
      
      <nav className="mt-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center px-6 py-3 hover:bg-slate-50",
                location === item.href
                  ? "bg-primary-50 text-primary border-l-4 border-primary"
                  : "text-slate-600"
              )}
            >
              {item.icon}
              {item.label}
            </a>
          </Link>
        ))}
      </nav>
      
      <div className="px-6 py-4 mt-8">
        <div className="bg-primary-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary-800">Premium Features</h3>
          <p className="text-xs text-slate-600 mt-1">Unlock advanced reports, data export and more!</p>
          <Button size="sm" className="mt-3 text-xs font-medium">
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}
