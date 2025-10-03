import React, { useRef, useState, useEffect } from 'react';
import { updateUserProfile } from '../../../pages/dashboard/profileApi';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
import {
  Upload,
  Trash2,
  Edit,
  ChevronRight
} from 'lucide-react';
import { useUserData } from '../../../pages/dashboard/dashboardHooks';
import { getData } from 'country-list';
import timezones from 'timezones-list';

const defaultAvatar =
  'https://ui-avatars.com/api/?name=User&background=E0E7FF&color=1E40AF&size=128';

const ProfileSettings: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('NG');
  const countries = getData();
  const { data: user, isLoading } = useUserData();

  // Get the browser's timezone identifier
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [selectedTimezone, setSelectedTimezone] = useState<string>(detectedTimezone);
  const [autoTimezone, setAutoTimezone] = useState(true);

  // Local state only for editing name and uploading avatar
  const [editName, setEditName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // When entering edit mode, set editName to current user name
  useEffect(() => {
    if (isEditingName && user) {
      setEditName(user.name || '');
    }
  }, [isEditingName, user]);

  useEffect(() => {
    // Check if the browser supports Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use a free reverse geocoding service to get the country code
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          
          if (data.countryCode) {
            setSelectedCountry(data.countryCode);
          }
        } catch (error) {
          console.error("Error fetching user's country:", error);
        }
      });
    }
  }, []); // This runs once when the component mounts

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const newAvatar = ev.target.result as string;
          setUploadingAvatar(true);
          try {
            await updateUserProfile({ avatar: newAvatar });
            await queryClient.invalidateQueries({ queryKey: ['userData'] });
          } catch (err) {
            console.error('Error updating avatar:', err);
            // Optionally show error toast
          } finally {
            setUploadingAvatar(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameSave = async () => {
    if (!editName || editName === user?.name) {
      setIsEditingName(false);
      return;
    }
    setUploadingAvatar(true);
    try {
      await updateUserProfile({ name: editName });
      await queryClient.invalidateQueries({ queryKey: ['userData'] });
      setIsEditingName(false);
    } catch (err) {
      console.error('Error updating name:', err);
      // Optionally show error toast
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Account</h1>

      {/* Profile Card */}
      <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user?.avatar || defaultAvatar}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="icon"
              className="bg-red-50 hover:bg-red-100 text-red-600"
              disabled
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadingAvatar ? 'Uploading...' : 'Upload'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="flex items-end gap-4"> 
          <div className="flex-grow">
            <label className="text-xs text-gray-500">Name</label>
            <Input
              type="text"
              value={isEditingName ? editName : user?.name || ''}
              readOnly={!isEditingName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-gray-50 border-gray-200 rounded-md mt-1"
              disabled={isLoading}
            />
          </div>
          {isEditingName ? (
            <Button
              variant="outline"
              onClick={handleNameSave}
              className="whitespace-nowrap"
              disabled={uploadingAvatar}
            >
              <Edit className="h-4 w-4 mr-2" />
              {uploadingAvatar ? 'Saving...' : 'Save'}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditingName(true)}
              className="whitespace-nowrap"
              disabled={isLoading}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </section>

      {/* Language, Time & Region Card */}
      <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">
          Language, Time & Region
        </h2>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">Language</h4>
              <p className="text-sm text-gray-500">
                Change the language used in the user interface.
              </p>
            </div>
            <Select defaultValue="en-uk">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-uk">English (UK)</SelectItem>
                <SelectItem value="en-us">English (US)</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">Timezone</h4>
              <p className="text-sm text-gray-500">Current timezone setting.</p>
            </div>
            <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {/* Map over the timezones to create the options */}
                {timezones.map((tz) => (
                  <SelectItem key={tz.tzCode} value={tz.tzCode}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">Region</h4>
              <p className="text-sm text-gray-500">
                Change the country for regional settings.
              </p>
            </div>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">
                Set timezone automatically using location
              </h4>
              <p className="text-sm text-gray-500">
                Workspace activity is based on your time zone.
              </p>
            </div>
            <Switch 
              checked={autoTimezone} 
              onCheckedChange={setAutoTimezone} 
            />
          </div>
        </div>
      </section>

      {/* Support Card */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">Support</h2>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">Support access</h4>
              <p className="text-sm text-gray-500 max-w-xl">
                Grant ClockKo support temporary access to your account so we
                can troubleshoot problems. You can revoke access at any time.
              </p>
            </div>
            <Switch />
          </div>
          <Link
            to="/settings/delete-account"
            className="flex justify-between items-center p-4 -mx-4 rounded-lg hover:bg-red-50"
          >
            <div>
              <h4 className="font-medium text-red-600">Delete my account</h4>
              <p className="text-sm text-gray-500">
                Permanently delete the account and remove access from all
                workspaces.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProfileSettings;