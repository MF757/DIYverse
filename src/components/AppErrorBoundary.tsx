import type { ReactNode } from 'react';
import { Component } from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: ReactNode;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AppErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const e = this.state.error;
      return (
        <div
          style={{
            padding: 24,
            maxWidth: 720,
            margin: '24px auto',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 14,
            lineHeight: 1.5,
            color: '#1a1a1a',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6,
          }}
        >
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Something went wrong</h2>
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{e.message}</p>
          <pre
            style={{
              margin: 0,
              padding: 12,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 4,
              overflow: 'auto',
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {e.stack ?? 'No stack trace'}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
