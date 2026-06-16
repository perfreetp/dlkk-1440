import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Sparkles } from 'lucide-react';
import { QuoteTier } from '../types';

interface QuoteCardProps {
  tier: QuoteTier;
  tierType: 'low' | 'mid' | 'high';
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const tierConfig = {
  low: {
    borderColor: 'border-success-300',
    bgColor: 'bg-success-50',
    accentColor: 'text-success-600',
    accentBg: 'bg-success-100',
    tag: '性价比首选'
  },
  mid: {
    borderColor: 'border-primary-300',
    bgColor: 'bg-primary-50',
    accentColor: 'text-primary-600',
    accentBg: 'bg-primary-100',
    tag: '推荐方案'
  },
  high: {
    borderColor: 'border-coral-300',
    bgColor: 'bg-coral-50',
    accentColor: 'text-coral-600',
    accentBg: 'bg-coral-100',
    tag: '全面保障'
  }
};

export default function QuoteCard({ tier, tierType, isSelected, onSelect, disabled = false }: QuoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = tierConfig[tierType];

  return (
    <div
      onClick={!disabled ? onSelect : undefined}
      className={`card card-hover relative transition-all duration-300 border-2 ${
        isSelected
          ? `${config.borderColor} shadow-lg scale-[1.02]`
          : 'border-transparent opacity-80 hover:opacity-100'
      } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {isSelected && (
        <div className={`absolute -top-2 -right-2 w-8 h-8 ${config.accentBg} rounded-full flex items-center justify-center shadow-md animate-bounce`}>
          <Check size={18} className={config.accentColor} />
        </div>
      )}
      
      {tierType === 'mid' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-coral-500 to-primary-500 text-white text-xs font-semibold rounded-full shadow-md">
            <Sparkles size={12} />
            {config.tag}
          </span>
        </div>
      )}

      <div className="pt-2">
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-serif text-xl font-bold ${config.accentColor}`}>
            {tier.name}
          </h3>
          <div className="text-right">
            <div className={`text-2xl font-bold ${config.accentColor}`}>
              ¥{tier.totalMin}
            </div>
            <div className="text-xs text-neutral-500">
              ~ ¥{tier.totalMax}</div>
          </div>
        </div>

        <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
          {tier.description}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="w-full flex items-center justify-between py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          <span>查看明细</span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {expanded && (
          <div className="space-y-2 pt-2 border-t border-neutral-100 animate-fade-in">
            {tier.items.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between py-2"
              >
                <div className="flex-1">
                  <div className="font-medium text-neutral-800 text-sm">
                    {item.name}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
                <div className="text-sm font-semibold text-neutral-700">
                  ¥{item.price}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
