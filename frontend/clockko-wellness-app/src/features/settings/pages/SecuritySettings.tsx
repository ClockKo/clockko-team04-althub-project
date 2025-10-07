import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Input } from '../../../components/ui/input';
import { Smartphone, Monitor } from 'lucide-react';
import { useUserData } from '../../../pages/dashboard/dashboardHooks';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter
} from '../../../components/ui/alert-dialog';
import { 
  verifyCurrentPassword, 
  checkEmailAvailability, 
  sendEmailChangeVerification, 
  changeEmailAddress 
} from '../../auth/api';

const SecuritySettings: React.FC = () => {
  const { data: userData, isLoading, error } = useUserData();
  const queryClient = useQueryClient();
  
  // Change email dialog state
  const [step, setStep] = useState<'password' | 'email' | 'verification'>('password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isLoading1, setIsLoading1] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Reset dialog state when opened
  const handleDialogOpen = () => {
    setStep('password');
    setCurrentPassword('');
    setNewEmail('');
    setConfirmEmail('');
    setVerificationCode('');
    setEmailError('');
    setPasswordError('');
    setVerificationError('');
    setIsLoading1(false);
    setDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  
  // Validation functions
  const validatePassword = async () => {
    if (!currentPassword.trim()) {
      setPasswordError('Please enter your current password');
      return false;
    }
    
    try {
      await verifyCurrentPassword(currentPassword);
      setPasswordError('');
      return true;
    } catch (error: any) {
      console.error('Password verification error:', error);
      // Show specific error message if available
      const errorMessage = error?.response?.data?.detail || 'Incorrect password';
      setPasswordError(errorMessage);
      return false;
    }
  };
  
  const validateEmail = async () => {
    if (!newEmail.trim()) {
      setEmailError('Please enter a new email address');
      return false;
    }
    
    if (newEmail !== confirmEmail) {
      setEmailError('Email addresses do not match');
      return false;
    }
    
    if (newEmail === userData?.email) {
      setEmailError('New email must be different from current email');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    try {
      await checkEmailAvailability(newEmail);
      setEmailError('');
      return true;
    } catch (error: any) {
      console.error('Email validation error:', error);
      const errorMessage = error?.response?.data?.detail || 'Email address is already in use';
      setEmailError(errorMessage);
      return false;
    }
  };
  
  const handleNextStep = async () => {
    setIsLoading1(true);
    
    try {
      if (step === 'password') {
        const isValidPassword = await validatePassword();
        if (isValidPassword) {
          setStep('email');
        }
      } else if (step === 'email') {
        const isValidEmail = await validateEmail();
        if (isValidEmail) {
          // Send verification code
          try {
            await sendEmailChangeVerification(newEmail);
            toast.success('Verification code sent to your new email address');
            setStep('verification');
          } catch (error: any) {
            console.error('Send verification error:', error);
            const errorMessage = error?.response?.data?.detail || 'Failed to send verification code';
            toast.error(errorMessage);
          }
        }
      } else if (step === 'verification') {
        if (!verificationCode.trim()) {
          setVerificationError('Please enter the verification code');
          return;
        }
        
        try {
          await changeEmailAddress(newEmail, verificationCode);
          
          // Show success message
          toast.success('🎉 Email address changed successfully! Your new email is now active.', {
            duration: 5000, // Show for 5 seconds
            position: 'top-center'
          });
          
          // Close the dialog
          handleDialogClose();
          
          // Refresh user data to show the new email immediately
          await queryClient.invalidateQueries({ queryKey: ['userData'] });
          
        } catch (error: any) {
          console.error('Change email error:', error);
          const errorMessage = error?.response?.data?.detail || 'Invalid verification code';
          setVerificationError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Unexpected error in handleNextStep:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading1(false);
    }
  };
  
  const getStepTitle = () => {
    switch (step) {
      case 'password': return 'Verify Current Password';
      case 'email': return 'Enter New Email';
      case 'verification': return 'Verify New Email';
      default: return 'Change Email';
    }
  };
  
  const getStepDescription = () => {
    switch (step) {
      case 'password': return 'Please enter your current password to continue';
      case 'email': return 'Enter and confirm your new email address';
      case 'verification': return 'Enter the verification code sent to your new email address';
      default: return '';
    }
  };
  
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
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" onClick={handleDialogOpen}>Change email</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>{getStepTitle()}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {getStepDescription()}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="space-y-4 py-4">
                  {step === 'password' && (
                    <div className="space-y-2">
                      <Input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={passwordError ? 'border-red-500' : ''}
                      />
                      {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                    </div>
                  )}
                  
                  {step === 'email' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="New email address"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className={emailError ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="Confirm new email address"
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          className={emailError ? 'border-red-500' : ''}
                        />
                        {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                      </div>
                    </div>
                  )}
                  
                  {step === 'verification' && (
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Enter verification code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className={verificationError ? 'border-red-500' : ''}
                      />
                      {verificationError && <p className="text-sm text-red-500">{verificationError}</p>}
                      <p className="text-sm text-gray-500">
                        Check your email ({newEmail}) for the verification code
                      </p>
                    </div>
                  )}
                </div>
                
                <AlertDialogFooter className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleDialogClose}
                    disabled={isLoading1}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleNextStep}
                    disabled={isLoading1}
                  >
                    {isLoading1 ? 'Processing...' : step === 'verification' ? 'Change Email' : 'Next'}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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