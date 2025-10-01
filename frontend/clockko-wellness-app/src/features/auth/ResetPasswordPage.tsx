import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';
import { sendPasswordResetEmail } from './api';

// Define the validation schema
const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Set up react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Handle form submission
  const onSubmit = async (data: ResetPasswordFormData) => {
    console.log('Password reset requested for:', data.email);
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(data.email);
      toast.success('If the email is registered, a reset code has been sent. Please check your inbox.');
      
      // Navigate to OTP confirmation page with email as parameter
      setTimeout(() => {
        navigate(`/reset-password-confirm?email=${encodeURIComponent(data.email)}`);
      }, 2000);
      
    } catch (error: any) {
      console.error('Password reset request failed:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout hideHeader={true}>
  <div className="w-full text-left px-4 md:px-0">
        <h1 className="text-[24px] text-center font-bold mb-2">Reset Password</h1>
        <p className="text-gray-500 text[16px] text-center mb-8">Enter your registered email address</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Email</label>
            <Input {...register('email')} placeholder="you@example.com" className="py-6" />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#34559E] hover:bg-[#2c4885] py-6 text-md mt-4 rounded-[24px]"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        <div className="mt-4">
          <p className="text-sm text-gray-600 text-center">
            Remembered your password?{' '}
            <a href="/sign-in" className="text-blue1 hover:underline">
              Sign In
            </a>
            {/* go back to the home page */}
            <a href="/" className="text-blue1 hover:underline">  
              {' '} homepage
            </a>
          </p>
        </div>
       
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;