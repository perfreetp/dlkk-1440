import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const steps = ['登记', '检查', '报价', '确认', '追踪'];

export default function StepIndicator({ currentStep, totalSteps = 5 }: StepIndicatorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-4 mb-4">
      <div className="flex items-center justify-between">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                <div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-success-500 text-white'
                      : isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 scale-110'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-30" />
                  )}
                </div>
                {index < totalSteps - 1 && (
                  <div className="flex-1 h-1 mx-1 rounded-full overflow-hidden bg-neutral-200">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCompleted ? 'bg-success-500 w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-primary-600'
                    : isCompleted
                    ? 'text-success-600'
                    : 'text-neutral-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
