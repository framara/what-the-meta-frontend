import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="min-h-[400px] flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700">
    <div className="text-center p-8 max-w-md">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h2>
      <div className="text-gray-300 mb-6">
        <p className="mb-2">We encountered an unexpected error while loading this component.</p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
              Technical Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs bg-gray-800 p-2 rounded overflow-auto max-h-32 text-red-300">
              {error.message}
            </pre>
          </details>
        )}
      </div>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Component-specific error fallbacks
export const TableErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <div className="text-center">
      <div className="text-4xl mb-3">📊</div>
      <h3 className="text-lg font-semibold text-red-400 mb-2">Table Loading Error</h3>
      <p className="text-gray-300 mb-4">Unable to load the leaderboard data.</p>
      <button
        onClick={resetError}
        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
      >
        Retry
      </button>
    </div>
  </div>
);

export const ChartErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 min-h-[300px] flex items-center justify-center">
    <div className="text-center">
      <div className="text-4xl mb-3">📈</div>
      <h3 className="text-lg font-semibold text-red-400 mb-2">Chart Loading Error</h3>
      <p className="text-gray-300 mb-4">Unable to render the chart visualization.</p>
      <button
        onClick={resetError}
        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
      >
        Retry
      </button>
    </div>
  </div>
);

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send errors to an error reporting service
    // Example: reportError(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Convenience HOC for wrapping components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
}

export default ErrorBoundary;
