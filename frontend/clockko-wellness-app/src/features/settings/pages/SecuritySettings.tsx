import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Input } from '../../../components/ui/input';
import { 
  Smartphone, 
  Monitor, 
  Eye, 
  EyeOff, 
  QrCode, 
  Shield, 
  Copy,
  Tablet,
  MapPin,
  Calendar,
  AlertCircle,
  LogOut,
  Clock
} from 'lucide-react';
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
    const [twoFactorLoading, setTwoFactorLoading] = useState(false);
    const [twoFactorError, setTwoFactorError] = useState('');
    const [twoFactorPassword, setTwoFactorPassword] = useState('');
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [twoFactorQrCode, setTwoFactorQrCode] = useState('');
    const [twoFactorTotp, setTwoFactorTotp] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupCodesRemaining, setBackupCodesRemaining] = useState<number | null>(null);
  
  // Device management state
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);
  const [signOutAllDialogOpen, setSignOutAllDialogOpen] = useState(false);
  const [sessionFilter, setSessionFilter] = useState<'all' | 'mobile' | 'pc' | 'tablet'>('all');
  const [sessionSearch, setSessionSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');  // Reset dialog state when opened
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
  
  // 2FA toggle handler
  const handleTwoFactorToggle = async () => {
    setTwoFactorError('');
    setTwoFactorLoading(true);
    if (twoFactorEnabled) {
      setTwoFactorStep('disable');
      setTwoFactorDialogOpen(true);
      setTwoFactorLoading(false);
    } else {
      setTwoFactorStep('setup');
      setTwoFactorDialogOpen(true);
      setTwoFactorLoading(false);
    }
  };

  // Fetch 2FA status on mount
  React.useEffect(() => {
    async function fetchStatus() {
      try {
        setTwoFactorLoading(true);
        const status = await import('../../auth/api').then(m => m.getTwoFactorStatus());
        setTwoFactorEnabled(status.enabled);
        setBackupCodesRemaining(status.backup_codes_remaining);
      } catch (e) {
        setTwoFactorEnabled(false);
      } finally {
        setTwoFactorLoading(false);
      }
    }
    fetchStatus();
  }, []);

  // 2FA Setup handler
  const handleTwoFactorSetup = async () => {
    setTwoFactorLoading(true);
    setTwoFactorError('');
    try {
      const { setupTwoFactorAuth } = await import('../../auth/api');
      const resp = await setupTwoFactorAuth(twoFactorPassword);
      setTwoFactorSecret(resp.secret);
      setTwoFactorQrCode(resp.qr_code);
      setBackupCodes(resp.backup_codes);
      setTwoFactorStep('verify');
    } catch (e: any) {
      setTwoFactorError(e?.response?.data?.detail || 'Failed to setup 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // 2FA Verify handler
  const handleTwoFactorVerify = async () => {
    setTwoFactorLoading(true);
    setTwoFactorError('');
    try {
      const { verifyTwoFactorAuth } = await import('../../auth/api');
      await verifyTwoFactorAuth(twoFactorTotp);
      setTwoFactorEnabled(true);
      toast.success('2-step verification enabled!');
      setTwoFactorDialogOpen(false);
    } catch (e: any) {
      setTwoFactorError(e?.response?.data?.detail || 'Invalid verification code');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // 2FA Disable handler
  const handleTwoFactorDisable = async () => {
    setTwoFactorLoading(true);
    setTwoFactorError('');
    try {
      const { disableTwoFactorAuth } = await import('../../auth/api');
      await disableTwoFactorAuth(twoFactorPassword, twoFactorTotp);
      setTwoFactorEnabled(false);
      toast.success('2-step verification disabled');
      setTwoFactorDialogOpen(false);
    } catch (e: any) {
      setTwoFactorError(e?.response?.data?.detail || 'Failed to disable 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
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
              {twoFactorError && <p className="text-sm text-red-500 mb-2">{twoFactorError}</p>}
    
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
  
  // Mock data for device sessions - will be replaced with API calls
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
  
  // Device management functions
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
    toast.success('Session has been signed out');
  };

  const handleTerminateAllOtherSessions = () => {
    // TODO: Implement API call to terminate all other sessions
    console.log('Terminating all other sessions');
    setSignOutAllDialogOpen(false);
    toast.success('All other sessions have been signed out');
  };

  // Filter sessions based on search and filter criteria
  const getFilteredSessions = (sessions: typeof mockSessions) => {
    return sessions.filter(session => {
      // Apply device type filter
      if (sessionFilter !== 'all' && session.device_type !== sessionFilter) {
        return false;
      }
      
      // Apply search filter
      if (sessionSearch) {
        const searchLower = sessionSearch.toLowerCase();
        return (
          session.device_name.toLowerCase().includes(searchLower) ||
          session.location.toLowerCase().includes(searchLower) ||
          session.ip_address.includes(searchLower) ||
          session.os_name.toLowerCase().includes(searchLower) ||
          session.browser_name.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
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

      {/* Devices & Sessions Card */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Device & Session Management</h2>
          <p className="text-sm text-gray-600 mb-4">
            Manage your active sessions and devices. You can see where you're logged in and sign out of sessions you don't recognize.
          </p>
          
          {/* Session Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockSessions.filter(session => session.is_active).length}
              </div>
              <div className="text-xs text-gray-600">Active Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(mockSessions.filter(session => session.is_active).map(s => s.device_type)).size}
              </div>
              <div className="text-xs text-gray-600">Device Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(mockSessions.filter(session => session.is_active).map(s => s.location.split(',')[1]?.trim())).size}
              </div>
              <div className="text-xs text-gray-600">Locations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {mockSessions.filter(session => !session.is_active).length}
              </div>
              <div className="text-xs text-gray-600">Recent Sessions</div>
            </div>
          </div>
        </div>

        {/* Session Security Overview */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Session Security Score</h3>
              <p className="text-sm text-blue-700">
                Your sessions are secure. All locations are trusted.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">85%</div>
              <div className="text-xs text-blue-600">Secure</div>
            </div>
          </div>
          <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Current Session */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-4 w-4 text-green-500 mr-2" />
            Current Session
          </h3>
          
          {mockSessions.filter(session => session.is_current).map(session => (
            <div key={session.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getDeviceIcon(session.device_type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{session.device_name}</h4>
                    <p className="text-sm text-gray-600">
                      {session.os_name} • {session.browser_name} {session.browser_version}
                    </p>
                    <div className="flex flex-col mt-2 text-sm text-gray-500 space-y-1">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="mr-4">{session.location}</span>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Active now</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
                          IP: {session.ip_address}
                        </span>
                        <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                          Trusted Location
                        </span>
                      </div>
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

        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="flex items-center justify-center p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
            <LogOut className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm font-medium text-red-700">Sign out all devices</span>
          </button>
          <button className="flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">Review security</span>
          </button>
          <button className="flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <AlertCircle className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-700">Report suspicious</span>
          </button>
        </div>

        {/* Session Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search sessions by device, location, or IP..."
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'mobile', 'pc', 'tablet'] as const).map((filter) => (
              <Button
                key={filter}
                variant={sessionFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setSessionFilter(filter)}
                className="capitalize"
              >
                {filter === 'all' ? 'All Devices' : filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Other Active Sessions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h3 className="text-base font-semibold text-gray-900 flex items-center">
                <Monitor className="h-4 w-4 text-blue-500 mr-2" />
                Other Active Sessions ({mockSessions.filter(session => !session.is_current && session.is_active).length})
              </h3>
              <div className="ml-4 flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    viewMode === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Timeline
                </button>
              </div>
            </div>
            {mockSessions.filter(session => !session.is_current && session.is_active).length > 0 && (
              <AlertDialog open={signOutAllDialogOpen} onOpenChange={setSignOutAllDialogOpen}>
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
                    <Button variant="outline" onClick={() => setSignOutAllDialogOpen(false)}>
                      Cancel
                    </Button>
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

          {(() => {
            const filteredActiveSessions = getFilteredSessions(mockSessions.filter(session => !session.is_current && session.is_active));
            return filteredActiveSessions.length === 0;
          })() ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <Shield className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <h4 className="text-base font-medium text-gray-900 mb-2">No other active sessions</h4>
              <p className="text-sm text-gray-600">You're only signed in on this device.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredSessions(mockSessions.filter(session => !session.is_current && session.is_active)).map(session => (
                <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getDeviceIcon(session.device_type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{session.device_name}</h4>
                        <p className="text-sm text-gray-600">
                          {session.os_name} • {session.browser_name} {session.browser_version}
                        </p>
                        <div className="flex flex-col mt-1 text-sm text-gray-500 space-y-1">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="mr-4">{session.location}</span>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{getTimeAgo(session.last_activity)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
                              IP: {session.ip_address}
                            </span>
                            {session.location.includes('Nigeria') ? (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                Trusted Location
                              </span>
                            ) : (
                              <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">
                                New Location
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            First signed in: {formatDate(session.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <AlertDialog 
                      open={terminatingSession === session.id} 
                      onOpenChange={(open) => setTerminatingSession(open ? session.id : null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <LogOut className="h-3 w-3 mr-2" />
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
                          <Button variant="outline" onClick={() => setTerminatingSession(null)}>
                            Cancel
                          </Button>
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
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-4 w-4 text-gray-500 mr-2" />
            Recent Sessions
          </h3>

          {(() => {
            const filteredRecentSessions = getFilteredSessions(mockSessions.filter(session => !session.is_active));
            return filteredRecentSessions.length === 0;
          })() ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">No recent expired sessions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredSessions(mockSessions.filter(session => !session.is_active)).map(session => (
                <div key={session.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(session.device_type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-700">{session.device_name}</h4>
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Security Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• If you see a session you don't recognize, sign out of it immediately</li>
                <li>• Regularly review your active sessions, especially after using public computers</li>
                <li>• Sign out of all sessions if you suspect unauthorized access</li>
                <li>• Enable two-factor authentication for additional security</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecuritySettings;