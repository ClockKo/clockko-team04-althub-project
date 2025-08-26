import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthLayout from './AuthLayout'

const CheckInboxPage: React.FC = () => {
  // The useLocation hook allows us to access the state passed during navigation
  const location = useLocation()
  const email = location.state?.email || 'your e-mail' // Get the email, with a fallback

  return (
    <AuthLayout>
      <div className="flex flex-col min-h-screen bg-white">

        {/* Main Content */}
        <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
          <div className="w-full max-w-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Check your inbox</h1>

            <p className="text-gray-600 text-lg">
              We've sent you a link to <br />
              <strong className="text-gray-900">{email}</strong>
              <br />
              Please click the link to confirm your email address.
            </p>

            <div className="mt-8 text-xs text-gray-500">
              <p>Can't see the e-mail? Please check the spam folder.</p>
              <p>
                Wrong e-mail?{' '}
                <Link to="/signup" className="underline hover:text-gray-700">
                  Please re-enter your address
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default CheckInboxPage
