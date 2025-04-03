import { IncomeForm } from "@/components/forms/IncomeForm";

export default function AddIncome() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Add Income</h1>
        <p className="text-slate-500 mt-1">Record a new income</p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <IncomeForm />
      </div>
    </>
  );
}
