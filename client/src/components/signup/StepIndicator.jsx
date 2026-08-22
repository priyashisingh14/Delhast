import React from 'react';

const steps = [
  { id: 1, number: '01', title: 'Email' },
  { id: 2, number: '02', title: 'Details' },
  { id: 3, number: '03', title: 'ID Scan' },
  { id: 4, number: '04', title: 'Password' }
];

export const StepIndicator = ({ currentStep }) => {
  return (
    <div className="w-full mb-6 select-none">
      <div className="grid grid-cols-4 gap-2">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="space-y-1.5">
              {/* Progress Bar Line */}
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500'
                    : isCurrent
                    ? 'bg-indigo-600 shadow-xs'
                    : 'bg-slate-200'
                }`}
              />

              <div className="flex items-center gap-1 pt-0.5">
                <span
                  className={`text-[11px] font-mono font-bold ${
                    isCompleted
                      ? 'text-emerald-600'
                      : isCurrent
                      ? 'text-indigo-600'
                      : 'text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : step.number}
                </span>
                <span
                  className={`text-xs font-semibold truncate ${
                    isCurrent
                      ? 'text-slate-900 font-bold'
                      : isCompleted
                      ? 'text-slate-600'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
