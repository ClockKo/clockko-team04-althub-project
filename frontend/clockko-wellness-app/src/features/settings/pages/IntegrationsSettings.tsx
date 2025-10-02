// src/features/settings/pages/IntegrationsSettings.tsx

import React from 'react';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Mail, Zap, Slack, Figma } from 'lucide-react';

const integrationsData = [
  { name: 'Gmail', description: 'Access your inbox from ClockKo', connected: true, icon: Mail },
  { name: 'Mailchimp', description: 'Access your campaigns from ClockKo', connected: false, icon: Mail },
  { name: 'Google Drive', description: 'Connect drive files to ClockKo', connected: true, icon: Mail },
  { name: 'Slack', description: 'Connect your workspace to ClockKo', connected: true, icon: Slack },
  { name: 'Microsoft Teams', description: 'Connects Teams to ClockKo', connected: false, icon: Slack },
  { name: 'Google Workspace', description: 'Connect your Google workspace', connected: true, icon: Mail },
  { name: 'Figma', description: 'Connect Figma to ClockKo', connected: true, icon: Figma },
  { name: 'Adobe', description: 'Connect your Adobe workspace', connected: true, icon: Figma },
  { name: 'Zapier', description: 'Connect to Zapier.com', connected: false, icon: Zap },
];

const IntegrationsSettings: React.FC = () => {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">Integrations gallery</h1>
      <p className="text-gray-500 mb-8">Connect ClockKo to other tools you use.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationsData.map((integration) => (
          <div key={integration.name} className="bg-white rounded-lg shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                  <integration.icon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{integration.name}</h3>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              {integration.connected ? (
                <span className="text-sm font-medium text-green-600">✓ Connected</span>
              ) : (
                <Button variant="outline" size="sm">
                  <span className="mr-2">←</span> Connect
                </Button>
              )}
              <Switch checked={integration.connected} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsSettings;