import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const helpLinks = [
  { path: '/help/documentation', label: 'Help & documentation' },
  { path: '/help/support', label: 'Get ClockKo Support' },
  { path: '/help/feedback', label: 'Send us feedback' },
];

const HelpSettings: React.FC = () => {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Help, Support, More</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
        <ul className="divide-y divide-gray-200">
          {helpLinks.map((link) => (
            <li key={link.path}>
              <Link to={link.path} className="flex justify-between items-center py-4 hover:bg-gray-50 -mx-6 px-6">
                <span className="font-medium text-gray-800">{link.label}</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HelpSettings;