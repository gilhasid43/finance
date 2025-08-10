import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/hebrew-button';
import { Progress } from '@/components/ui/progress';
import { Plus } from 'lucide-react';
import { useExpenses } from '@/store/expenses';

const Budgets: React.FC = () => {
  const { budgets, spentByCategory, totalBudget, totalSpent } = useExpenses();

  const computed = useMemo(() => {
    return Object.entries(budgets).map(([category, budget]) => ({
      category,
      budget: budget || 0,
      spent: spentByCategory[category] || 0,
    }));
  }, [budgets, spentByCategory]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'primary';
  };

  return (
    <div className="container py-6 pb-24">
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">תקציבים</h1>
            <p className="text-muted-foreground">נהל את התקציבים החודשיים שלך</p>
          </div>
          <Button size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </header>

        <div className="space-y-4">
          <Card className="p-4 expense-card">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">סך תקציב חודשי</span>
              <span className="font-semibold">{formatCurrency(totalBudget)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">הוצא עד כה</span>
              <span className="font-semibold text-primary">{formatCurrency(totalSpent)}</span>
            </div>
          </Card>

          {computed.map((item) => {
            const remaining = item.budget - item.spent;
            const percentage = (item.spent / item.budget) * 100;
            const progressColor = getProgressColor(item.spent, item.budget);

            return (
              <Card key={item.category} className="p-4 expense-card">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{item.category}</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        הוצא: {formatCurrency(item.spent)}
                      </span>
                      <span className="text-muted-foreground">
                        תקציב: {formatCurrency(item.budget)}
                      </span>
                    </div>

                    <div className="relative">
                      <Progress 
                        value={percentage} 
                        className="h-2"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span 
                        className={`text-sm font-medium ${
                          remaining >= 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {remaining >= 0 ? 'נותר' : 'חריגה'}: {formatCurrency(Math.abs(remaining))}
                      </span>
                       <span className="text-xs text-muted-foreground">
                         {isFinite(percentage) ? percentage.toFixed(1) : '0.0'}%
                       </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Budgets;