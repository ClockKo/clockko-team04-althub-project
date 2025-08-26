import React from 'react';
import { Link } from 'react-router-dom';
import frame1 from '../../assets/images/frame1.png';

// This component accepts other components as 'children'
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with Logo */}
      <header className="p-4 sm:p-6">
        <Link to="/">
          <img src={frame1} alt="ClockKo Logo" className="w-20" />
        </Link>
      </header>
      
      {/* The children prop renders whatever you put inside the layout */}
      <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;