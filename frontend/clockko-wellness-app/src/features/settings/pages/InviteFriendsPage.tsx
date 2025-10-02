import React from 'react';
import { Button } from '../../../components/ui/button';
import { Link2, Send } from 'lucide-react';
import ko_faces_1 from '../../../assets/images/ko_faces_1.png';
import ko_faces_2 from '../../../assets/images/ko_faces_2.png';
import ko_faces_3 from '../../../assets/images/ko_faces_3.png';
import ko_faces_4 from '../../../assets/images/ko_faces_4.png';

const InviteFriendsPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-sm p-12 text-center">
        {/* Placeholder for the illustration */}
        <div className="flex justify-center items-center mb-6">
          <div className="flex space-x-4">
            <img src={ko_faces_1} alt="Koala Face 1" className="h-[60px]" />
            <img src={ko_faces_2} alt="Koala Face 2" className="h-[60px]" />
            <img src={ko_faces_3} alt="Koala Face 3" className="h-[60px]" />
            <img src={ko_faces_4} alt="Koala Face 4" className="h-[60px]" />
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Invite your friends to ClockKo
        </h2>
        
        <p className="text-gray-500 mb-8">
          Invite your friends by email or copy the invite link and share!
        </p>
        
        <div className="flex justify-center gap-4">
          <Button className="bg-[#34559E] hover:bg-[#2c4885]">
            <Link2 className="h-4 w-4 mr-2" />
            Copy link
          </Button>
          <Button variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Send invite
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsPage;