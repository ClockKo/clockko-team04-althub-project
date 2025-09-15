import React from 'react';
import { Link } from 'react-router-dom';
import frame1 from '../../assets/images/frame1.png';
import authImage from '../../assets/images/signup-image.jpg'

// Add hideHeader to the component's props
type AuthLayoutProps = {
  children: React.ReactNode;
  hideHeader?: boolean; // The '?' makes it optional
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, hideHeader = false }) => {
  return (
    <div className="flex min-h-screen">
      {/* Left Column (Form) */}
      
      <div className="w-[42%] bg-gray-800 flex flex-col items-center justify-center text-white p-12 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30" 
          style={{ backgroundImage: `url(${authImage})` }}
        ></div>
        <div className="relative z-10 text-center">
          <img src={frame1} alt="ClockKo Logo" className="w-48 mx-auto -mt-8" />
          <h1 className="text-4xl font-bold mt-8">
            Work effectively, clock out guilt-free
          </h1>
        </div>
      </div>

      {/* Right Column (Image and Text) */}
      <div className="w-[58%] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          {!hideHeader && (
            <header className="absolute top-0 left-0 p-8">
              <Link to="/">
                <img src={frame1} alt="ClockKo Logo" className="w-24"/>
              </Link>
            </header>
          )}
          {children}
        </div>
      </div>

      
    </div>
  );
};

export default AuthLayout;