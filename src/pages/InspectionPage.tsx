import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Camera, Monitor, Cpu, Usb, Battery, Camera as CameraIcon, Volume2, MessageSquare } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import { StatusSelector } from '../components/StatusBadge';
import PhotoCard from '../components/PhotoCard';
import { useRepairStore } from '../store/useRepairStore';
import { InspectionPart, InspectionRecord, PART_NAMES } from '../types';

const partIcons: Record<InspectionPart, typeof Monitor> = {
  appearance: Monitor,
  screen: Monitor,
  motherboard: Cpu,
  interface: Usb,
  battery: Battery,
  camera: CameraIcon,
  speaker: Volume2
};

const parts: InspectionPart[] = ['appearance', 'screen', 'motherboard', 'interface', 'battery', 'camera', 'speaker'];

export default function InspectionPage() {
  const navigate = useNavigate();
  const {
    order,
    inspectionRecord,
    setInspectionStatus,
    setInspectionRemark,
    addPhoto,
    removePhoto,
    setCurrentStep,
    generateQuoteEstimate
  } = useRepairStore();

  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  const allChecked = parts.every(part => inspectionRecord[part].status !== 'pending');

  const handleNext = () => {
    generateQuoteEstimate();
    setCurrentStep(3);
    navigate('/quote');
  };

  const getPartCardClass = (part: InspectionPart) => {
    const status = inspectionRecord[part].status;
    if (status === 'normal') return 'border-success-300';
    if (status === 'mild') return 'border-warning-300';
    if (status === 'severe') return 'border-danger-300';
    return 'border-transparent';
  };

  return (
    <div className="page-container">
      <StepIndicator currentStep={order.currentStep} />

      <div className="fade-in-up stagger-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-coral-500 flex items-center justify-center shadow-lg shadow-primary-200">
            <Search className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-800">腐蚀检查</h1>
            <p className="text-sm text-neutral-500">逐项检查并拍照留档</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-coral-50 rounded-2xl p-4 mb-5 border border-primary-100 fade-in-up stagger-1">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <MessageSquare size={16} className="text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-700 font-medium">检查提示</p>
            <p className="text-xs text-neutral-600 mt-1">
              请仔细检查每个部位，标注腐蚀程度并拍照留档。<span className="text-primary-600 font-medium">所有部位检查完成后</span>才能生成报价。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parts.map((part, index) => {
          const Icon = partIcons[part];
          const data = inspectionRecord[part];
          const staggerClass = `stagger-${(index % 7) + 1}` as const;

          return (
            <div
              key={part}
              className={`card fade-in-up ${staggerClass} border-2 ${getPartCardClass(part)} transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    data.status === 'normal' ? 'bg-success-100' :
                    data.status === 'mild' ? 'bg-warning-100' :
                    data.status === 'severe' ? 'bg-danger-100' : 'bg-neutral-100'
                  }`}>
                    <Icon size={18} className={
                      data.status === 'normal' ? 'text-success-600' :
                      data.status === 'mild' ? 'text-warning-600' :
                      data.status === 'severe' ? 'text-danger-600' : 'text-neutral-500'
                    } />
                  </div>
                  <span className="font-semibold text-neutral-800">{PART_NAMES[part]}</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs text-neutral-500 mb-2 block">腐蚀程度</label>
                <StatusSelector
                  value={data.status}
                  onChange={(status) => setInspectionStatus(part, status)}
                  size="sm"
                />
              </div>

              <div className="mb-3">
                <label className="text-xs text-neutral-500 mb-2 block flex items-center gap-1">
                  <Camera size={12} />
                  照片留档（最多3张）
                </label>
                <PhotoCard
                  photos={data.photos}
                  onAdd={(url) => addPhoto(part, url)}
                  onRemove={(idx) => removePhoto(part, idx)}
                  maxPhotos={3}
                />
              </div>

              <div>
                <label className="text-xs text-neutral-500 mb-1 block">备注</label>
                <input
                  type="text"
                  className="input-field text-sm py-2 min-h-[40px]"
                  placeholder="输入检查备注..."
                  value={data.remark}
                  onChange={(e) => setInspectionRemark(part, e.target.value)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pb-8 mt-6 fade-in-up stagger-7">
        <div className="bg-white rounded-2xl p-4 shadow-soft mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">检查进度</span>
            <span className="text-sm font-semibold text-primary-600">
              {parts.filter(p => inspectionRecord[p].status !== 'pending').length} / {parts.length}
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-coral-500 rounded-full transition-all duration-500"
              style={{
                width: `${(parts.filter(p => inspectionRecord[p].status !== 'pending').length / parts.length) * 100}%`
              }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/register')}
            className="flex-1 btn-outline"
          >
            上一步
          </button>
          <button
            onClick={handleNext}
            disabled={!allChecked}
            className="flex-1 btn-primary"
          >
            生成报价
          </button>
        </div>
        {!allChecked && (
          <p className="text-center text-xs text-neutral-400 mt-2">
            请完成所有 {parts.length} 个部位的检查
          </p>
        )}
      </div>
    </div>
  );
}
