import React from "react";

interface Props {
  currentStep: number;
}

function ProgressSteps({ currentStep }: Props) {
  return (
    <div className="flex items-center justify-center space-x-20">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className="relative flex items-center justify-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step < currentStep
                  ? "bg-secondary-500 text-white"
                  : step === currentStep
                  ? "animate-pulse bg-highlight-300"
                  : "bg-gray-300"
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 transform">
                <div
                  className={`h-0.5 w-20 ${
                    step < currentStep ? "bg-secondary-500" : "bg-gray-300"
                  }`}
                ></div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProgressSteps;
