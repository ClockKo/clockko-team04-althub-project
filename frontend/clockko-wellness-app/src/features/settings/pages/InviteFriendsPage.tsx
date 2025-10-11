import React from 'react';
import { Button } from '../../../components/ui/button';
import { Link2, Send } from 'lucide-react';
import Ko_Faces_1 from '../../../assets/images/Ko_Faces_1.png';
import Ko_Faces_2 from '../../../assets/images/Ko_Faces_2.png';
import Ko_Faces_3 from '../../../assets/images/Ko_Faces_3.png';
import Ko_Faces_4 from '../../../assets/images/Ko_Faces_4.png';

const InviteFriendsPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-12 text-center">
        {/* Illustration */}
        <div className="flex justify-center items-center mb-8">
          <div className="flex space-x-4 justify-center">
            <img src={Ko_Faces_1} alt="Koala Face 1" className="h-16 w-auto" />
            <img src={Ko_Faces_2} alt="Koala Face 2" className="h-16 w-auto" />
            <img src={Ko_Faces_3} alt="Koala Face 3" className="h-16 w-auto" />
            <img src={Ko_Faces_4} alt="Koala Face 4" className="h-16 w-auto" />
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Invite your friends to ClockKo
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Invite your friends by email or copy the invite link and share!
        </p>
        
        <div className="flex flex-col gap-3">
          <Button className="bg-[#34559E] hover:bg-[#2c4885] text-white px-8 py-2.5 rounded-md font-medium">
            <Link2 className="h-4 w-4 mr-2" />
            Copy link
          </Button>
          <Button variant="outline" className="px-8 py-2.5 rounded-md font-medium border-[#34559E] text-[#34559E] hover:bg-[#34559E] hover:text-white">
            <Send className="h-4 w-4 mr-2" />
            Send invite
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsPage;

