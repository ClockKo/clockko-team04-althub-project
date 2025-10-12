import React from 'react';
import { Button } from '../../../components/ui/button';
import { Link2, Send } from 'lucide-react';
import ko_faces_1 from '../../../assets/images/Ko_Faces_1.png';
import ko_faces_2 from '../../../assets/images/Ko_Faces_2.png';
import ko_faces_3 from '../../../assets/images/Ko_Faces_3.png';
import ko_faces_4 from '../../../assets/images/Ko_Faces_4.png';

const InviteFriendsPage: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-center min-h-[calc(100vh-200px)] p-4 md:p-6">
      {/* Mobile title */}
      <h1 className="text-2xl font-semibold text-[#4F63D2] mb-8 text-center md:hidden">
        Invite friends
      </h1>
      
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
        <div className="flex justify-center items-center mb-6 md:mb-8">
          <div className="grid grid-cols-2 gap-3 md:flex md:space-x-4 md:gap-0">
            <img src={ko_faces_1} alt="Koala Face 1" className="h-12 md:h-14 mx-auto" />
            <img src={ko_faces_2} alt="Koala Face 2" className="h-12 md:h-14 mx-auto" />
            <img src={ko_faces_3} alt="Koala Face 3" className="h-12 md:h-14 mx-auto" />
            <img src={ko_faces_4} alt="Koala Face 4" className="h-12 md:h-14 mx-auto" />
          </div>
        </div>
        
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4">
          Invite your friends to ClockKo
        </h2>
        
        <p className="text-gray-600 text-sm md:text-base mb-6 md:mb-8 leading-relaxed">
          Invite your friends by email or copy the invite link and share!
        </p>
        
        <div className="flex flex-col gap-3">
          <Button className="bg-[#34559E] hover:bg-[#2c4885] text-white px-6 py-3 rounded-lg font-medium w-full">
            <Link2 className="h-4 w-4 mr-2" />
            Copy link
          </Button>
          <Button variant="outline" className="px-6 py-3 rounded-lg font-medium w-full border-[#34559E] text-[#34559E] hover:bg-[#34559E] hover:text-white">
            <Send className="h-4 w-4 mr-2" />
            Send invite
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsPage;
