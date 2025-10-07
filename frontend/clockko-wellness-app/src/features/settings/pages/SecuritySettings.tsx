import React from 'react';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Smartphone, Monitor } from 'lucide-react';
import { useUserData } from '../../../pages/dashboard/dashboardHooks';

const SecuritySettings: React.FC = () => {
  const { data: userData, isLoading, error } = useUserData();
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Account security</h1>

      {/* Security Card */}
      <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">Security</h2>
        <div className="space-y-6">
          {/* Email */}
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">Email</h4>
              <p className="text-sm text-gray-500">
                {isLoading ? 'Loading...' : error ? 'Unable to load email' : userData?.email || 'No email found'}
              </p>
            </div>
            <Button variant="outline">Change email</Button>
          </div>
          
          {/* Password */}
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">Password</h4>
              <p className="text-sm text-gray-500">**********</p>
            </div>
            <Button variant="outline">New password</Button>
          </div>
          
          {/* 2-Step Verification */}
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">2-step verification</h4>
              <p className="text-sm text-gray-500">Add an additional layer of security to your account during login.</p>
            </div>
            <Switch />
          </div>
        </div>
      </section>

      {/* Devices Card */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">Devices</h2>
        <div className="space-y-6">
          {/* Log out of all devices */}
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">Log out of all devices</h4>
              <p className="text-sm text-gray-500">Log out of all other active sessions on other devices besides this one.</p>
            </div>
            <Button variant="outline">Log out of all devices</Button>
          </div>
          
          {/* Device List */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            {/* This Device */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Monitor className="h-6 w-6 text-gray-500" />
                <div>
                  <h4 className="font-medium text-gray-800">macOS (This Device)</h4>
                  <p className="text-sm text-gray-500">Now, NG-RI, Nigeria</p>
                </div>
              </div>
              <Button variant="outline">Log out</Button>
            </div>
            
            {/* Other Device */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Smartphone className="h-6 w-6 text-gray-500" />
                <div>
                  <h4 className="font-medium text-gray-800">iPhone</h4>
                  <p className="text-sm text-gray-500">Aug 28, 2025, 7:49 PM, NG-RI, Nigeria</p>
                </div>
              </div>
              <Button variant="outline">Log out</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecuritySettings;