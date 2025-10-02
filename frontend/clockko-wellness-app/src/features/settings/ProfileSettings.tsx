import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Upload,
  Trash2,
  Edit,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

const defaultAvatar =
  'https://ui-avatars.com/api/?name=Femi+Hemsworth&background=E0E7FF&color=1E40AF&size=128';

const ProfileSettings: React.FC = () => {
  const [avatar, setAvatar] = useState<string>(defaultAvatar);
  const [name, setName] = useState<string>('Femi Hemsworth');
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setAvatar(ev.target.result as string);
      };
      reader.readAsDataURL(file);
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
            src={avatar}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="icon"
              className="bg-red-50 hover:bg-red-100 text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
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
              value={name}
              readOnly={!isEditingName}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border-gray-200 rounded-md mt-1"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditingName(!isEditingName)}
            className="whitespace-nowrap"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditingName ? 'Save' : 'Edit'}
          </Button>
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
            <Select defaultValue="lagos">
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lagos">(GMT+1:00) Lagos</SelectItem>
                <SelectItem value="london">(GMT+0:00) London</SelectItem>
                <SelectItem value="new-york">(GMT-5:00) New York</SelectItem>
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
            <Select defaultValue="nigeria">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nigeria">Nigeria</SelectItem>
                <SelectItem value="united-kingdom">United Kingdom</SelectItem>
                <SelectItem value="united-states">United States</SelectItem>
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
            <Switch defaultChecked />
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