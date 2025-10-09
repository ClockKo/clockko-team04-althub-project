import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  LogOut,
  Shield,
  Clock
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter
} from '../../../components/ui/alert-dialog';

// Mock data for now - will be replaced with API calls
const mockSessions = [
  {
    id: '1',
    device_name: 'MacBook Pro',
    os_name: 'macOS',
    browser_name: 'Chrome',
    browser_version: '118.0',
    device_type: 'pc',
    ip_address: '192.168.1.100',
    location: 'Lagos, Nigeria',
    created_at: '2025-10-09T10:30:00Z',
    last_activity: '2025-10-09T18:30:00Z',
    is_active: true,
    is_current: true
  },
  {
    id: '2',
    device_name: 'iPhone 15 Pro',
    os_name: 'iOS',
    browser_name: 'Safari',
    browser_version: '17.0',
    device_type: 'mobile',
    ip_address: '41.58.123.45',
    location: 'Abuja, Nigeria',
    created_at: '2025-10-08T14:20:00Z',
    last_activity: '2025-10-09T16:45:00Z',
    is_active: true,
    is_current: false
  },
  {
    id: '3',
    device_name: 'Windows Desktop',
    os_name: 'Windows',
    browser_name: 'Edge',
    browser_version: '119.0',
    device_type: 'pc',
    ip_address: '197.149.89.23',
    location: 'Port Harcourt, Nigeria',
    created_at: '2025-10-07T09:15:00Z',
    last_activity: '2025-10-08T22:30:00Z',
    is_active: false,
    is_current: false
  }
];

const DeviceSettings: React.FC = () => {
  const [sessions] = useState(mockSessions);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-5 w-5 text-blue-500" />;
      case 'tablet':
        return <Tablet className="h-5 w-5 text-green-500" />;
      case 'pc':
      default:
        return <Monitor className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleTerminateSession = (sessionId: string) => {
    // TODO: Implement API call to terminate session
    console.log('Terminating session:', sessionId);
    setTerminatingSession(null);
  };

  const handleTerminateAllOtherSessions = () => {
    // TODO: Implement API call to terminate all other sessions
    console.log('Terminating all other sessions');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Device & Session Management</h1>
        <p className="text-gray-600">
          Manage your active sessions and devices. You can see where you're logged in and sign out of sessions you don't recognize.
        </p>
      </div>

      {/* Current Session */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 text-green-500 mr-2" />
          Current Session
        </h2>
        
        {sessions.filter(session => session.is_current).map(session => (
          <div key={session.id} className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {getDeviceIcon(session.device_type)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{session.device_name}</h3>
                  <p className="text-sm text-gray-600">
                    {session.os_name} • {session.browser_name} {session.browser_version}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="mr-4">{session.location}</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Active now</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600 font-medium">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                This device
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Other Active Sessions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Monitor className="h-5 w-5 text-blue-500 mr-2" />
            Other Active Sessions
          </h2>
          {sessions.filter(session => !session.is_current && session.is_active).length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out all others
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out of all other sessions?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will sign you out of all other devices and browsers. You'll need to sign in again on those devices.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleTerminateAllOtherSessions}
                  >
                    Sign out all others
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {sessions.filter(session => !session.is_current && session.is_active).length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No other active sessions</h3>
            <p className="text-gray-600">You're only signed in on this device.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.filter(session => !session.is_current && session.is_active).map(session => (
              <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getDeviceIcon(session.device_type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{session.device_name}</h3>
                      <p className="text-sm text-gray-600">
                        {session.os_name} • {session.browser_name} {session.browser_version}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="mr-4">{session.location}</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{getTimeAgo(session.last_activity)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        First signed in: {formatDate(session.created_at)}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign out of this session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will sign out the session on "{session.device_name}". 
                          You'll need to sign in again on that device.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          Sign out
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Sessions (Expired/Terminated) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 text-gray-500 mr-2" />
          Recent Sessions
        </h2>

        {sessions.filter(session => !session.is_active).length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">No recent expired sessions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.filter(session => !session.is_active).map(session => (
              <div key={session.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  {getDeviceIcon(session.device_type)}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-700">{session.device_name}</h3>
                    <p className="text-sm text-gray-500">
                      {session.os_name} • {session.browser_name} {session.browser_version}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-gray-400">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="mr-4">{session.location}</span>
                      <span>Last active: {formatDate(session.last_activity)}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Session ended
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Security Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• If you see a session you don't recognize, sign out of it immediately</li>
              <li>• Regularly review your active sessions, especially after using public computers</li>
              <li>• Sign out of all sessions if you suspect unauthorized access</li>
              <li>• Enable two-factor authentication for additional security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSettings;