import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/hebrew-button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  Calendar, 
  RefreshCw, 
  Smartphone, 
  Globe,
  Database
} from 'lucide-react';
import { Input } from '@/components/ui/hebrew-input';
import { useExpenses } from '@/store/expenses';

const Settings: React.FC = () => {
  const { budgets, setBudget, setBudgets, renameCategory, deleteCategory, resetCurrentMonth } = useExpenses();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');

  const entries = useMemo(() => Object.entries(budgets), [budgets]);

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    const value = Math.max(0, Math.round(Number(newCategoryBudget)) || 0);
    if (!name) return;
    setBudgets({ ...budgets, [name]: value });
    setNewCategoryName('');
    setNewCategoryBudget('');
  };

  return (
    <div className="container py-6 pb-24">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-foreground">הגדרות</h1>
          <p className="text-muted-foreground">נהל את העדפות האפליקציה</p>
        </header>

        {/* Budget categories configuration */}
        <Card className="p-6 expense-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">קטגוריות ותקציבים</h3>
            </div>

            <div className="space-y-2">
              {entries.map(([category, value]) => (
                <div key={category} className="flex items-center gap-3">
                  <Input
                    placeholder="שם"
                    defaultValue={category}
                    onBlur={(e) => {
                      const newName = e.target.value.trim();
                      if (newName && newName !== category) renameCategory(category, newName);
                    }}
                    className="w-40"
                  />
                  <Input
                    type="number"
                    className="w-28"
                    value={String(value)}
                    onChange={(e) => setBudget(category, Number(e.target.value))}
                  />
                  <Badge variant="secondary">₪</Badge>
                  <Button variant="ghost" size="sm" onClick={() => deleteCategory(category)}>
                    מחק
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Input
                placeholder="שם קטגוריה"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="תקציב"
                value={newCategoryBudget}
                onChange={(e) => setNewCategoryBudget(e.target.value)}
                className="w-28"
              />
              <Button onClick={handleAddCategory}>הוסף</Button>
            </div>
          </div>
        </Card>

        {/* Monthly Settings */}
        <Card className="p-6 expense-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">הגדרות חודשיות</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">חודש נוכחי</span>
                <span className="text-sm font-medium">{new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</span>
              </div>
              <Button variant="outline" className="w-full">
                <Calendar className="ml-2" />
                (לא פעיל) בחר חודש לצפייה
              </Button>
              <Button variant="warning" className="w-full" onClick={() => resetCurrentMonth()}>
                <RefreshCw className="ml-2" />
                אפס הוצאות חודש נוכחי
              </Button>
            </div>
          </div>
        </Card>

        {/* Display Settings */}
        <Card className="p-6 expense-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">הגדרות תצוגה</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">פורמט תאריך</p>
                  <p className="text-xs text-muted-foreground">dd/mm/yyyy</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">מטבע</p>
                  <p className="text-xs text-muted-foreground">שקל ישראלי (₪)</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">אזור זמן</p>
                  <p className="text-xs text-muted-foreground">Asia/Jerusalem</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </Card>

        {/* Payment methods removed as requested */}

        {/* Account Actions */}
        <Card className="p-6 expense-card">
          <div className="space-y-4">
            <Button variant="destructive" className="w-full">
              <LogOut className="ml-2" />
              התנתק מהחשבון
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;