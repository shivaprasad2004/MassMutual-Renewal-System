import React from 'react';
import { HiExclamationTriangle } from 'react-icons/hi2';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="glass-panel p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <HiExclamationTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
              System Error
            </h2>
            <p className="text-slate-400 text-sm mb-6 font-mono">
              An unexpected error has occurred. The system encountered a critical fault.
            </p>
            <p className="text-red-400/60 text-xs font-mono mb-8 break-all">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-xs uppercase tracking-widest transition-all border border-blue-400/20"
            >
              Retry System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
