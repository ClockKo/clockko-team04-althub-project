import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from './ui/button'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            We encountered an unexpected error. Don't worry, this has been logged and our team will look into it.
          </p>
          
          {/* Error Details (only show in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                Show error details
              </summary>
              <div className="bg-gray-100 p-4 rounded-lg text-sm text-red-700 font-mono whitespace-pre-wrap">
                {error.message}
                {error.stack && (
                  <div className="mt-2 text-xs text-gray-600">
                    {error.stack}
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={resetErrorBoundary}
            className="bg-[#34559E] hover:bg-[#2c4885] px-6 py-3 rounded-[16px]"
          >
            <RefreshCw size={20} className="mr-2" />
            Try Again
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="px-6 py-3 rounded-[16px]"
          >
            <Link to="/" className="flex items-center gap-2">
              <Home size={20} />
              Go to Homepage
            </Link>
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If this problem persists, please contact our support team or try refreshing your browser.
          </p>
        </div>
      </div>
    </div>
  )
}

interface AppErrorBoundaryProps {
  children: React.ReactNode
}

const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  const handleError = (error: Error, errorInfo: any) => {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo)
    
    // In production, you might want to send this to an error reporting service
    // like Sentry, LogRocket, or Bugsnag
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReportingService.captureException(error, errorInfo)
    }
  }

  const handleReset = () => {
    // Clear any error state if needed
    // You might want to clear localStorage, reset global state, etc.
    window.location.reload()
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={handleReset}
      resetKeys={[]} // Add any dependencies that should trigger a reset
    >
      {children}
    </ErrorBoundary>
  )
}

export default AppErrorBoundary