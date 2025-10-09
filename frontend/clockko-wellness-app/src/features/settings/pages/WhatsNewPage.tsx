import React from 'react';
import { Button } from '../../../components/ui/button';
import Poses from '../../../assets/images/poses.png';

const WhatsNewPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-12 text-center">
        {/* Illustration */}
        <div className="flex justify-center items-center mb-8">
          <img src={Poses} alt="No new updates" className="h-40 w-auto" />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Oops, nothing new yet!
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Don't worry, we will always update you when new ClockKo updates and features are live.
        </p>
        
        <Button className="bg-[#34559E] hover:bg-[#2c4885] text-white px-8 py-2.5 rounded-md font-medium">
          <span className="mr-2">↗</span> View previous updates
        </Button>
      </div>
    </div>
  );
};

export default WhatsNewPage;