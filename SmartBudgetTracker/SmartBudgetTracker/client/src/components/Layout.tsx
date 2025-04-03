import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BellIcon, SearchIcon } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="md:ml-64 flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center md:hidden">
              <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
            
            <div className="flex-1 flex justify-center md:justify-end">
              <div className="w-full max-w-lg relative">
                <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Search expenses..." 
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="ml-3 text-slate-600 hover:text-slate-900">
                <BellIcon className="h-6 w-6" />
              </Button>
              <div className="ml-4 relative">
                <Button variant="ghost" className="flex items-center p-0">
                  <img 
                    className="h-8 w-8 rounded-full object-cover" 
                    src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" 
                    alt="User profile"
                  />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-auto">
          <div className="max-w-7xl mx-auto py-4 px-6">
            <p className="text-sm text-slate-500 text-center">© {new Date().getFullYear()} Smart Expense Tracker. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
