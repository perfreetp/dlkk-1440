import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, ShieldAlert, MessageCircle, BookOpen, Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import SpeechBubble from '../components/SpeechBubble';
import CaseCard from '../components/CaseCard';
import { useRepairStore } from '../store/useRepairStore';
import { speechTemplates, categories } from '../data/speechTemplates';
import { similarCases } from '../data/similarCases';

const boundaryItems = [
  {
    icon: ShieldAlert,
    title: '先检测后报价',
    content: '我们先对手机进行全面清洗和检测，确定具体故障后再给出准确报价。如果检测后您觉得不划算，可以选择放弃维修，只需支付检测费即可。',
    color: 'primary'
  },
  {
    icon: ShieldAlert,
    title: '可能追加费用',
    content: '进水手机情况复杂，有些问题需要清洗后才能发现。如果检测中发现新的故障需要额外费用，我们会第一时间联系您，征得您同意后才会继续维修。',
    color: 'warning'
  },
  {
    icon: ShieldAlert,
    title: '无法保证完全恢复',
    content: '由于进水腐蚀的不可逆性，我们不能保证手机能100%恢复到进水前的状态。部分功能可能会有遗留问题，我们会尽量修复，但希望您能理解。',
    color: 'danger'
  },
  {
    icon: ShieldAlert,
    title: '维修周期说明',
    content: '进水机需要先清洗干燥48-72小时，再检测维修，整个过程通常需要3-5天。如果需要订购配件，时间会相应延长，我们会每天跟您同步进度。',
    color: 'coral'
  }
];

export default function ConfirmPage() {
  const navigate = useNavigate();
  const {
    order,
    customerConfirm,
    setCustomerConfirm,
    confirmCustomer,
    setCurrentStep,
    quoteEstimate
  } = useRepairStore();

  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [showCases, setShowCases] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  const canProceed = customerConfirm.understood && customerConfirm.customerSignature;

  const handleNext = () => {
    confirmCustomer();
    setCurrentStep(5);
    navigate('/followup');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedText(content);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredTemplates = activeCategory === '全部'
    ? speechTemplates
    : speechTemplates.filter(t => t.category === activeCategory);

  const tierName = customerConfirm.selectedTier === 'low' ? '经济档' :
                   customerConfirm.selectedTier === 'mid' ? '标准档' : '全面档';

  const tierPrice = customerConfirm.selectedTier && quoteEstimate
    ? quoteEstimate[`${customerConfirm.selectedTier}Tier`]
    : null;

  return (
    <div className="page-container">
      <StepIndicator currentStep={order.currentStep} />

      <div className="fade-in-up stagger-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center shadow-lg shadow-primary-200">
            <UserCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-800">客户确认</h1>
            <p className="text-sm text-neutral-500">边界说明与客户确认</p>
          </div>
        </div>
      </div>

      {tierPrice && (
        <div className="card fade-in-up stagger-1 mb-5 bg-gradient-to-r from-primary-50 to-coral-50 border-2 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600 font-medium">已选方案</p>
              <p className="text-xl font-bold text-primary-700">{tierName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">预估费用</p>
              <p className="text-xl font-bold text-coral-500">
                ¥{tierPrice.totalMin} ~ ¥{tierPrice.totalMax}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card fade-in-up stagger-2 mb-5">
        <h3 className="section-title mb-4">
          <ShieldAlert size={20} className="text-warning-500" />
          重要边界说明
        </h3>
        <div className="space-y-4">
          {boundaryItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-4 bg-neutral-50 rounded-xl border border-neutral-100"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.color === 'primary' ? 'bg-primary-100' :
                    item.color === 'warning' ? 'bg-warning-100' :
                    item.color === 'danger' ? 'bg-danger-100' : 'bg-coral-100'
                  }`}>
                    <Icon size={16} className={
                      item.color === 'primary' ? 'text-primary-600' :
                      item.color === 'warning' ? 'text-warning-600' :
                      item.color === 'danger' ? 'text-danger-600' : 'text-coral-600'
                    } />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 text-sm mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card fade-in-up stagger-3 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">
            <BookOpen size={20} className="text-primary-500" />
            同类案例参考
          </h3>
          <button
            onClick={() => setShowCases(!showCases)}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            {showCases ? '收起' : '查看'}
            {showCases ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        {showCases && (
          <div className="space-y-3 animate-fade-in">
            {similarCases.slice(0, 3).map((caseItem) => (
              <CaseCard key={caseItem.id} caseData={caseItem} />
            ))}
          </div>
        )}
      </div>

      <div className="card fade-in-up stagger-4 mb-5">
        <h3 className="section-title mb-4">
          <MessageCircle size={20} className="text-coral-500" />
          常见话术模板
        </h3>
        <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-neutral-100">
          <button
            onClick={() => setActiveCategory('全部')}
            className={`chip text-xs ${
              activeCategory === '全部' ? 'chip-active' : 'chip-inactive'
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`chip text-xs ${
                activeCategory === cat ? 'chip-active' : 'chip-inactive'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
          {filteredTemplates.map((template) => (
            <SpeechBubble
              key={template.id}
              template={template}
              onCopy={handleCopy}
            />
          ))}
        </div>
      </div>

      <div className="card fade-in-up stagger-5 mb-5">
        <h3 className="section-title mb-4">
          <Check size={20} className="text-success-500" />
          客户确认
        </h3>

        <div className="mb-4">
          <label className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl cursor-pointer hover:bg-primary-100 transition-colors">
            <input
              type="checkbox"
              checked={customerConfirm.understood}
              onChange={(e) => setCustomerConfirm({ understood: e.target.checked })}
              className="w-5 h-5 mt-0.5 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <p className="text-sm font-medium text-neutral-800">
                我已向客户充分说明以上边界和风险
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                客户理解进水维修的特殊性、费用范围和时间周期
              </p>
            </div>
          </label>
        </div>

        <div className="mb-4">
          <label className="label">客户签名确认</label>
          <input
            type="text"
            className="input-field"
            placeholder="请输入客户姓名确认"
            value={customerConfirm.customerSignature}
            onChange={(e) => setCustomerConfirm({ customerSignature: e.target.value })}
          />
        </div>

        <div>
          <label className="label">备注（可选）</label>
          <textarea
            className="input-field min-h-[80px]"
            placeholder="记录客户特殊要求或其他说明..."
            value={customerConfirm.notes}
            onChange={(e) => setCustomerConfirm({ notes: e.target.value })}
          />
        </div>
      </div>

      <div className="pb-8 fade-in-up stagger-6">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => navigate('/quote')}
            className="flex-1 btn-outline"
          >
            上一步
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="w-full btn-secondary text-lg py-4"
        >
          进入复检追踪
        </button>
        {!canProceed && (
          <p className="text-center text-xs text-neutral-400 mt-2">
            请确认已向客户说明并取得客户签名
          </p>
        )}
      </div>

      {copiedText && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-neutral-800 text-white px-4 py-2 rounded-full text-sm shadow-lg animate-fade-in z-50">
          <Copy size={14} className="inline mr-1" />
          已复制到剪贴板
        </div>
      )}
    </div>
  );
}
