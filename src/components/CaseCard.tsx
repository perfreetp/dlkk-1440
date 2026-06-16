import { Smartphone, Wrench, CheckCircle, TrendingUp } from 'lucide-react';
import { SimilarCase } from '../types';

interface CaseCardProps {
  caseData: SimilarCase;
}

export default function CaseCard({ caseData }: CaseCardProps) {
  const getSuccessColor = (rate: number) => {
    if (rate >= 80) return 'text-success-600 bg-success-100';
    if (rate >= 60) return 'text-warning-600 bg-warning-100';
    return 'text-danger-600 bg-danger-100';
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft hover:shadow-card transition-all duration-300 border border-neutral-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-coral-100 flex items-center justify-center">
            <Smartphone size={20} className="text-primary-600" />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-800">{caseData.phoneModel}</h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSuccessColor(caseData.successRate)}`}>
              <TrendingUp size={12} className="inline mr-1" />
              成功率 {caseData.successRate}%
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-coral-500">¥{caseData.cost}</div>
          <div className="text-xs text-neutral-400">维修费用</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-warning-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Wrench size={12} className="text-warning-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">进水情况</p>
            <p className="text-sm text-neutral-700">{caseData.waterDamage}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Wrench size={12} className="text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">维修方案</p>
            <p className="text-sm text-neutral-700">{caseData.solution}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle size={12} className="text-success-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">修复结果</p>
            <p className="text-sm text-neutral-700">{caseData.result}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
