import { ReactNode } from 'react';
import { Droplets, Search, TestTube, UserCheck } from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  icon: typeof Droplets;
  color: string;
  status: 'completed' | 'current' | 'pending';
  content: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary-200 via-coral-200 to-success-200" />
      
      <div className="space-y-6">
        {items.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <div key={item.id} className="relative flex gap-4 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                item.status === 'completed'
                  ? 'bg-success-500 text-white shadow-lg shadow-success-200'
                  : item.status === 'current'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-200 scale-110'
                  : 'bg-neutral-200 text-neutral-400'
              }`}>
                <Icon size={18} />
                {item.status === 'current' && (
                  <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-30" />
                )}
              </div>
              
              <div className={`flex-1 rounded-2xl p-4 transition-all duration-300 ${
                item.status === 'pending'
                  ? 'bg-neutral-50 border border-neutral-100 opacity-60'
                  : 'bg-white shadow-soft border border-neutral-100'
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  item.status === 'current'
                    ? 'text-primary-600'
                    : item.status === 'completed'
                    ? 'text-success-600'
                    : 'text-neutral-400'
                }`}>
                  {item.title}
                </h4>
                <div className={item.status === 'pending' ? 'opacity-50' : ''}>
                  {item.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { Timeline, type TimelineItem };
