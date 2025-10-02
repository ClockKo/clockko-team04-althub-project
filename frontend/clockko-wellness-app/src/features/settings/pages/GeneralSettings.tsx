// src/features/settings/pages/GeneralSettings.tsx

import React from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

const GeneralSettings: React.FC = () => {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Workspace settings</h1>

      {/* Workspace Card */}
      <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">Workspace</h2>
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
            <Input defaultValue="Femi Hemsworth's Workspace" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <Input defaultValue="femi.hemsworth@gmail.com" disabled />
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="flex-grow">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
              <Input type="password" defaultValue="********" disabled />
            </div>
            <Button variant="outline">Change password</Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Notifications Card */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6 text-gray-800">Notifications</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Shutdown reminders</span>
              <Switch defaultChecked />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Break reminders</span>
              <Switch defaultChecked />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Task deadline</span>
              <Switch />
            </div>
          </div>
        </section>

        {/* Privacy Card */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6 text-gray-800">Privacy</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Stay anon in chat rooms</span>
              <Select defaultValue="off">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">On</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Break reminders</span>
               <Select defaultValue="on">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">On</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Task deadline</span>
               <Select defaultValue="off">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">On</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </div>

      {/* Work Preferences Card */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Work Preferences</h2>
          <Button variant="outline">Manage settings</Button>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600"><span className="font-medium text-gray-800">Work days:</span> Monday, Tuesday, Wednesday, Thursday, Friday</p>
          <p className="text-sm text-gray-600"><span className="font-medium text-gray-800">Daily hours goal:</span> 8 hours</p>
          <p className="text-sm text-gray-600"><span className="font-medium text-gray-800">Default clock-out time:</span> 5:00 PM</p>
        </div>
      </section>
    </div>
  );
};

export default GeneralSettings;