import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'בית' },
    { to: '/budgets', icon: Target, label: 'תקציבים' },
    { to: '/history', icon: History, label: 'היסטוריה' },
    { to: '/settings', icon: Settings, label: 'הגדרות' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card text-card-foreground border-t border-border shadow-lg z-50">
      <div className="container">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition-all",
                  isActive
                    ? "text-accent-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};