import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useHead } from '@unhead/react';
import AuthLayout from './AuthLayout';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useGoogleLogin } from '@react-oauth/google';
import { loginUser } from './api';
import { useAuth } from './authcontext';
import googleLogo from '../../assets/images/google.png';
import toast from 'react-hot-toast';

// Validation schema for the sign-in form
const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

type SignInFormData = z.infer<typeof signInSchema>

const SignInPage: React.FC = () => {
  // Set meta tags for sign-in page
  useHead({
    title: 'Sign In - ClockKo | Access Your Productivity Dashboard',
    meta: [
      {
        name: 'description',
        content: 'Sign in to your ClockKo account to access your productivity dashboard, track time, manage tasks, and boost your wellness.'
      },
      {
        name: 'robots',
        content: 'noindex, nofollow' // Auth pages should not be indexed
      }
    ]
  });

  const navigate = useNavigate();
  const { setAuthToken } = useAuth(); // Get setAuthToken
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Check if user came from email verification
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified successfully! You can now log in.');
    }
  }, [searchParams]);

  // React-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  // Handle form submission
  const onSubmit = async (data: SignInFormData) => {
    setApiError(null);
    try {
      const response = await loginUser(data);
      console.log('Login successful:', response);

      if (response.access_token) {
        setAuthToken(response.access_token);
        navigate('/onboarding'); // Redirect to onboarding after login
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setApiError(error.response?.data?.detail || 'Incorrect email or password.');
    }
  };

  // Google Sign-In handler
  const handleGoogleSuccess = async (tokenResponse: any) => {
    const accessToken = tokenResponse.access_token;
    console.log('Google Access Token:', accessToken);

    try {
      // Send the access token to backend /api/auth/google/verify
      const response = await fetch('http://localhost:8000/api/auth/google/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          setAuthToken(data.access_token);
          if (data.is_new_user) {
            navigate('/onboarding');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        console.error('Google login failed on the backend');
        setApiError('Google login failed. Please try again.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setApiError('An error occurred during Google login.');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => console.error('Google Login Failed'),
  });

  return (
    <AuthLayout hideHeader={true}>
      <div className="w-full text-left px-4 md:px-0">
        <h1 className="text-[24px] text-center font-bold mb-2">Sign in to your account</h1>
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

        {/* API error display */}
        {apiError && <p className="text-red-600 text-sm mt-4 text-center">{apiError}</p>}


        {/* OR Separator */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-xs text-gray-400 font-semibold">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center text-gray-700 py-6 text-md rounded-[24px]"
          onClick={() => googleLogin()}
        >
          <img src={googleLogo} alt="Google logo" className="mr-3 h-6 w-6" />
          Sign in with Google
        </Button>

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