import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/hebrew-button';
import { Input } from '@/components/ui/hebrew-input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Trash2 } from 'lucide-react';
import { useExpenses } from '@/store/expenses';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showLastMonth, setShowLastMonth] = useState(false);
  const { expenses, lastMonthExpenses, deleteExpense, updateExpenseCategory, budgets } = useExpenses();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Payment method display removed

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'אוכל': 'bg-blue-100 text-blue-800',
      'קפה': 'bg-amber-100 text-amber-800',
      'קניות': 'bg-green-100 text-green-800',
      'תחבורה': 'bg-purple-100 text-purple-800',
      'בילויים': 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const activeList = showLastMonth ? lastMonthExpenses : expenses;
  const filteredExpenses = useMemo(() => activeList.filter(expense =>
    expense.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  ), [activeList, searchTerm]);

  return (
    <div className="container py-6 pb-24">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-foreground">היסטוריית הוצאות</h1>
          <p className="text-muted-foreground">צפה וערוך את ההוצאות שלך</p>
        </header>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="חיפוש הוצאות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowLastMonth(v => !v)}>
            {showLastMonth ? 'חודש נוכחי' : 'חודש קודם'}
          </Button>
        </div>

        {/* Expenses List */}
        <div className="space-y-3">
            {filteredExpenses.map((expense) => (
            <Card key={expense.id} className="p-4 expense-card">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-semibold text-foreground">
                        {formatCurrency(expense.amount)}
                      </span>
                      <div className="min-w-32">
                        <Select
                          value={expense.category}
                          onValueChange={(v) => updateExpenseCategory(expense.id, v)}
                          disabled={showLastMonth}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="קטגוריה" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(budgets).map((cat) => (
                              <SelectItem key={cat} value={cat} className="text-xs">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <p className="text-foreground">{expense.note}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="icon-sm" variant="ghost" onClick={() => deleteExpense(expense.id)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">לא נמצאו הוצאות התואמות לחיפוש</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;