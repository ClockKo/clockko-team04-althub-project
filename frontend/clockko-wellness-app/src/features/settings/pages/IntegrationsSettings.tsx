import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { ArrowRightLeft } from 'lucide-react'; 

// Colorful logo image files
import gmailLogo from '../../../assets/images/logos/gmail.png';
import mailchimpLogo from '../../../assets/images/logos/mailchimp.png';
import googleDriveLogo from '../../../assets/images/logos/googledr.png';
import slackLogo from '../../../assets/images/logos/slack.png';
import teamsLogo from '../../../assets/images/logos/msteams.png';
import googleWorkspaceLogo from '../../../assets/images/logos/googlew.png';
import figmaLogo from '../../../assets/images/logos/figma.png';
import adobeLogo from '../../../assets/images/logos/adobe.png';
import zapierLogo from '../../../assets/images/logos/zapier.png'; 


const initialIntegrations = [
  { name: 'Gmail', description: 'Access your inbox from ClockKo', connected: true, logo: gmailLogo },
  { name: 'Mailchimp', description: 'Access your campaigns from ClockKo', connected: false, logo: mailchimpLogo },
  { name: 'Google Drive', description: 'Connect drive files to ClockKo', connected: true, logo: googleDriveLogo },
  { name: 'Slack', description: 'Connect your workspace to ClockKo', connected: true, logo: slackLogo },
  { name: 'Microsoft Teams', description: 'Connects Teams to ClockKo', connected: false, logo: teamsLogo },
  { name: 'Google Workspace', description: 'Connect your Google workspace', connected: true, logo: googleWorkspaceLogo },
  { name: 'Figma', description: 'Connect Figma to ClockKo', connected: true, logo: figmaLogo },
  { name: 'Adobe', description: 'Connect your Adobe workspace', connected: true, logo: adobeLogo },
  { name: 'Zapier', description: 'Connect to Zapier.com', connected: false, logo: zapierLogo },
];

const IntegrationsSettings: React.FC = () => {
  const [integrations, setIntegrations] = useState(initialIntegrations);

  const handleToggle = (integrationName: string, isConnected: boolean) => {
    console.log(`${integrationName} is now ${isConnected ? 'connected' : 'disconnected'}`);
    setIntegrations(prevIntegrations =>
      prevIntegrations.map(integ =>
        integ.name === integrationName ? { ...integ, connected: isConnected } : integ
      )
    );
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">Integrations gallery</h1>
      <p className="text-gray-500 mb-8">Connect ClockKo to other tools you use.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.name} className="bg-white rounded-[24px] border border-[#999A9C] shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-col items-start mb-4"> 
                {/* Render an <img> tag for the logo */}
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mb-4">
                  <img src={integration.logo} alt={`${integration.name} logo`} className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{integration.name}</h3>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              {integration.connected ? (
                <span className="text-sm font-medium text-green-700 bg-green-100 py-1 px-3 rounded-full">
                  ✓ Connected
                </span>
              ) : (
                <Button variant="ghost" size="sm" className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              )}
              <Switch
                checked={integration.connected}
                onCheckedChange={(isChecked) => handleToggle(integration.name, isChecked)}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsSettings;