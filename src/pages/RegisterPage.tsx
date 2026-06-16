import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Droplets, Clock, Smartphone, User, Phone, Zap, Activity } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import { useRepairStore } from '../store/useRepairStore';
import { WATER_TIME_OPTIONS, LIQUID_TYPE_OPTIONS, TREATMENT_OPTIONS, SYMPTOM_OPTIONS } from '../types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const {
    order,
    waterDamageInfo,
    setOrderInfo,
    setWaterDamageInfo,
    toggleTreatment,
    toggleSymptom,
    setCurrentStep,
    setStatus
  } = useRepairStore();

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const canProceed = order.phoneModel && order.customerName && 
    waterDamageInfo.waterTime && waterDamageInfo.liquidType &&
    waterDamageInfo.symptoms.length > 0;

  const handleNext = () => {
    setStatus('inspecting');
    setCurrentStep(2);
    navigate('/inspection');
  };

  return (
    <div className="page-container">
      <StepIndicator currentStep={order.currentStep} />

      <div className="fade-in-up stagger-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
            <ClipboardList className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-800">快速登记</h1>
            <p className="text-sm text-neutral-500">记录进水情况和客户信息</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="card fade-in-up stagger-1">
          <h3 className="section-title">
            <User size={20} className="text-primary-500" />
            客户信息
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">客户姓名</label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入客户姓名"
                value={order.customerName}
                onChange={(e) => setOrderInfo({ customerName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">
                <Phone size={14} className="inline mr-1" />
                联系电话
              </label>
              <input
                type="tel"
                className="input-field"
                placeholder="请输入联系电话"
                value={order.contact}
                onChange={(e) => setOrderInfo({ contact: e.target.value })}
              />
            </div>
            <div>
              <label className="label">
                <Smartphone size={14} className="inline mr-1" />
                手机型号
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="如：iPhone 13 Pro、华为 Mate 40"
                value={order.phoneModel}
                onChange={(e) => setOrderInfo({ phoneModel: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="card fade-in-up stagger-2">
          <h3 className="section-title">
            <Droplets size={20} className="text-coral-500" />
            进水情况
          </h3>
          <div className="space-y-5">
            <div>
              <label className="label">
                <Clock size={14} className="inline mr-1" />
                进水时间
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WATER_TIME_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setWaterDamageInfo({ waterTime: option })}
                    className={`chip justify-center ${
                      waterDamageInfo.waterTime === option ? 'chip-active' : 'chip-inactive'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                <Droplets size={14} className="inline mr-1" />
                液体类型
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LIQUID_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setWaterDamageInfo({ liquidType: option })}
                    className={`chip justify-center ${
                      waterDamageInfo.liquidType === option ? 'chip-active' : 'chip-inactive'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <Zap size={14} className="inline mr-1" />
                  进水后是否开机
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWaterDamageInfo({ poweredOn: true })}
                    className={`flex-1 chip justify-center ${
                      waterDamageInfo.poweredOn === true ? 'chip-active' : 'chip-inactive'
                    }`}
                  >
                    是
                  </button>
                  <button
                    onClick={() => setWaterDamageInfo({ poweredOn: false })}
                    className={`flex-1 chip justify-center ${
                      waterDamageInfo.poweredOn === false ? 'chip-active' : 'chip-inactive'
                    }`}
                  >
                    否
                  </button>
                </div>
              </div>
              <div>
                <label className="label">
                  <Zap size={14} className="inline mr-1" />
                  进水后是否充电
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWaterDamageInfo({ charged: true })}
                    className={`flex-1 chip justify-center ${
                      waterDamageInfo.charged === true ? 'chip-active' : 'chip-inactive'
                    }`}
                  >
                    是
                  </button>
                  <button
                    onClick={() => setWaterDamageInfo({ charged: false })}
                    className={`flex-1 chip justify-center ${
                      waterDamageInfo.charged === false ? 'chip-active' : 'chip-inactive'
                    }`}
                  >
                    否
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card fade-in-up stagger-3">
          <h3 className="section-title">
            <Activity size={20} className="text-primary-500" />
            客户已做处理
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {TREATMENT_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => toggleTreatment(option)}
                className={`chip justify-center ${
                  waterDamageInfo.customerTreatment.includes(option) ? 'chip-active' : 'chip-inactive'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="card fade-in-up stagger-4">
          <h3 className="section-title">
            <Activity size={20} className="text-warning-500" />
            当前症状
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {SYMPTOM_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => toggleSymptom(option)}
                className={`chip justify-center ${
                  waterDamageInfo.symptoms.includes(option) ? 'chip-active' : 'chip-inactive'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {waterDamageInfo.symptoms.includes('其他症状') && (
            <input
              type="text"
              className="input-field mt-3"
              placeholder="请描述其他症状..."
              value={waterDamageInfo.otherSymptom || ''}
              onChange={(e) => setWaterDamageInfo({ otherSymptom: e.target.value })}
            />
          )}
        </div>

        <div className="pb-8 fade-in-up stagger-5">
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full btn-primary text-lg py-4"
          >
            下一步：腐蚀检查
          </button>
          {!canProceed && (
            <p className="text-center text-xs text-neutral-400 mt-2">
              请填写客户姓名、手机型号、进水时间、液体类型和当前症状
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
