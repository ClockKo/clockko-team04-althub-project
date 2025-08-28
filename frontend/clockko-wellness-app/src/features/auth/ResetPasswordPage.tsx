// src/pages/ResetPasswordPage.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

// 1. Define the validation schema
const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
//   const navigate = useNavigate();

  // 2. Set up react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // 3. Handle form submission
  const onSubmit = (data: ResetPasswordFormData) => {
    console.log('Password reset requested for:', data.email);
    // TODO: Call API to send password reset link
    // You might navigate to a confirmation page after this
    // navigate('/check-inbox-reset');
  };

  return (
    <AuthLayout hideHeader={true}>
      <div className="w-full text-left">
        <h1 className="text-[44px] text-center font-bold mb-2">Reset Password</h1>
        <p className="text-gray-500 text[16px] text-center mb-8">Enter your registered email address</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Email</label>
            <Input {...register('email')} placeholder="you@example.com" className="py-6" />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-[#34559E] hover:bg-[#2c4885] py-6 text-md mt-4 rounded-[24px]">
            Send Reset Link
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;