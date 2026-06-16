import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History, Droplets, Zap, Activity, CheckCircle,
  Clock, ArrowLeft, RotateCcw, User, FileText, XCircle
} from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import Timeline, { TimelineItem } from '../components/Timeline';
import StatusBadge from '../components/StatusBadge';
import { useRepairStore } from '../store/useRepairStore';
import { CustomerChoice, CLEANING_METHODS, FUNCTION_TEST_ITEMS } from '../types';

const customerChoiceOptions: { value: CustomerChoice; label: string; color: string }[] = [
  { value: 'repair', label: '继续维修', color: 'primary' },
  { value: 'abandon', label: '放弃维修', color: 'danger' },
  { value: 'data_export', label: '仅导出资料', color: 'warning' },
  { value: 'pending', label: '待客户决定', color: 'neutral' },
];

const functionStatusColors: Record<string, string> = {
  pass: 'bg-success-100 text-success-700 border-success-300',
  fail: 'bg-danger-100 text-danger-700 border-danger-300',
  partial: 'bg-warning-100 text-warning-700 border-warning-300',
  pending: 'bg-neutral-100 text-neutral-500 border-neutral-300',
};

const functionStatusLabels: Record<string, string> = {
  pass: '通过',
  fail: '失败',
  partial: '部分',
  pending: '待测',
};

