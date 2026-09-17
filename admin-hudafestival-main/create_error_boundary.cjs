const fs = require('fs');
let code = `import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[var(--color-bg)]">
          <AlertTriangle size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-[var(--color-text-heading)] mb-2">Something went wrong</h2>
          <p className="text-[var(--color-text-muted)] max-w-lg mb-6">
            A component crashed. Please refresh the page or try navigating somewhere else.
          </p>
          <button 
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
            className="px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Dashboard
          </button>
          {this.state.error && (
            <pre className="mt-8 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-left text-xs text-red-500 max-w-2xl overflow-auto">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
`;
fs.writeFileSync('src/components/ErrorBoundary.jsx', code);
console.log("ErrorBoundary created");
