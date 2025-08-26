import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const CheckInboxPage: React.FC = () => {
  // The useLocation hook allows us to access the state passed during navigation
  const location = useLocation();
  const email = location.state?.email || 'your e-mail'; // Get the email, with a fallback

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with Logo */}
      <header className="p-4 sm:p-6">
        <Link to="/">
          <h1 className="text-2xl font-bold text-indigo-600">ClockKo</h1>
        </Link>
      </header>
      
      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center text-center p-4">
        <div className="w-full max-w-lg">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Check your inbox
          </h1>
          
          <p className="text-gray-600 text-lg">
            We've sent you a link to <br />
            <strong className="text-gray-900">{email}</strong>
            <br />
            Please click the link to confirm your email address.
          </p>
          
          <div className="mt-8 text-xs text-gray-500">
            <p>
              Can't see the e-mail? Please check the spam folder.
            </p>
            <p>
              Wrong e-mail?{' '}
              <Link to="/signup" className="underline hover:text-gray-700">
                Please re-enter your address
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckInboxPage;