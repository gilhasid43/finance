import React, { useState } from 'react';
import { Button } from '@/components/ui/hebrew-button';
import { Input } from '@/components/ui/hebrew-input';
import { Card } from '@/components/ui/card';
import { Plus, Wallet, CreditCard, Banknote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useExpenses } from '@/store/expenses';
import { parseExpenseInput } from '@/lib/parser';
import { chooseBestCategory } from '@/lib/categorize';
import { classifyCategoryServer } from '@/lib/llm';

interface ExpenseEntryProps {
  onExpenseAdded: () => void;
  remainingAmount: number;
  totalSpent: number;
}

export const ExpenseEntry: React.FC<ExpenseEntryProps> = ({
  onExpenseAdded,
  remainingAmount,
  totalSpent
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addExpense, budgets } = useExpenses();

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    
    try {
      const parsed = parseExpenseInput(inputValue);
      if (parsed.amount === null || !isFinite(parsed.amount) || parsed.amount <= 0) {
        throw new Error('לא זוהתה עלות תקינה');
      }

      let chosenCategory = chooseBestCategory(parsed.note, parsed.category, budgets);
      // Try serverless AI categorization first
      const aiChoice = await classifyCategoryServer(parsed.note, Object.keys(budgets));
      if (aiChoice) {
        chosenCategory = aiChoice;
      }
      const method = parsed.method ?? 'כרטיס אשראי';

      addExpense({
        amount: Math.round(parsed.amount),
        category: chosenCategory,
        method,
        note: parsed.note,
      });

      toast({
        title: "הוצאה נוספה",
        description: `${chosenCategory} • ${parsed.amount} ₪`,
      });

      setInputValue('');
      onExpenseAdded();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעת הוספת הוצאה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Main Input */}
      <Card className="p-6 expense-card">
        <div className="space-y-4">
          <Input
            type="text"
            inputMode="text"
            placeholder="דוגמה: 30 שקל קפה"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="text-lg"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          
          <Button 
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading}
            size="lg"
            className="w-full"
          >
            <Plus className="ml-2" />
            {isLoading ? 'מוסיף הוצאה...' : 'הוסף הוצאה'}
          </Button>
        </div>
      </Card>

      {/* Status Line removed as requested */}

      {/* Quick Add Buttons removed */}
    </div>
  );
};