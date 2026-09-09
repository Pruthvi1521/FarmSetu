import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  BadgePercent,
  Receipt,
  BarChart3,
  UserCheck
} from 'lucide-react';
import { NotificationBell } from '../common/NotificationBell';

export const FarmerNavigation: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/farmer', icon: LayoutDashboard, end: true },
    { label: 'Market Intelligence', path: '/farmer/intelligence', icon: TrendingUp },
    { label: 'My Sale Lots', path: '/farmer/lots', icon: Package },
    { label: 'Offers', path: '/farmer/offers', icon: BadgePercent },
    { label: 'Transactions', path: '/farmer/transactions', icon: Receipt },
    { label: 'Analytics', path: '/farmer/analytics', icon: BarChart3 },
    { label: 'Profile', path: '/farmer/profile', icon: UserCheck }
  ];

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-14 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Nav links */}
          <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Notification bell */}
          <div className="flex-shrink-0 pl-2">
            <NotificationBell />
          </div>
        </div>
      </div>
    </nav>
  );
};
