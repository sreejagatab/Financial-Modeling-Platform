import { type ReactNode } from 'react';

type ErrorVariant = 'inline' | 'card' | 'banner' | 'toast';
type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  variant?: ErrorVariant;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  children?: ReactNode;
}

export function ErrorDisplay({
  title,
  message,
  variant = 'card',
  severity = 'error',
  onRetry,
  onDismiss,
  className = '',
  children,
}: ErrorDisplayProps) {
  const severityStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      text: 'text-red-700',
      button: 'bg-red-100 hover:bg-red-200 text-red-800',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
      button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      text: 'text-blue-700',
      button: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
    },
  };

  const styles = severityStyles[severity];

  const Icon = () => {
    if (severity === 'error') {
      return (
        <svg className={`w-5 h-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (severity === 'warning') {
      return (
        <svg className={`w-5 h-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    return (
      <svg className={`w-5 h-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  // Inline variant - minimal display
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${styles.text} ${className}`}>
        <Icon />
        <span className="text-sm">{message}</span>
        {onRetry && (
          <button onClick={onRetry} className="text-sm underline hover:no-underline">
            Retry
          </button>
        )}
      </div>
    );
  }

  // Banner variant - full width
  if (variant === 'banner') {
    return (
      <div className={`${styles.bg} ${styles.border} border-b px-4 py-3 ${className}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Icon />
            <div>
              {title && <span className={`font-medium ${styles.title}`}>{title}: </span>}
              <span className={styles.text}>{message}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`px-3 py-1 text-sm font-medium rounded ${styles.button} transition-colors`}
              >
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`p-1 rounded ${styles.button} transition-colors`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Toast variant - fixed position notification
  if (variant === 'toast') {
    return (
      <div className={`fixed bottom-4 right-4 max-w-sm ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Icon />
          <div className="flex-1">
            {title && <p className={`font-medium ${styles.title}`}>{title}</p>}
            <p className={`text-sm ${styles.text}`}>{message}</p>
            {children}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`p-1 rounded ${styles.button} transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`mt-3 w-full px-3 py-1.5 text-sm font-medium rounded ${styles.button} transition-colors`}
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Card variant (default) - contained display
  return (
    <div className={`${styles.bg} ${styles.border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon />
        </div>
        <div className="flex-1">
          {title && <h3 className={`font-medium ${styles.title} mb-1`}>{title}</h3>}
          <p className={`text-sm ${styles.text}`}>{message}</p>
          {children}
          {(onRetry || onDismiss) && (
            <div className="flex items-center gap-2 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`px-3 py-1.5 text-sm font-medium rounded ${styles.button} transition-colors`}
                >
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
