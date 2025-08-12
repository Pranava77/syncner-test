import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--color-primary-bg)' }}
        >
          <div 
            className="border rounded-lg p-8 max-w-md w-full"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h1 
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Something went wrong
              </h1>
              <p 
                className="mb-6"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details 
                  className="text-left p-4 rounded border"
                  style={{ 
                    backgroundColor: 'var(--color-tertiary-bg)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <summary 
                    className="cursor-pointer mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-red-400 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="mt-6 bg-trueturquoise px-6 py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors"
                style={{ color: 'var(--color-text-inverse)' }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 