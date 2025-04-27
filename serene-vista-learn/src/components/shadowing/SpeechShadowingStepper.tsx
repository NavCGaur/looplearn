
import React from "react";
import { Check, Circle, ArrowRight, ArrowLeft } from "lucide-react";

const STEPS = [
  { label: "Select Voice" },
  { label: "Choose Phrase" },
  { label: "Listen" },
  { label: "Record" },
  { label: "Compare" },
  { label: "Complete" },
];

export type ShadowingStep = 0 | 1 | 2 | 3 | 4 | 5;

interface SpeechShadowingStepperProps {
  currentStep: ShadowingStep;
  onBack: () => void;
  onForward: () => void;
  canForward: boolean;
}

export const SpeechShadowingStepper: React.FC<SpeechShadowingStepperProps> = ({
  currentStep,
  onBack,
  onForward,
  canForward,
}) => (
  <div className="w-full pt-5 pb-2 bg-transparent flex flex-col items-center z-10">
    {/* Stepper Horizontal Bar */}
    <div className="flex items-center justify-center w-full max-w-md px-2 space-x-0 sm:space-x-2">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center">
              <div
                className={[
                  "rounded-full flex items-center justify-center transition-all duration-200",
                  isCurrent
                    ? "bg-primary text-white shadow-lg border-2 border-primary ring-2 ring-primary"
                    : isCompleted
                    ? "bg-secondary text-primary border border-primary"
                    : "bg-white text-gray-400 border border-muted",
                ].join(" ")}
                style={{
                  width: 36,
                  height: 36,
                  fontWeight: 600,
                  fontSize: 18,
                  boxShadow: isCurrent ? "0 2px 12px 0 rgba(59,130,246,.18)" : undefined,
                }}
              >
                {isCompleted ? <Check size={22} className="text-primary/70" /> : idx + 1}
              </div>
              <span
                className={[
                  "mt-1 w-16 text-xs text-center truncate font-medium",
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                    ? "text-muted-foreground"
                    : "text-gray-400",
                ].join(" ")}
                style={{ fontSize: 12, minHeight: 16 }}
              >
                {step.label}
              </span>
            </div>
            {/* Arrow Right except after last step */}
            {idx < STEPS.length - 1 && (
              <div className="flex h-5 items-center px-1">
                <ArrowRight
                  size={20}
                  className={`${
                    idx < currentStep
                      ? "text-primary/60"
                      : idx === currentStep
                      ? "text-primary"
                      : "text-gray-300"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
    
    {/* Navigation Buttons 
     <div className="flex w-full max-w-md justify-between px-6 mt-2 pb-1">
      <button
        className="flex items-center gap-1 text-primary font-semibold disabled:opacity-60 text-sm"
        onClick={onBack}
        disabled={currentStep === 0}
      >
        <ArrowLeft size={18} /> Back
      </button>
      <button
        className="flex items-center gap-1 text-primary font-semibold disabled:opacity-60 text-sm"
        onClick={onForward}
        disabled={!canForward}
      >
        Next <ArrowRight size={18} />
      </button>
    </div>
    
    
    */}
   
  </div>
);

export default SpeechShadowingStepper;
