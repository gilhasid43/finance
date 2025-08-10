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
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [fadeOutEgg, setFadeOutEgg] = useState(false);
  const [imgSrcIndex, setImgSrcIndex] = useState(0);
  const [eggCandidates, setEggCandidates] = useState<string[]>([]);
  const nisimCandidates = ['/nisim.png', '/NISIM.png', '/nisim.PNG'];
  const buksaCandidates = ['/buksa.png', '/Buksa.png', '/BUKSA.png', '/buksa.PNG'];

  const triggerEasterEgg = (candidates: string[]) => {
    setEggCandidates(candidates);
    setImgSrcIndex(0);
    setShowEasterEgg(true);
    setFadeOutEgg(false);
    setTimeout(() => setFadeOutEgg(true), 1000); // show 1s
    setTimeout(() => setShowEasterEgg(false), 2000); // then fade 1s and hide
  };
  const { toast } = useToast();
  const { addExpense, budgets } = useExpenses();

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Easter eggs: "ניסים" (with/without י) and "בוקסה"
      const containsNisim = /ניסים|נסים/.test(inputValue);
      const containsBuksa = /בוקסה/.test(inputValue);
      const hasNumber = /\d/.test(inputValue);
      if ((containsNisim || containsBuksa) && !hasNumber) {
        // Pure easter egg, do NOT process expense
        triggerEasterEgg(containsNisim ? nisimCandidates : buksaCandidates);
        setInputValue('');
        return;
      }
      if (containsNisim) {
        // Also show the egg alongside a real expense
        triggerEasterEgg(nisimCandidates);
      }
      if (containsBuksa) {
        triggerEasterEgg(buksaCandidates);
      }

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

      {/* Status Line removed as requested */
      }

      {showEasterEgg && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-transparent pointer-events-none">
          <img
            src={eggCandidates[imgSrcIndex]}
            onError={() => setImgSrcIndex((i) => (i + 1 < eggCandidates.length ? i + 1 : i))}
            alt="ניסים"
            className={`max-w-full max-h-full object-contain transition-opacity duration-1000 ${fadeOutEgg ? 'opacity-0' : 'opacity-100'}`}
          />
        </div>
      )}

      {/* Quick Add Buttons removed */}
    </div>
  );
};