import React from 'react';

interface ProgressIndicatorProps {
  value?: number; // 0-100 percentage
  message?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'loading' | 'success' | 'error';
  indeterminate?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value = 0,
  message,
  showPercentage = true,
  size = 'md',
  variant = 'default',
  indeterminate = false
}) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variantClasses = {
    default: 'bg-blue-600',
    loading: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {message && (
        <div className="flex justify-between items-center mb-2">
          <span className={`text-gray-300 ${textSizeClasses[size]}`}>
            {message}
          </span>
          {showPercentage && !indeterminate && (
            <span className={`text-gray-400 ${textSizeClasses[size]} font-mono`}>
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full transition-all duration-300 ease-out ${
            indeterminate ? 'animate-pulse' : ''
          }`}
          style={{
            width: indeterminate ? '100%' : `${clampedValue}%`,
            animation: indeterminate ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined
          }}
        />
      </div>
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-gray-600 border-t-blue-400 rounded-full animate-spin`}
      />
      {message && (
        <p className={`mt-2 text-gray-400 ${textSizeClasses[size]} text-center`}>
          {message}
        </p>
      )}
    </div>
  );
};

interface DataLoadingIndicatorProps {
  steps: Array<{
    id: string;
    label: string;
    status: 'pending' | 'loading' | 'completed' | 'error';
  }>;
  currentStep?: string;
}

export const DataLoadingIndicator: React.FC<DataLoadingIndicatorProps> = ({
  steps,
  currentStep
}) => {
  const getStepIcon = (status: string, isCurrent: boolean) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-500">✓</span>;
      case 'error':
        return <span className="text-red-500">✗</span>;
      case 'loading':
        return <div className="w-3 h-3 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin" />;
      default:
        return <span className={`w-3 h-3 rounded-full border-2 ${isCurrent ? 'border-blue-400' : 'border-gray-600'}`} />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">Loading Data...</h3>
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';
          
          return (
            <div key={step.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getStepIcon(step.status, isCurrent)}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${
                  isCompleted ? 'text-green-400' : 
                  isError ? 'text-red-400' : 
                  isCurrent ? 'text-blue-400' : 
                  'text-gray-400'
                }`}>
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute left-1.5 ml-0.5 mt-4 h-4 w-0.5 bg-gray-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Hook for managing multi-step loading progress
export function useProgressTracking(totalSteps: number) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [stepStatus, setStepStatus] = React.useState<Record<number, 'pending' | 'loading' | 'completed' | 'error'>>({});

  const progress = React.useMemo(() => {
    return Math.round((currentStep / totalSteps) * 100);
  }, [currentStep, totalSteps]);

  const startStep = React.useCallback((step: number) => {
    setCurrentStep(step);
    setStepStatus(prev => ({ ...prev, [step]: 'loading' }));
  }, []);

  const completeStep = React.useCallback((step: number) => {
    setStepStatus(prev => ({ ...prev, [step]: 'completed' }));
  }, []);

  const errorStep = React.useCallback((step: number) => {
    setStepStatus(prev => ({ ...prev, [step]: 'error' }));
  }, []);

  const reset = React.useCallback(() => {
    setCurrentStep(0);
    setStepStatus({});
  }, []);

  return {
    currentStep,
    progress,
    stepStatus,
    startStep,
    completeStep,
    errorStep,
    reset,
    isCompleted: currentStep === totalSteps && stepStatus[totalSteps] === 'completed',
    hasErrors: Object.values(stepStatus).includes('error')
  };
}

export default ProgressIndicator;
