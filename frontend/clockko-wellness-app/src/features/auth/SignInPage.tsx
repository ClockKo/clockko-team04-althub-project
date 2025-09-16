import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

// 1. Define the validation schema for the sign-in form
const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

type SignInFormData = z.infer<typeof signInSchema>

const SignInPage: React.FC = () => {
  const navigate = useNavigate()

  // 2. Set up react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  // 3. Handle form submission
  const onSubmit = (data: SignInFormData) => {
    console.log('Data to be sent to backend:', data);

    navigate('/dashboard');
  };

  // const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
  //   console.log('Google credential:', credentialResponse.credential);
  //   // TODO: Send this credential to your backend for verification
  // };
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const response = await fetch('http://localhost:8000/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      if (response.ok) {
        // Optionally store token or user info here
        navigate('/dashboard');
      } else {
        // Handle error (show message, etc.)
        console.error('Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <AuthLayout hideHeader={true}>
      <div className="w-full text-left">
        <h1 className="text-[44px] text-center font-bold mb-2">Sign in to your account</h1>
        <p className="text-gray-500 text-center mb-8">Pick up where you left off</p>

        {/* The main form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Email</label>
            <Input {...register('email')} placeholder="you@example.com" className="py-6" />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-bold text-gray-700">Password</label>
            </div>
            <Input
              {...register('password')}
              type="password"
              placeholder="********"
              className="py-6"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
            <Link to="/reset-password" className="text-sm text-indigo-600 hover:underline block mt-4">
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}

          <Button
            type="submit"
            className="w-full bg-[#34559E] hover:bg-[#2c4885] py-6 text-md mt-4 rounded-[24px]"
          >
            Sign In
          </Button>
        </form>

        {/* OR Separator */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-xs text-gray-400 font-semibold">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Google Sign In Button */}
        {/* <Button
          variant="outline"
          className="w-full flex items-center justify-center text-gray-700 py-6 text-md"
        >
          <img src={google} alt="Google logo" className="h-5 w-5 mr-3" />
          Sign in with Google
        </Button> */}
        <div className="[&>div]:w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Google Login Failed')}
            theme="outline"
            size="large"
            shape="pill"
          />
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/create-account"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default SignInPage
