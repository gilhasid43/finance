import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Target, Clock3, Cog, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: HomeIcon, label: 'בית', activeColor: '#F2BC57' },
    { to: '/budgets', icon: Target, label: 'תקציבים', activeColor: '#94A5E2' },
    { to: '/history', icon: Clock3, label: 'היסטוריה', activeColor: '#479C95' },
    { to: '/settings', icon: Cog, label: 'הגדרות', activeColor: '#F29BE4' },
  ];

  return (
    <div className="floating-nav">
      <nav className="floating-nav-inner">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all",
                isActive
                  ? "text-black"
                  : "text-black"
              )}
              style={isActive ? { backgroundColor: item.activeColor } : {}}
            >
              <item.icon className="h-6 w-6" strokeWidth={2.2} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};