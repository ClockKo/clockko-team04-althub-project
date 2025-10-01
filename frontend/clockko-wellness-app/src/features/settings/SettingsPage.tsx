import React from 'react';
import { Outlet } from 'react-router-dom';


const SettingsPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SettingsPage;
