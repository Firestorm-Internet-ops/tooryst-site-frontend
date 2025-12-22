import * as React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error', error, info);
    }

    this.props.onError?.(error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-error/30 bg-error/5 p-4 text-error">
          <p className="font-semibold">Something went wrong.</p>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre className="mt-2 whitespace-pre-wrap text-sm text-error/80">
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            className="mt-3 rounded-md border border-error/40 px-3 py-1 text-sm font-medium text-error hover:bg-error/10"
            onClick={this.handleReset}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
