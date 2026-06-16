import { NavLink } from 'react-router-dom';
import { ClipboardList, Search, Calculator, UserCheck, History, ListTodo } from 'lucide-react';

const navItems = [
  { path: '/orders', label: '工单', icon: ListTodo, step: 0 },
  { path: '/register', label: '登记', icon: ClipboardList, step: 1 },
  { path: '/inspection', label: '检查', icon: Search, step: 2 },
  { path: '/quote', label: '报价', icon: Calculator, step: 3 },
  { path: '/followup', label: '追踪', icon: History, step: 5 },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map(({ path, label, icon: Icon, step }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-200 ${
                isActive
                  ? 'text-primary-600'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-all duration-200 ${
                      isActive ? 'scale-110' : ''
                    }`}
                  />
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-coral-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-all duration-200 ${
                    isActive ? 'font-semibold' : ''
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
