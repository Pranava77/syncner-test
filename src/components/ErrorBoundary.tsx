import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[200px] p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-error)' }}>
              Component Error
            </h2>
            <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {this.state.error?.message || 'Something went wrong'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
                color: 'white'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;