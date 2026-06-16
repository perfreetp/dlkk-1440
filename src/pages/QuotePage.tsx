import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, RefreshCw, Clock, FileText, AlertTriangle, Ban, CheckCircle, XCircle } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import QuoteCard from '../components/QuoteCard';
import { useRepairStore } from '../store/useRepairStore';

export default function QuotePage() {
  const navigate = useNavigate();
  const {
    order,
    quoteEstimate,
    inspectionRecord,
    customerConfirm,
    followupRecord,
    setQuoteInspectionFee,
    generateQuoteEstimate,
    setCustomerConfirm,
    setCurrentStep,
    setStatus,
    setAbandonRecord,
    resetAll
  } = useRepairStore();

  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [abandonReason, setAbandonReason] = useState('');
  const [showAbandonSuccess, setShowAbandonSuccess] = useState(false);

  useEffect(() => {
    setCurrentStep(3);
    if (!quoteEstimate) {
      generateQuoteEstimate();
    }
  }, [setCurrentStep, quoteEstimate, generateQuoteEstimate]);

  const canProceed = customerConfirm.selectedTier !== null;

  const handleNext = () => {
    setStatus('confirmed');
    setCurrentStep(4);
    navigate('/confirm');
  };

  const handleRegenerate = () => {
    generateQuoteEstimate();
  };

  const handleAbandon = () => {
    if (quoteEstimate) {
      setAbandonRecord({
        reason: abandonReason || '客户选择放弃维修',
        inspectionFee: quoteEstimate.inspectionFee,
        abandonSource: 'quote'
      });
    }
    setShowAbandonModal(false);
    setShowAbandonSuccess(true);
  };

  const handleNewOrder = () => {
    resetAll();
    navigate('/register');
  };

  const isAbandoned = order.status === 'abandoned' || followupRecord.abandonRecord !== null;

  if (!quoteEstimate) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">正在生成报价...</p>
        </div>
      </div>
    );
  }

  if (isAbandoned && followupRecord.abandonRecord) {
    return (
      <div className="page-container flex items-center justify-center py-12">
        <div className="card text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-danger-500 to-warning-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-danger-200">
            <XCircle size={40} className="text-white" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-neutral-800 mb-4">
            已按放弃维修结案
          </h2>
          <div className="bg-neutral-50 rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">客户姓名</span>
              <span className="font-medium text-neutral-800">{order.customerName || '未填写'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">手机型号</span>
              <span className="font-medium text-neutral-800">{order.phoneModel || '未填写'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">登记时间</span>
              <span className="font-medium text-neutral-800">
                {new Date(order.createdAt).toLocaleString('zh-CN')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">放弃时间</span>
              <span className="font-medium text-neutral-800">
                {new Date(followupRecord.abandonRecord.abandonedAt).toLocaleString('zh-CN')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">检修费</span>
              <span className="font-bold text-coral-600 text-lg">
                ¥{followupRecord.abandonRecord.inspectionFee}
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-200">
              <p className="text-sm text-neutral-500 mb-1">放弃原因</p>
              <p className="font-medium text-neutral-800">
                {followupRecord.abandonRecord.reason}
              </p>
            </div>
          </div>
          <button
            onClick={handleNewOrder}
            className="w-full btn-primary"
          >
            <FileText size={18} />
            新建维修单
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <StepIndicator currentStep={order.currentStep} />

      <div className="fade-in-up stagger-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-500 to-primary-500 flex items-center justify-center shadow-lg shadow-coral-200">
            <Calculator className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-800">分级报价</h1>
            <p className="text-sm text-neutral-500">根据检查结果生成预估方案</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-warning-50 to-coral-50 rounded-2xl p-4 mb-5 border border-warning-200 fade-in-up stagger-1">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-warning-600" />
          </div>
          <div>
            <p className="text-sm text-warning-800 font-medium">价格说明</p>
            <p className="text-xs text-warning-700 mt-1">
              以下为预估价格范围，最终费用需根据清洗后的实际情况确定。我们会在发现新问题时及时与您沟通，不会擅自增加费用。
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="fade-in-up stagger-2">
          <QuoteCard
            tier={quoteEstimate.lowTier}
            tierType="low"
            isSelected={customerConfirm.selectedTier === 'low'}
            onSelect={() => setCustomerConfirm({ selectedTier: 'low' })}
          />
        </div>
        <div className="fade-in-up stagger-3">
          <QuoteCard
            tier={quoteEstimate.midTier}
            tierType="mid"
            isSelected={customerConfirm.selectedTier === 'mid'}
            onSelect={() => setCustomerConfirm({ selectedTier: 'mid' })}
          />
        </div>
        <div className="fade-in-up stagger-4">
          <QuoteCard
            tier={quoteEstimate.highTier}
            tierType="high"
            isSelected={customerConfirm.selectedTier === 'high'}
            onSelect={() => setCustomerConfirm({ selectedTier: 'high' })}
          />
        </div>
      </div>

      <div className="card fade-in-up stagger-5 mb-5">
        <h3 className="section-title mb-3">
          <FileText size={20} className="text-primary-500" />
          检修费用
        </h3>
        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
          <div>
            <p className="text-sm text-neutral-600">检测评估费用</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              如选择维修，此费用可抵扣维修费
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-coral-500">
              ¥
              <input
                type="number"
                className="w-20 text-right bg-transparent border-b-2 border-coral-300 focus:border-coral-500 outline-none"
                value={quoteEstimate.inspectionFee}
                onChange={(e) => setQuoteInspectionFee(Number(e.target.value))}
              />
            </span>
          </div>
        </div>
      </div>

      <div className="card fade-in-up stagger-6 mb-5">
        <h3 className="section-title mb-3">
          <Clock size={20} className="text-primary-500" />
          报价有效期
        </h3>
        <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
          <div>
            <p className="text-sm text-primary-700">本报价有效期</p>
            <p className="text-xs text-primary-500 mt-0.5">
              超过有效期价格可能会有变动
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary-600">{quoteEstimate.validDays} 天</p>
            <p className="text-xs text-primary-500">至 {quoteEstimate.validUntil}</p>
          </div>
        </div>
      </div>

      <div className="pb-8 fade-in-up stagger-7">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => navigate('/inspection')}
            className="flex-1 btn-outline"
          >
            上一步
          </button>
          <button
            onClick={handleRegenerate}
            className="btn-ghost"
          >
            <RefreshCw size={18} />
            重新生成
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="w-full btn-primary text-lg py-4 mb-3"
        >
          下一步：客户确认
        </button>

        <button
          onClick={() => setShowAbandonModal(true)}
          className="w-full btn text-danger-600 border-2 border-danger-200 hover:bg-danger-50"
        >
          <Ban size={18} />
          客户放弃维修
        </button>

        {!canProceed && (
          <p className="text-center text-xs text-neutral-400 mt-2">
            请选择一个报价方案
          </p>
        )}
      </div>

      {showAbandonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-scale-in">
            <h3 className="font-serif text-xl font-bold text-neutral-800 mb-4">
              登记放弃维修
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              请告知客户放弃原因，收取检修费 <span className="font-bold text-coral-500">¥{quoteEstimate.inspectionFee}</span>
            </p>
            <div className="mb-4">
              <label className="label">放弃原因（可选）</label>
              <textarea
                className="input-field min-h-[80px]"
                placeholder="请输入放弃原因..."
                value={abandonReason}
                onChange={(e) => setAbandonReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAbandonModal(false)}
                className="flex-1 btn-outline"
              >
                取消
              </button>
              <button
                onClick={handleAbandon}
                className="flex-1 bg-danger-500 text-white btn hover:bg-danger-600"
              >
                确认放弃
              </button>
            </div>
          </div>
        </div>
      )}

      {showAbandonSuccess && followupRecord.abandonRecord && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md animate-scale-in text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-danger-500 to-warning-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-danger-200">
              <XCircle size={40} className="text-white" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-neutral-800 mb-3">
              已登记放弃维修
            </h3>
            <p className="text-neutral-600 mb-2">
              客户：{order.customerName || '未填写'}
            </p>
            <div className="bg-danger-50 rounded-xl p-4 mb-6 mx-4">
              <p className="text-sm text-danger-700 mb-2">需收取检修费</p>
              <p className="text-3xl font-bold text-coral-600">
                ¥{followupRecord.abandonRecord.inspectionFee}
              </p>
            </div>
            <div className="text-left bg-neutral-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-neutral-500 mb-1">放弃原因</p>
              <p className="text-sm text-neutral-800">
                {followupRecord.abandonRecord.reason}
              </p>
            </div>
            <button
              onClick={handleNewOrder}
              className="w-full btn-primary"
            >
              <FileText size={18} />
              新建维修单
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
