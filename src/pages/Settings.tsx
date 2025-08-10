import React, { useMemo, useState, useEffect } from 'react';
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
  Database,
  Settings as SettingsIcon,
  User,
  Shield
} from 'lucide-react';
import { Input } from '@/components/ui/hebrew-input';
import { useExpenses } from '@/store/expenses';

const settingsIcons = [SettingsIcon, User, Shield, SettingsIcon, User];

const Settings: React.FC = () => {
  const { budgets, setBudget, setBudgets, renameCategory, deleteCategory, resetCurrentMonth } = useExpenses();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  const [floatingElements, setFloatingElements] = useState<Array<{id: number, top: number, left: number, color: string, icon: any}>>([]);

  useEffect(() => {
    // Create floating elements for the background
    const elements = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      top: Math.random() * 60 + 10,
      left: Math.random() * 70 + 5,
      color: ['#F5D565', '#B7C5FF', '#BEE8D6', '#F9B3D1', '#D9C1F0'][i],
      icon: settingsIcons[i]
    }));
    setFloatingElements(elements);
  }, []);

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
          <h1 className="text-3xl font-bold text-foreground">הגדרות</h1>
          <p className="text-sm opacity-90">נהל את העדפות האפליקציה</p>
        </div>
      </div>

      {/* Content */}
      <div className="container space-y-6 flex-1">
        {/* Budget categories configuration */}
        <Card className="p-6" style={{ 
          backgroundColor: '#D2FBDD', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
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
                    style={{ backgroundColor: '#4BA695', color: 'black' }}
                  />
                  <Input
                    type="number"
                    className="w-28"
                    value={String(value)}
                    onChange={(e) => setBudget(category, Number(e.target.value))}
                    style={{ backgroundColor: '#4BA695', color: 'black' }}
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
                style={{ backgroundColor: '#4BA695', color: 'black' }}
              />
              <Input
                type="number"
                placeholder="תקציב"
                value={newCategoryBudget}
                onChange={(e) => setNewCategoryBudget(e.target.value)}
                className="w-28"
                style={{ backgroundColor: '#4BA695', color: 'black' }}
              />
              <Button onClick={handleAddCategory} style={{ backgroundColor: '#F2BC57', color: 'black' }}>
                הוסף
              </Button>
            </div>
          </div>
        </Card>

        {/* Monthly Settings */}
        <Card className="p-6" style={{ 
          backgroundColor: '#D2FBDD', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
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
        <Card className="p-6" style={{ 
          backgroundColor: '#D2FBDD', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
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

        {/* Account Actions */}
        <Card className="p-6" style={{ 
          backgroundColor: '#D2FBDD', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
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