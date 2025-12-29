'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class Globe3DErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Globe3D Error:', error, errorInfo);
    Sentry.captureException(error, {
      tags: { component: 'Globe3D' },
      contexts: { errorInfo },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="relative w-full h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-white border border-blue-100 flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-gray-600 mb-4">Globe visualization temporarily unavailable</p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
