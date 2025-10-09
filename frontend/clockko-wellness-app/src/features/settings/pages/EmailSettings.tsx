import React from 'react';
import { Button } from '../../../components/ui/button';
import emailimg from '../../../assets/images/connect_email.png';


const EmailSettings: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-12 text-center">
        {/* Illustration */}
        <div className="flex justify-center items-center mb-8">
          <img src={emailimg} alt="Connect Mail and Calendar" className="h-30 w-auto" />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Connect your mail and calendar
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Connect your emails and calendars to keep your workspace more organized and better managed.
        </p>
        
        <Button className="bg-[#34559E] hover:bg-[#2c4885] text-white px-8 py-2.5 rounded-md font-medium">
          Connect
        </Button>
      </div>
    </div>
  );
};

export default EmailSettings;