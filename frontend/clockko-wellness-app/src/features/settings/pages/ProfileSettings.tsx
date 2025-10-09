import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authcontext';
import toast from 'react-hot-toast';
import { updateUserProfile, UserProfileResponse as UserData } from '../../../pages/dashboard/profileApi';
import { useQueryClient } from '@tanstack/react-query';
import { userDataQuery } from '../../../pages/dashboard/dashboardHooks';
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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from '../../../components/ui/alert-dialog';
import {
  getAvatarUrl,
  setDeletedAvatarName,
  clearDeletedAvatarName
} from '../../../utils/avatarUtils';



const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const { logout, authToken } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<string>('NG');
  // No longer need showDeleteDialog, handled by AlertDialog
  const countries = getData();

  const { data: user, isLoading } = useUserData() as { data: UserData | undefined, isLoading: boolean };

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

  // Avatar delete handler
  const handleDeleteAvatar = async () => {
    if (!user) return;
    try {
      setUploadingAvatar(true);
      
      // Store the current name to preserve avatar initials
      if (user.id && user.name) {
        setDeletedAvatarName(user.id, user.name);
      }
      
      // Invalidate cache before update
      await queryClient.invalidateQueries({ queryKey: ['userData'] });
      
      // Set avatar to null to delete it
      const response = await updateUserProfile({ avatar: null });
      console.log('Delete avatar response:', response);
      
      // Force immediate refetch using shared query config
      const updatedData = await queryClient.fetchQuery(userDataQuery);
      
      console.log('Updated user data after deletion:', updatedData);
      
      // Force UI update with new data
      queryClient.setQueryData(['userData'], updatedData);
      
      toast.success('Avatar deleted successfully');
    } catch (err: any) {
      console.error('Error deleting avatar:', err);
      toast.error(err.message || 'Failed to delete avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

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
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_SIZE) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    console.log('Starting avatar upload:', { fileName: file.name, fileSize: file.size, fileType: file.type });
    setUploadingAvatar(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      if (ev.target?.result) {
        const newAvatar = ev.target.result as string;
        console.log('File read complete, preparing to send to server');
        
        try {
          // Invalidate cache before update
          await queryClient.invalidateQueries({ queryKey: ['userData'] });
          
          const response = await updateUserProfile({ avatar: newAvatar });
          console.log('Profile update response:', response);
          
          if (!response || !response.avatar_url) {
            throw new Error('Server did not return updated avatar URL');
          }
          
          // Clear the stored name since user uploaded a new avatar
          if (user?.id) {
            clearDeletedAvatarName(user.id);
          }
          
          // Force immediate refetch using shared query config
          const updatedData = await queryClient.fetchQuery(userDataQuery);
          
          console.log('Updated user data:', updatedData);
          
          if (updatedData && updatedData.avatar_url !== newAvatar) {
            console.log('Avatar URL mismatch, forcing UI update');
            queryClient.setQueryData(['userData'], updatedData);
          }
          
          toast.success('Avatar updated successfully!');
        } catch (err: any) {
          console.error('Error updating avatar:', err);
          toast.error(err.message || 'Failed to update avatar');
        } finally {
          setUploadingAvatar(false);
        }
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast.error('Failed to read image file');
      setUploadingAvatar(false);
    };

    reader.readAsDataURL(file);
  };

  const [nameLoading, setNameLoading] = useState(false);

  const handleNameSave = async () => {
    if (!editName || editName === user?.name) {
      setIsEditingName(false);
      return;
    }

    setNameLoading(true);
    try {
      await updateUserProfile({ name: editName });
      await queryClient.invalidateQueries({ queryKey: ['userData'] });
      toast.success('Name updated successfully!');
      setIsEditingName(false);
    } catch (err: any) {
      console.error('Error updating name:', err);
      toast.error(err.message || 'Failed to update name');
    } finally {
      setNameLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Account</h1>

      {/* Profile Card */}
      <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
        {/* ...existing code... */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={getAvatarUrl(user)}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="bg-red-50 hover:bg-red-100 text-red-600"
                  disabled={uploadingAvatar}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Avatar</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete your avatar? This will replace it with your initials.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={handleDeleteAvatar}>
                    Delete
                  </AlertDialogAction>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
        {/* ...existing code... */}
        <h2 className="text-lg font-semibold mb-6 text-gray-800">
          Language, Time & Region
        </h2>
        <div className="space-y-6">
          {/* ...existing code... */}
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
                    {tz.label.replace('GMT', 'UTC')}
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="flex justify-between items-center p-4 -mx-4 rounded-lg hover:bg-red-50 w-full"
              >
                <div>
                  <h4 className="font-medium text-red-600 text-left">Delete my account</h4>
                  <p className="text-sm text-gray-500">
                    Permanently delete the account and remove access from all
                    workspaces.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">Confirm Account Deletion</AlertDialogTitle>
                <AlertDialogDescription className="text-black">
                  Are you sure you want to delete your account? <br />
                  <span className="font-semibold text-red-600">This action is irreversible.</span> All your data will be permanently wiped out and you will lose access to all workspaces.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction asChild>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      try {
                        const res = await fetch('http://localhost:8000/api/users/delete', {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${authToken}`,
                          },
                        });
                        if (res.ok) {
                          toast.success('Account deleted successfully.');
                          logout();
                          navigate('/');
                        } else {
                          const data = await res.json().catch(() => ({}));
                          toast.error(data.detail || 'Failed to delete account.');
                        }
                      } catch (err) {
                        toast.error('Network error. Please try again.');
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {/* Dialog now handled by AlertDialog above */}
    </div>
  );
};

export default ProfileSettings;