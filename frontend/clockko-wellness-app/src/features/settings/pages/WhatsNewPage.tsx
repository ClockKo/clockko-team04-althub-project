import React from 'react';
import { Button } from '../../../components/ui/button';
import Poses from '../../../assets/images/poses.png';

const WhatsNewPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-start md:justify-center h-full p-4">

      <h1 className="text-2xl font-semibold text-blue-800 mb-12 md:hidden">What's new</h1>

      <div className="w-full max-w-lg bg-white rounded-lg shadow-sm p-8 text-center">
        {/* Placeholder for the illustration */}
        <div className="flex justify-center items-center mb-6">
          <img src={Poses} alt="No new updates" className="w-48 h-48" />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Oops, nothing new yet!
        </h2>
        
        <p className="text-gray-500 mb-6">
          Don't worry, we will always update you when new ClockKo updates and features are live.
        </p>
        
        <Button className="w-full md:w-auto bg-[#34559E] hover:bg-[#2c4885]">
          <span className="mr-2">↗</span> View previous updates
        </Button>
      </div>
    </div>
  );
};

export default WhatsNewPage;