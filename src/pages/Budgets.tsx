import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/hebrew-button';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { useExpenses } from '@/store/expenses';

const budgetIcons = [Target, TrendingUp, AlertCircle, Target, TrendingUp];

const Budgets: React.FC = () => {
  const { budgets, spentByCategory, totalBudget, totalSpent } = useExpenses();
  const [floatingElements, setFloatingElements] = useState<Array<{id: number, top: number, left: number, color: string, icon: any}>>([]);

  useEffect(() => {
    // Create floating elements for the background
    const elements = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      top: Math.random() * 60 + 10,
      left: Math.random() * 70 + 5,
      color: ['#F5D565', '#B7C5FF', '#BEE8D6', '#F9B3D1', '#D9C1F0'][i],
      icon: budgetIcons[i]
    }));
    setFloatingElements(elements);
  }, []);

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

  // Function to create a darker version of a color
  const darkenColor = (color: string, amount: number = 0.3) => {
    // Remove # if present
    const hex = color.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Darken by reducing each component
    const darkR = Math.max(0, Math.floor(r * (1 - amount)));
    const darkG = Math.max(0, Math.floor(g * (1 - amount)));
    const darkB = Math.max(0, Math.floor(b * (1 - amount)));
    
    // Convert back to hex
    return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pb-28 bg-pattern flex flex-col relative">
      {/* Floating background elements */}
      {floatingElements.map((element) => (
        <div
          key={element.id}
          className="absolute w-16 h-16 rounded-full flex items-center justify-center text-white opacity-20"
          style={{
            top: `${element.top}%`,
            left: `${element.left}%`,
            backgroundColor: element.color,
            animation: `float-around ${8 + element.id}s ease-in-out infinite`,
            animationDelay: `${element.id}s`
          }}
        >
          <element.icon className="h-8 w-8" />
        </div>
      ))}

      {/* Header */}
      <div className="container pt-12 pb-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">תקציבים</h1>
          <p className="text-sm opacity-90">נהל את התקציבים החודשיים שלך</p>
        </div>
      </div>

      {/* Content */}
      <div className="container space-y-6 flex-1">
        {/* Summary Card */}
        <Card className={`p-6 ${totalSpent > totalBudget ? 'border-red-500 border-2' : ''}`} style={{ 
          backgroundColor: totalSpent > totalBudget ? '#FEE2E2' : '#D2FBDD', 
          backdropFilter: 'blur(10px)',
          border: totalSpent > totalBudget ? '2px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">סך תקציב חודשי</span>
              <div className="flex items-center gap-2">
                {totalSpent > totalBudget && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-semibold">{formatCurrency(totalBudget)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">הוצא עד כה</span>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${totalSpent > totalBudget ? 'text-red-500' : 'text-primary'}`}>
                  {formatCurrency(totalSpent)}
                </span>
                {totalSpent > totalBudget && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {totalSpent <= totalBudget ? 'נותר' : 'חריגה'}
              </span>
              <span className={`font-semibold ${
                totalSpent <= totalBudget ? 'text-success' : 'text-destructive'
              }`}>
                {formatCurrency(Math.abs(totalBudget - totalSpent))}
              </span>
            </div>
            {totalSpent > totalBudget && (
              <div className="text-center p-2 bg-red-100 rounded-lg border border-red-300">
                <span className="text-sm text-red-700 font-medium">
                  ⚠️ חרגת מהתקציב החודשי ב-{formatCurrency(totalSpent - totalBudget)}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Budget Categories */}
        <div className="space-y-4">
          {computed.map((item, idx) => {
            const remaining = item.budget - item.spent;
            const percentage = (item.spent / item.budget) * 100;
            const progressColor = getProgressColor(item.spent, item.budget);
            const cardColors = ['#F5D565', '#B7C5FF', '#BEE8D6', '#F9B3D1', '#D9C1F0'];
            const currentCardColor = cardColors[idx % cardColors.length];
            const darkerColor = darkenColor(currentCardColor, 0.4);

            return (
              <Card 
                key={item.category} 
                className="p-4 stack-card"
                style={{ backgroundColor: currentCardColor }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="title">{item.category}</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="subtitle">
                        הוצא: {formatCurrency(item.spent)}
                      </span>
                      <span className="subtitle">
                        תקציב: {formatCurrency(item.budget)}
                      </span>
                    </div>

                    <div className="relative">
                      <div 
                        className="h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                      >
                        <div 
                          className={`h-full transition-all duration-300 ease-in-out ${
                            percentage > 100 ? 'bg-red-500' : 'bg-white'
                          }`}
                          style={{ 
                            width: `${Math.min(100, percentage)}%`,
                          }}
                        />
                        {percentage > 100 && (
                          <div 
                            className="h-full transition-all duration-300 ease-in-out bg-red-500"
                            style={{ 
                              width: `${Math.min(100, percentage - 100)}%`,
                              marginLeft: '100%'
                            }}
                          />
                        )}
                      </div>
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