import { ExpenseForm } from "@/components/forms/ExpenseForm";

export default function AddExpense() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Add Expense</h1>
        <p className="text-slate-500 mt-1">Record a new expense</p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <ExpenseForm />
      </div>
    </>
  );
}
