import React from 'react';
import { Link } from 'react-router-dom';
import frame1 from '../../assets/images/brandLogo2.png';
import authImage from '../../assets/images/signup-image.jpg'

// Add hideHeader to the component's props
type AuthLayoutProps = {
  children: React.ReactNode;
  hideHeader?: boolean; // The '?' makes it optional
};


const AuthLayout: React.FC<AuthLayoutProps> = ({ children, hideHeader = false }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Column (Image/Brand) - hidden on mobile */}
      <div className="hidden md:flex w-[42%] bg-gray-800 flex-col items-center justify-center text-white p-12 relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${authImage})` }}
        ></div>
        <div className="relative z-10 text-center w-full px-0">
          <img src={frame1} alt="ClockKo Logo" className="w-48 mx-auto -mt-8" />
          <h1 className="text-4xl font-bold mt-8">
            Work effectively, clock out guilt-free
          </h1>
        </div>
      </div>

      {/* Right Column (Form) */}
  <div className="w-full md:w-[58%] flex items-center justify-center min-h-screen px-4 md:px-8 py-4 md:py-8 relative">
        <div className="w-full max-w-md mx-auto flex flex-col justify-center">
          {/* Always show logo at the top on mobile */}
          <div className="md:hidden w-full flex justify-center mb-8 mt-4">
            <Link to="/">
              <img src={frame1} alt="ClockKo Logo" className="w-30" />
            </Link>
          </div>
          {/* Only show desktop header logo if not hideHeader */}
          {!hideHeader && (
            <header>
              <div className="hidden md:block absolute top-0 left-0 md:p-8">
                <Link to="/">
                  <img src={frame1} alt="ClockKo Logo" className="w-24" />
                </Link>
              </div>
            </header>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

// Make sure the export is explicit
export { AuthLayout };
export default AuthLayout;