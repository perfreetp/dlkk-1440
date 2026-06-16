import { useState } from 'react';
import { MessageCircle, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { SpeechTemplate } from '../types';

interface SpeechBubbleProps {
  template: SpeechTemplate;
  onCopy?: (content: string) => void;
}

export default function SpeechBubble({ template, onCopy }: SpeechBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(template.content);
    setCopied(true);
    onCopy?.(template.content);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 to-coral-50 rounded-2xl p-4 border border-primary-100 hover:shadow-soft transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <MessageCircle size={16} className="text-primary-600" />
          </div>
          <div>
            <span className="text-xs text-primary-600 font-medium px-2 py-0.5 bg-primary-100 rounded-full">
              {template.category}
            </span>
            <h4 className="font-semibold text-neutral-800 mt-1 text-sm">
              {template.title}
            </h4>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
            copied
              ? 'bg-success-100 text-success-600'
              : 'bg-white text-neutral-600 hover:bg-primary-50 hover:text-primary-600'
          }`}
        >
          {copied ? (
            <>
              <Check size={14} />
              已复制
            </>
          ) : (
            <>
              <Copy size={14} />
              复制
            </>
          )}
        </button>
      </div>
      
      <div className="relative">
        <p
          className={`text-sm text-neutral-700 leading-relaxed bg-white/60 rounded-xl p-3 ${
            !expanded && template.content.length > 100 ? 'line-clamp-3' : ''
          }`}
        >
          {template.content}
        </p>
        {template.content.length > 100 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary-600 mt-2 hover:text-primary-700"
          >
            {expanded ? (
              <>
                收起 <ChevronUp size={14} />
              </>
            ) : (
              <>
                展开全文 <ChevronDown size={14} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
