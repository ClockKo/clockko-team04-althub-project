import React from 'react';
import { Link } from 'react-router-dom';
import frame1 from '../../assets/images/frame1.png';


// Update the component's props to accept an optional background color
type AuthLayoutProps = {
  children: React.ReactNode;
  bgColor?: string; // The '?' makes the prop optional
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, bgColor = 'bg-white' }) => {
  return (
    <div className={`flex flex-col min-h-screen ${bgColor}`}>
      {/* Header with Logo */}
      <header className="p-4 sm:p-6">
        <Link to="/">
          <img src={frame1} alt="ClockKo Logo" className="w-20 md:w-30" />
        </Link>
      </header>
      
      {/* The children prop renders here*/}
      <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;