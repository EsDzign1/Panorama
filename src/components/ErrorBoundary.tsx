import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public declare state: State;
  public declare props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in VR360 viewer:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('coohom_tour_project_v1');
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center z-50">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/10">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold mb-2">360° Viewer Encountered an Issue</h2>
          <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || 'An unexpected rendering error occurred. This may happen if hardware acceleration or WebGL is disabled.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Reload Viewer
            </button>

            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              Reset Tour Data
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