export default function FollowupPage() {
  const navigate = useNavigate();
  const {
    order,
    followupRecord,
    quoteEstimate,
    setCleaningResult,
    setSecondInspection,
    setFunctionTestStatus,
    setFunctionTestRemark,
    setCustomerChoice,
    setFinalStatus,
    completeFollowup,
    setCurrentStep,
    resetAll
  } = useRepairStore();

  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    setCurrentStep(5);
  }, [setCurrentStep]);

  const handleComplete = () => {
    completeFollowup();
    setShowCompleteModal(false);
  };

  const handleNewOrder = () => {
    resetAll();
    navigate('/register');
  };

  const canComplete = followupRecord.cleaningResult.method &&
    followupRecord.cleaningResult.duration &&
    followupRecord.secondInspection.currentReading &&
    followupRecord.functionTest.every(t => t.status !== 'pending') &&
    followupRecord.customerChoice !== 'pending';

  const isAbandoned = order.status === 'abandoned' || followupRecord.abandonRecord !== null;

  const timelineItems: TimelineItem[] = [
    {
      id: 'cleaning',
      title: '清洗记录',
      icon: Droplets,
      color: 'primary',
      status: followupRecord.cleaningResult.method ? 'completed' : 'current',
      content: followupRecord.cleaningResult.method ? (
        <div className="text-sm text-neutral-600">
          <p>方式：{followupRecord.cleaningResult.method}</p>
          <p>时长：{followupRecord.cleaningResult.duration}</p>
          {followupRecord.cleaningResult.remark && (
            <p className="mt-1 text-xs text-neutral-500">
              备注：{followupRecord.cleaningResult.remark}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-neutral-400">请记录清洗方式和结果</p>
      )
    },
    {
      id: 'inspection',
      title: '二次检测',
      icon: Zap,
      color: 'warning',
      status: followupRecord.secondInspection.currentReading ? 'completed' :
              followupRecord.cleaningResult.method ? 'current' : 'pending',
      content: followupRecord.secondInspection.currentReading ? (
        <div className="text-sm text-neutral-600">
          <p>电流：{followupRecord.secondInspection.currentReading}</p>
          <p>主板状态：{followupRecord.secondInspection.motherboardStatus}</p>
          {followupRecord.secondInspection.remark && (
            <p className="mt-1 text-xs text-neutral-500">
              备注：{followupRecord.secondInspection.remark}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-neutral-400">请记录二次检测结果</p>
      )
    },
    {
      id: 'function',
      title: '功能测试',
      icon: Activity,
      color: 'coral',
      status: followupRecord.functionTest.every(t => t.status !== 'pending') ? 'completed' :
              followupRecord.secondInspection.currentReading ? 'current' : 'pending',
      content: followupRecord.functionTest.some(t => t.status !== 'pending') ? (
        <div className="flex flex-wrap gap-1.5">
          {followupRecord.functionTest.filter(t => t.status !== 'pending').map((item, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-0.5 rounded-full border ${functionStatusColors[item.status]}`}
            >
              {item.name}：{functionStatusLabels[item.status]}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-400">请进行功能测试</p>
      )
    },
    {
      id: 'choice',
      title: '客户选择',
      icon: User,
      color: 'success',
      status: followupRecord.customerChoice !== 'pending' ? 'completed' :
              followupRecord.functionTest.every(t => t.status !== 'pending') ? 'current' : 'pending',
      content: followupRecord.customerChoice !== 'pending' ? (
        <div className="text-sm text-neutral-600">
          <p>选择：{customerChoiceOptions.find(o => o.value === followupRecord.customerChoice)?.label}</p>
          {followupRecord.finalStatus && (
            <p className="mt-1 text-xs text-neutral-500">
              最终状态：{followupRecord.finalStatus}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-neutral-400">请记录客户最终选择</p>
      )
    }
  ];

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
              <span className="text-sm text-neutral-500">放弃来源</span>
              <span className="font-medium text-neutral-800">
                {followupRecord.abandonRecord.abandonSource === 'quote' ? '报价阶段' : '复检阶段'}
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-success-500 to-primary-500 flex items-center justify-center shadow-lg shadow-success-200">
            <History className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-800">复检追踪</h1>
            <p className="text-sm text-neutral-500">清洗结果与最终确认</p>
          </div>
        </div>
      </div>

      <div className="card fade-in-up stagger-1 mb-5">
        <h3 className="section-title mb-4">
          <Clock size={20} className="text-primary-500" />
          处理进度
        </h3>
        <Timeline items={timelineItems} />
      </div>

      <div className="card fade-in-up stagger-2 mb-5">
        <h3 className="section-title mb-4">
          <Droplets size={20} className="text-primary-500" />
          清洗记录
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label">清洗方式</label>
            <div className="grid grid-cols-2 gap-2">
              {CLEANING_METHODS.map((method) => (
                <button
                  key={method}
                  onClick={() => setCleaningResult({ method })}
                  className={`chip justify-center ${
                    followupRecord.cleaningResult.method === method ? 'chip-active' : 'chip-inactive'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">清洗时长</label>
            <input
              type="text"
              className="input-field"
              placeholder="如：48小时、72小时"
              value={followupRecord.cleaningResult.duration}
              onChange={(e) => setCleaningResult({ duration: e.target.value })}
            />
          </div>
          <div>
            <label className="label">清洗结果</label>
            <div className="grid grid-cols-3 gap-2">
              {['明显改善', '部分改善', '无明显变化'].map((result) => (
                <button
                  key={result}
                  onClick={() => setCleaningResult({ result })}
                  className={`chip justify-center ${
                    followupRecord.cleaningResult.result === result ? 'chip-active' : 'chip-inactive'
                  }`}
                >
                  {result}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              className="input-field min-h-[60px]"
              placeholder="记录清洗过程中的特殊情况..."
              value={followupRecord.cleaningResult.remark}
              onChange={(e) => setCleaningResult({ remark: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="card fade-in-up stagger-3 mb-5">
        <h3 className="section-title mb-4">
          <Zap size={20} className="text-warning-500" />
          二次检测
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label">电流表现 (mA)</label>
            <input
              type="text"
              className="input-field"
              placeholder="如：待机10mA、开机漏电80mA"
              value={followupRecord.secondInspection.currentReading}
              onChange={(e) => setSecondInspection({ currentReading: e.target.value })}
            />
          </div>
          <div>
            <label className="label">主板状态</label>
            <div className="grid grid-cols-3 gap-2">
              {['正常', '轻微短路', '严重短路', '芯片损坏'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSecondInspection({ motherboardStatus: status })}
                  className={`chip justify-center ${
                    followupRecord.secondInspection.motherboardStatus === status ? 'chip-active' : 'chip-inactive'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">是否短路</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSecondInspection({ shortCircuit: true })}
                  className={`flex-1 chip justify-center ${
                    followupRecord.secondInspection.shortCircuit === true ? 'chip-active' : 'chip-inactive'
                  }`}
                >
                  是
                </button>
                <button
                  onClick={() => setSecondInspection({ shortCircuit: false })}
                  className={`flex-1 chip justify-center ${
                    followupRecord.secondInspection.shortCircuit === false ? 'chip-active' : 'chip-inactive'
                  }`}
                >
                  否
                </button>
              </div>
            </div>
            <div>
              <label className="label">腐蚀是否改善</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSecondInspection({ corrosionImproved: true })}
                  className={`flex-1 chip justify-center ${
                    followupRecord.secondInspection.corrosionImproved === true ? 'chip-active' : 'chip-inactive'
                  }`}
                >
                  是
                </button>
                <button
                  onClick={() => setSecondInspection({ corrosionImproved: false })}
                  className={`flex-1 chip justify-center ${
                    followupRecord.secondInspection.corrosionImproved === false ? 'chip-active' : 'chip-inactive'
                  }`}
                >
                  否
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="label">检测备注</label>
            <textarea
              className="input-field min-h-[60px]"
              placeholder="记录检测发现的其他问题..."
              value={followupRecord.secondInspection.remark}
              onChange={(e) => setSecondInspection({ remark: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="card fade-in-up stagger-4 mb-5">
        <h3 className="section-title mb-4">
          <Activity size={20} className="text-coral-500" />
          功能测试
        </h3>
        <div className="space-y-3">
          {followupRecord.functionTest.map((item, index) => (
            <div
              key={index}
              className="p-3 bg-neutral-50 rounded-xl border border-neutral-100"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-neutral-800 text-sm">{item.name}</span>
                <div className="flex gap-1">
                  {(['pass', 'fail', 'partial', 'pending'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFunctionTestStatus(index, status)}
                      className={`text-xs px-2 py-1 rounded-lg font-medium transition-all ${
                        item.status === status
                          ? functionStatusColors[status] + ' ring-1 ring-offset-1'
                          : 'bg-white text-neutral-400 hover:bg-neutral-100'
                      }`}
                    >
                      {functionStatusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>
              {(item.status === 'fail' || item.status === 'partial') && (
                <input
                  type="text"
                  className="input-field text-sm py-2 min-h-[36px] w-full"
                  placeholder="请描述具体问题..."
                  value={item.remark}
                  onChange={(e) => setFunctionTestRemark(index, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card fade-in-up stagger-5 mb-5">
        <h3 className="section-title mb-4">
          <User size={20} className="text-success-500" />
          客户选择
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label">最终选择</label>
            <div className="grid grid-cols-2 gap-2">
              {customerChoiceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCustomerChoice(option.value)}
                  className={`chip justify-center ${
                    followupRecord.customerChoice === option.value ? 'chip-active' : 'chip-inactive'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">最终状态说明</label>
            <input
              type="text"
              className="input-field"
              placeholder="如：维修完成正常使用、放弃收取检测费等"
              value={followupRecord.finalStatus}
              onChange={(e) => setFinalStatus(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="pb-8 fade-in-up stagger-6">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => navigate('/confirm')}
            className="flex-1 btn-outline"
          >
            <ArrowLeft size={18} />
            上一步
          </button>
        </div>

        <button
          onClick={() => setShowCompleteModal(true)}
          disabled={!canComplete}
          className="w-full btn-success text-lg py-4 mb-3 bg-gradient-to-r from-success-500 to-primary-500 text-white hover:from-success-600 hover:to-primary-600 btn"
        >
          <CheckCircle size={20} />
          完成维修单
        </button>

        {!canComplete && (
          <p className="text-center text-xs text-neutral-400 mb-3">
            请填写清洗方式、时长、电流检测、完成所有功能测试并选择客户选择
          </p>
        )}

        <button
          onClick={handleNewOrder}
          className="w-full btn-ghost"
        >
          <RotateCcw size={18} />
          新建维修单
        </button>
      </div>

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success-500 to-primary-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h3 className="font-serif text-xl font-bold text-neutral-800 mb-2">
                确认完成？
              </h3>
              <p className="text-sm text-neutral-600">
                客户选择：<span className="font-semibold text-primary-600">
                  {customerChoiceOptions.find(o => o.value === followupRecord.customerChoice)?.label}
                </span>
              </p>
              {followupRecord.customerChoice === 'abandon' && quoteEstimate && (
                <p className="text-sm text-coral-600 font-medium mt-1">
                  需收取检修费：¥{quoteEstimate.inspectionFee}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 btn-outline"
              >
                取消
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 bg-success-500 text-white btn hover:bg-success-600"
              >
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}

      {order.status === 'completed' && followupRecord.completedAt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md animate-scale-in text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success-500 to-primary-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-success-200">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-neutral-800 mb-3">
              维修单已完成！
            </h3>
            <p className="text-neutral-600 mb-2">
              客户：{order.customerName || '未填写'}
            </p>
            <p className="text-neutral-500 text-sm mb-6">
              完成时间：{new Date(followupRecord.completedAt).toLocaleString('zh-CN')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleNewOrder}
                className="flex-1 btn-primary"
              >
                <FileText size={18} />
                新建维修单
              </button>
            </div>
          </div>
        </div>
      )}

      {order.status === 'abandoned' && followupRecord.completedAt && followupRecord.abandonRecord && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md animate-scale-in text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-danger-500 to-warning-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-danger-200">
              <XCircle size={40} className="text-white" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-neutral-800 mb-3">
              已按放弃维修结案
            </h3>
            <p className="text-neutral-600 mb-2">
              客户：{order.customerName || '未填写'}
            </p>
            <p className="text-neutral-500 text-sm mb-4">
              结案时间：{new Date(followupRecord.completedAt).toLocaleString('zh-CN')}
            </p>
            <div className="bg-danger-50 rounded-xl p-4 mb-4 mx-4">
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
