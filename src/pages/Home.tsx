import React from 'react';
import { ExpenseEntry } from '@/components/expense-entry';
import { useExpenses } from '@/store/expenses';

const Home: React.FC = () => {
  const { remainingAmount, totalSpent } = useExpenses();
  const handleExpenseAdded = () => {};

  return (
    <div className="min-h-screen flex items-center justify-center pb-24 px-4">
      <div className="space-y-6 w-full max-w-lg">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">מעקב הוצאות</h1>
          <p className="text-muted-foreground mt-1">
            רשום את ההוצאות שלך בשפה טבעית
          </p>
        </header>

        <ExpenseEntry
          onExpenseAdded={handleExpenseAdded}
          remainingAmount={remainingAmount}
          totalSpent={totalSpent}
        />
      </div>
    </div>
  );
};

export default Home;