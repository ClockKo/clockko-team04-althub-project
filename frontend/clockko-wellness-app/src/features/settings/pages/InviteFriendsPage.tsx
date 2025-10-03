import React from 'react';
import { Button } from '../../../components/ui/button';
import { Link2, Send } from 'lucide-react';
import ko_faces_1 from '../../../assets/images/ko_faces_1.png';
import ko_faces_2 from '../../../assets/images/ko_faces_2.png';
import ko_faces_3 from '../../../assets/images/ko_faces_3.png';
import ko_faces_4 from '../../../assets/images/ko_faces_4.png';

const InviteFriendsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-start md:justify-center h-full p-4 md:p-0">

      <h1 className="text-2xl font-semibold text-blue-800 mb-12 md:hidden">Invite Friends</h1>
    
      <div className="w-full max-w-xl bg-white rounded-lg shadow-sm p-6 md:p-12 text-center">
        <div className="flex justify-center items-center mb-6">
          <div className="grid grid-cols-2 gap-4 md:flex md:space-x-4 md:justify-center">
            <img src={ko_faces_1} alt="Koala Face 1" className="h-16" />
            <img src={ko_faces_2} alt="Koala Face 2" className="h-16" />
            <img src={ko_faces_3} alt="Koala Face 3" className="h-16" />
            <img src={ko_faces_4} alt="Koala Face 4" className="h-16" />
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Invite your friends to ClockKo
        </h2>
        
        <p className="text-gray-500 mb-8">
          Invite your friends by email or copy the invite link and share!
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Button className="bg-[#34559E] hover:bg-[#2c4885] w-full md:w-auto">
            <Link2 className="h-4 w-4 mr-2" />
            Copy link
          </Button>
          <Button variant="outline" className="w-full md:w-auto">
            <Send className="h-4 w-4 mr-2" />
            Send invite
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsPage;

