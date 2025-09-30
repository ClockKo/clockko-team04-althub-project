import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';
import { resetPassword } from './api';

// Define the validation schema
const resetPasswordConfirmSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  otp: z.string().min(6, { message: 'OTP must be 6 digits' }).max(6, { message: 'OTP must be 6 digits' }),
  newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordConfirmFormData = z.infer<typeof resetPasswordConfirmSchema>;

const PasswordResetConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get email from URL params if available
  const emailFromParams = searchParams.get('email') || '';

  // Set up react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordConfirmFormData>({
    resolver: zodResolver(resetPasswordConfirmSchema),
    defaultValues: {
      email: emailFromParams
    }
  });

  // Handle form submission
  const onSubmit = async (data: ResetPasswordConfirmFormData) => {
    console.log('Password reset confirmation for:', data.email);
    setIsLoading(true);
    
    try {
      await resetPassword(data.email, data.otp, data.newPassword);
      toast.success('Password reset successfully! You can now log in with your new password.');
      
      // Navigate to sign-in after success
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
      
    } catch (error: any) {
      console.error('Password reset failed:', error);
      const errorMessage = error?.response?.data?.detail || 'Failed to reset password. Please check your OTP and try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout hideHeader={true}>
      <div className="w-full text-left">
        <h1 className="text-[44px] text-center font-bold mb-2">Reset Password</h1>
        <p className="text-gray-500 text[16px] text-center mb-8">
          Enter the 6-digit code sent to your email and your new password
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Email</label>
            <Input 
              {...register('email')} 
              placeholder="you@example.com" 
              className="py-6"
              disabled={!!emailFromParams} // Disable if email came from URL
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">6-Digit Code</label>
            <Input 
              {...register('otp')} 
              placeholder="123456" 
              className="py-6"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
            />
            {errors.otp && <p className="text-red-600 text-sm mt-1">{errors.otp.message}</p>}
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">New Password</label>
            <Input 
              {...register('newPassword')} 
              type="password"
              placeholder="Enter new password" 
              className="py-6"
            />
            {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Confirm New Password</label>
            <Input 
              {...register('confirmPassword')} 
              type="password"
              placeholder="Confirm new password" 
              className="py-6"
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#34559E] hover:bg-[#2c4885] py-6 text-md mt-4 rounded-[24px]"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 text-center">
            Didn't receive the code?{' '}
            <a href="/reset-password" className="text-blue1 hover:underline">
              Request new code
            </a>
            {' '} | {' '}
            <a href="/sign-in" className="text-blue1 hover:underline">
              Back to Sign In
            </a>
          </p>
        </div>
       
      </div>
    </AuthLayout>
  );
};

export default PasswordResetConfirmPage;