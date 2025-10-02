// src/features/settings/pages/EmailSettings.tsx

import React from 'react';
import { Button } from '../../../components/ui/button';
// You'll need to create or find an illustration component/image
// import ConnectIllustration from '../../assets/images/connect-illustration.svg';

const EmailSettings: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-sm p-8 text-center">
        {/* Placeholder for the illustration */}
        <div className="flex justify-center items-center mb-6">
          {/* <img src={ConnectIllustration} alt="Connect Mail and Calendar" className="w-48 h-48" /> */}
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">📧</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Connect your mail and calendar
        </h2>
        
        <p className="text-gray-500 mb-6">
          Connect your emails and calendars to keep your workspace more organized and better managed.
        </p>
        
        <Button className="bg-[#34559E] hover:bg-[#2c4885]">
          Connect
        </Button>
      </div>
    </div>
  );
};

export default EmailSettings;