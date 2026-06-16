import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, RefreshCw, Clock, FileText, AlertTriangle, Ban, CheckCircle, XCircle, FileDown, Copy, Printer, X } from 'lucide-react';
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
    waterDamageInfo,
    setQuoteInspectionFee,
    generateQuoteEstimate,
    setCustomerConfirm,
    setCurrentStep,
    setStatus,
    setAbandonRecord,
    resetAll,
    saveCurrentOrder
  } = useRepairStore();

  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [abandonReason, setAbandonReason] = useState('');
  const [showAbandonSuccess, setShowAbandonSuccess] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  useEffect(() => {
    setCurrentStep(3);
    if (!quoteEstimate) {
      generateQuoteEstimate();
    }
  }, [setCurrentStep, quoteEstimate, generateQuoteEstimate]);

  const canProceed = customerConfirm.selectedTier !== null;

  const handleNext = () => {
    saveCurrentOrder();
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
          <button
            onClick={() => setShowQuoteModal(true)}
            className="btn-ghost"
          >
            <FileDown size={18} />
            生成报价单
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

      {showQuoteModal && quoteEstimate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white rounded-t-3xl z-10 px-6 pt-6 pb-3 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-neutral-800">
                  进水机检修报价单
                </h3>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                >
                  <X size={16} className="text-neutral-500" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4" id="quote-sheet-content">
              <div className="text-center mb-4">
                <h2 className="font-serif text-2xl font-bold text-neutral-800">进水机检修报价单</h2>
                <p className="text-sm text-neutral-500 mt-1">门店名称：__________</p>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">客户姓名</span>
                    <span className="font-medium text-neutral-800">{order.customerName || '未填写'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">手机型号</span>
                    <span className="font-medium text-neutral-800">{order.phoneModel || '未填写'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">进水时间</span>
                    <span className="font-medium text-neutral-800">{waterDamageInfo.waterTime || '未填写'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">液体类型</span>
                    <span className="font-medium text-neutral-800">{waterDamageInfo.liquidType || '未填写'}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-100">
                      <th className="text-left p-2 rounded-tl-lg font-medium text-neutral-700">方案</th>
                      <th className="text-left p-2 font-medium text-neutral-700">维修项目</th>
                      <th className="text-right p-2 rounded-tr-lg font-medium text-neutral-700">价格范围</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      { tier: quoteEstimate.lowTier, label: '经济档' },
                      { tier: quoteEstimate.midTier, label: '标准档' },
                      { tier: quoteEstimate.highTier, label: '全面档' }
                    ] as const).map(({ tier, label }, idx) => (
                      <tr key={idx} className="border-t border-neutral-100">
                        <td className="p-2 font-medium text-neutral-800 align-top">{label}</td>
                        <td className="p-2 text-neutral-600 align-top">
                          {tier.items.filter(i => i.included).map(i => i.name).join('、')}
                        </td>
                        <td className="p-2 text-right font-semibold text-coral-600 align-top whitespace-nowrap">
                          ¥{tier.totalMin} ~ ¥{tier.totalMax}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {quoteEstimate.hasPendingItems && (
                <div className="bg-warning-50 rounded-xl p-4 mb-4 border border-warning-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-warning-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning-800">待拆检风险说明</p>
                      <p className="text-xs text-warning-700 mt-1">
                        部分检测项目需拆机后方可确认，实际维修过程中可能发现额外损坏或需要更换的零部件，届时会产生额外费用。我们会在发现新问题时及时与您沟通确认，不会擅自增加费用。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl mb-4">
                <div>
                  <p className="text-sm text-primary-700">检修费</p>
                  <p className="text-xs text-primary-500 mt-0.5">选择维修可抵扣</p>
                </div>
                <p className="text-xl font-bold text-primary-600">¥{quoteEstimate.inspectionFee}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl mb-4">
                <span className="text-sm text-neutral-600">报价有效期</span>
                <span className="text-sm font-medium text-neutral-800">{quoteEstimate.validDays}天（至 {quoteEstimate.validUntil}）</span>
              </div>

              <p className="text-center text-xs text-neutral-400 mt-4">
                以上报价仅供参考，最终费用以实际检测为准
              </p>
            </div>

            <div className="sticky bottom-0 bg-white rounded-b-3xl px-6 py-4 border-t border-neutral-100">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const includedItems = (tier: typeof quoteEstimate.lowTier) =>
                      tier.items.filter(i => i.included).map(i => i.name).join('、');
                    const text = [
                      '📱【进水机检修报价】',
                      `客户：${order.customerName || '未填写'} | 机型：${order.phoneModel || '未填写'}`,
                      `进水情况：${waterDamageInfo.waterTime || '未填写'} | ${waterDamageInfo.liquidType || '未填写'}`,
                      '',
                      `💰 经济档：¥${quoteEstimate.lowTier.totalMin}-${quoteEstimate.lowTier.totalMax}`,
                      includedItems(quoteEstimate.lowTier),
                      '',
                      `💎 标准档：¥${quoteEstimate.midTier.totalMin}-${quoteEstimate.midTier.totalMax}`,
                      includedItems(quoteEstimate.midTier),
                      '',
                      `👑 全面档：¥${quoteEstimate.highTier.totalMin}-${quoteEstimate.highTier.totalMax}`,
                      includedItems(quoteEstimate.highTier),
                      '',
                      quoteEstimate.hasPendingItems ? '⚠️ 待拆检风险：部分项目需拆机确认，可能产生额外费用' : '',
                      '',
                      `🔍 检修费：¥${quoteEstimate.inspectionFee}`,
                      `📅 报价有效期至：${quoteEstimate.validUntil}`,
                      '',
                      '以上报价仅供参考，最终费用以实际检测为准。'
                    ].filter(Boolean).join('\n');

                    navigator.clipboard.writeText(text).then(() => {
                      setCopyToast(true);
                      setTimeout(() => setCopyToast(false), 2000);
                    });
                  }}
                  className="flex-1 btn-outline flex items-center justify-center gap-2"
                >
                  <Copy size={16} />
                  复制微信话术
                </button>
                <button
                  onClick={() => {
                    const content = document.getElementById('quote-sheet-content');
                    if (!content) return;
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) return;
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>进水机检修报价单</title>
                        <style>
                          * { margin: 0; padding: 0; box-sizing: border-box; }
                          body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; padding: 40px; color: #333; }
                          h2 { text-align: center; font-size: 24px; margin-bottom: 4px; }
                          .store-name { text-align: center; font-size: 14px; color: #888; margin-bottom: 20px; }
                          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; background: #f7f7f7; padding: 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }
                          .info-grid .row { display: flex; justify-content: space-between; }
                          .info-grid .label { color: #888; }
                          .info-grid .value { font-weight: 500; }
                          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px; }
                          th { background: #f0f0f0; text-align: left; padding: 8px; font-weight: 500; }
                          td { padding: 8px; border-top: 1px solid #eee; }
                          .price { text-align: right; font-weight: 600; color: #e74c3c; white-space: nowrap; }
                          .warning-box { background: #fff8e1; border: 1px solid #ffe082; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
                          .warning-box .title { font-weight: 600; color: #e65100; margin-bottom: 4px; }
                          .fee-box { display: flex; justify-content: space-between; align-items: center; background: #e3f2fd; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px; }
                          .fee-box .label { font-size: 14px; color: #1565c0; }
                          .fee-box .value { font-size: 20px; font-weight: 700; color: #1565c0; }
                          .validity { display: flex; justify-content: space-between; background: #f7f7f7; padding: 10px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
                          .footer { text-align: center; font-size: 12px; color: #aaa; margin-top: 24px; }
                          @media print { body { padding: 20px; } }
                        </style>
                      </head>
                      <body>
                        ${content.innerHTML}
                        <script>window.onload = function() { window.print(); }</script>
                      </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }}
                  className="flex-1 btn-outline flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  打印预览
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {copyToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-fade-in">
          <div className="bg-neutral-800 text-white text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <CheckCircle size={14} />
            已复制
          </div>
        </div>
      )}
    </div>
  );
}
