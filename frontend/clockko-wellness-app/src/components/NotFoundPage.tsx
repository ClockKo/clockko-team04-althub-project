import React from 'react'
import { Button } from './ui/button'
import { Home, ArrowLeft } from 'lucide-react'

// Safe Link component that works both inside and outside Router context
const SafeLink: React.FC<{ to: string; className?: string; children: React.ReactNode }> = ({ to, className, children }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = to
  }

  return (
    <a href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-200 select-none">
            404
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Sorry, we couldn't find the page you're looking for. 
            The page might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            variant="default"
            className="bg-[#34559E] hover:bg-[#2c4885] px-6 py-3 rounded-[16px]"
          >
            <SafeLink to="/" className="flex items-center gap-2">
              <Home size={20} />
              Go to Homepage
            </SafeLink>
          </Button>
          
          <Button
            variant="outline"
            className="px-6 py-3 rounded-[16px]"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} className="mr-2" />
            Go Back
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Need help? Here are some helpful links:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <SafeLink 
              to="/dashboard" 
              className="text-[#34559E] hover:text-[#2c4885] underline"
            >
              Dashboard
            </SafeLink>
            <SafeLink 
              to="/tasks" 
              className="text-[#34559E] hover:text-[#2c4885] underline"
            >
              Tasks
            </SafeLink>
            <SafeLink 
              to="/time-tracker" 
              className="text-[#34559E] hover:text-[#2c4885] underline"
            >
              Time Tracker
            </SafeLink>
            <SafeLink 
              to="/challenges" 
              className="text-[#34559E] hover:text-[#2c4885] underline"
            >
              Challenges
            </SafeLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage