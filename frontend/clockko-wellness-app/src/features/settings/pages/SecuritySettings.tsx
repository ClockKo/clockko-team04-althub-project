import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Input } from '../../../components/ui/input';
import { Smartphone, Monitor, Eye, EyeOff, QrCode, Shield, Copy } from 'lucide-react';
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
  changeEmailAddress,
  changePassword 
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
  
  // Change password dialog state
  const [passwordStep, setPasswordStep] = useState<'current' | 'new'>('current');
  const [currentPasswordForChange, setCurrentPasswordForChange] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState<'setup' | 'verify' | 'disable'>('setup');
  
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
  
  // Reset password dialog state when opened
  const handlePasswordDialogOpen = () => {
    setPasswordStep('current');
    setCurrentPasswordForChange('');
    setNewPassword('');
    setConfirmNewPassword('');
    setCurrentPasswordError('');
    setNewPasswordError('');
    setIsPasswordLoading(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordDialogOpen(true);
  };
  
  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
  };
  
  // Handle 2FA toggle
  const handleTwoFactorToggle = () => {
    if (twoFactorEnabled) {
      setTwoFactorStep('disable');
    } else {
      setTwoFactorStep('setup');
    }
    setTwoFactorDialogOpen(true);
  };
  
  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const feedback = [];
    
    if (password.length >= 8) score++;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Lowercase letter');
    
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Uppercase letter');
    
    if (/[0-9]/.test(password)) score++;
    else feedback.push('Number');
    
    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('Special character');
    
    let strength = 'Weak';
    let color = 'text-red-500';
    if (score >= 4) { strength = 'Strong'; color = 'text-green-500'; }
    else if (score >= 3) { strength = 'Medium'; color = 'text-yellow-500'; }
    
    return { score, strength, color, feedback };
  };
  
  // Password change validation functions
  const validateCurrentPasswordForChange = async () => {
    if (!currentPasswordForChange.trim()) {
      setCurrentPasswordError('Please enter your current password');
      return false;
    }
    
    try {
      await verifyCurrentPassword(currentPasswordForChange);
      setCurrentPasswordError('');
      return true;
    } catch (error: any) {
      console.error('Password verification error:', error);
      const errorMessage = error?.response?.data?.detail || 'Incorrect password';
      setCurrentPasswordError(errorMessage);
      return false;
    }
  };
  
  const validateNewPassword = () => {
    if (!newPassword.trim()) {
      setNewPasswordError('Please enter a new password');
      return false;
    }
    
    if (newPassword === currentPasswordForChange) {
      setNewPasswordError('New password must be different from current password');
      return false;
    }
    
    if (newPassword !== confirmNewPassword) {
      setNewPasswordError('Passwords do not match');
      return false;
    }
    
    const { score } = getPasswordStrength(newPassword);
    if (score < 3) {
      setNewPasswordError('Password is too weak. Please choose a stronger password.');
      return false;
    }
    
    setNewPasswordError('');
    return true;
  };
  
  // Password change handler
  const handlePasswordChange = async () => {
    setIsPasswordLoading(true);
    
    try {
      if (passwordStep === 'current') {
        const isValidPassword = await validateCurrentPasswordForChange();
        if (isValidPassword) {
          setPasswordStep('new');
        }
      } else if (passwordStep === 'new') {
        const isValidNewPassword = validateNewPassword();
        if (isValidNewPassword) {
          // Call change password API
          try {
            // We'll create this API function next
            await changePassword(currentPasswordForChange, newPassword);
            
            // Show success message
            toast.success('🔐 Password changed successfully! Your account is now more secure.', {
              duration: 5000,
              position: 'top-center'
            });
            
            // Close dialog
            handlePasswordDialogClose();
            
            // Optional: You might want to log out other sessions here
            // await logoutOtherSessions();
            
          } catch (error: any) {
            console.error('Change password error:', error);
            const errorMessage = error?.response?.data?.detail || 'Failed to change password';
            toast.error(errorMessage);
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error in handlePasswordChange:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsPasswordLoading(false);
    }
  };
  
  const getPasswordStepTitle = () => {
    switch (passwordStep) {
      case 'current': return 'Verify Current Password';
      case 'new': return 'Create New Password';
      default: return 'Change Password';
    }
  };
  
  const getPasswordStepDescription = () => {
    switch (passwordStep) {
      case 'current': return 'Please enter your current password to continue';
      case 'new': return 'Enter your new password and confirm it';
      default: return '';
    }
  };
  
  // Email validation functions
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
            <AlertDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" onClick={handlePasswordDialogOpen}>New password</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>{getPasswordStepTitle()}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {getPasswordStepDescription()}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="space-y-4 py-4">
                  {passwordStep === 'current' && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Current password"
                          value={currentPasswordForChange}
                          onChange={(e) => setCurrentPasswordForChange(e.target.value)}
                          className={currentPasswordError ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {currentPasswordError && <p className="text-sm text-red-500">{currentPasswordError}</p>}
                    </div>
                  )}
                  
                  {passwordStep === 'new' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={newPasswordError ? 'border-red-500 pr-10' : 'pr-10'}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {newPassword && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Password Strength:</span>
                              <span className={`text-sm font-semibold ${getPasswordStrength(newPassword).color}`}>
                                {getPasswordStrength(newPassword).strength}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  getPasswordStrength(newPassword).score >= 4 ? 'bg-green-500' :
                                  getPasswordStrength(newPassword).score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${(getPasswordStrength(newPassword).score / 5) * 100}%` }}
                              />
                            </div>
                            {getPasswordStrength(newPassword).feedback.length > 0 && (
                              <div className="text-xs text-gray-600">
                                Missing: {getPasswordStrength(newPassword).feedback.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className={newPasswordError ? 'border-red-500 pr-10' : 'pr-10'}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {newPasswordError && <p className="text-sm text-red-500">{newPasswordError}</p>}
                      </div>
                    </div>
                  )}
                </div>
                
                <AlertDialogFooter className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handlePasswordDialogClose}
                    disabled={isPasswordLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isPasswordLoading}
                  >
                    {isPasswordLoading ? 'Processing...' : passwordStep === 'new' ? 'Change Password' : 'Next'}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          {/* 2FA Setup/Disable Dialog */}
          <AlertDialog open={twoFactorDialogOpen} onOpenChange={setTwoFactorDialogOpen}>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {twoFactorStep === 'disable' ? 'Disable 2-Step Verification' : 'Enable 2-Step Verification'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {twoFactorStep === 'disable' 
                    ? 'Are you sure you want to disable 2-step verification? This will make your account less secure.'
                    : 'Set up 2-step verification using an authenticator app like Google Authenticator or Authy.'
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              {twoFactorStep === 'setup' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <div className="text-center">
                        <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">QR Code would appear here</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Scan this QR code with your authenticator app, or enter this setup key:
                    </p>
                    <div className="bg-gray-50 p-3 rounded border flex items-center justify-between">
                      <code className="text-sm font-mono">JBSWY3DPEHPK3PXP</code>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter verification code from your app:
                    </label>
                    <Input
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                </div>
              )}
              
              {twoFactorStep === 'verify' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      2-Step Verification Enabled!
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Your account is now protected with 2-step verification.
                    </p>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">Backup Codes</h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                      </p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        <code className="bg-white px-2 py-1 rounded">123456</code>
                        <code className="bg-white px-2 py-1 rounded">789012</code>
                        <code className="bg-white px-2 py-1 rounded">345678</code>
                        <code className="bg-white px-2 py-1 rounded">901234</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <AlertDialogFooter>
                <Button variant="outline" onClick={() => setTwoFactorDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (twoFactorStep === 'disable') {
                      setTwoFactorEnabled(false);
                      setTwoFactorDialogOpen(false);
                      toast.success('2-step verification disabled');
                    } else if (twoFactorStep === 'setup') {
                      setTwoFactorStep('verify');
                      setTwoFactorEnabled(true);
                    } else {
                      setTwoFactorDialogOpen(false);
                    }
                  }}
                  className={twoFactorStep === 'disable' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {twoFactorStep === 'disable' ? 'Disable' : 
                   twoFactorStep === 'setup' ? 'Verify & Enable' : 'Done'}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* 2-Step Verification */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-800">2-step verification</h4>
                {twoFactorEnabled && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Enabled
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {twoFactorEnabled 
                  ? 'Your account is protected with 2-step verification.'
                  : 'Add an additional layer of security to your account during login.'
                }
              </p>
            </div>
            <Switch 
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
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