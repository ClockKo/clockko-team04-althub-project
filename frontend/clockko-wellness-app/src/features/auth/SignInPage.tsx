import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useHead } from '@unhead/react';
import AuthLayout from './AuthLayout';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { GoogleLogin } from '@react-oauth/google';
import { loginUser} from './api';
import { useAuth } from './authcontext';
import { useOnboarding } from '../../contexts/OnboardingContext';
// import googleLogo from '../../assets/images/google.png';
import toast from 'react-hot-toast';
import axios from 'axios';

// Validation schema for the sign-in form
const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

type SignInFormData = z.infer<typeof signInSchema>

const SignInPage: React.FC = () => {
//   const googleLoginRef = useRef<any>(null);
  
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
  const { checkBackendOnboardingStatus } = useOnboarding(); // Get onboarding check function
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
        
        // Check onboarding status after login and redirect accordingly
        await checkBackendOnboardingStatus();
        navigate('/dashboard'); // Navigate to dashboard, ProtectedRoutes will handle onboarding redirect if needed
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setApiError(error.response?.data?.detail || 'Incorrect email or password.');
    }
  };

  // Google Sign-In handler
  const handleGoogleSuccess = async (credentialResponse: any) => {
    const googleIdToken = credentialResponse.credential;
    console.log('Google ID Token received:', googleIdToken ? 'Yes' : 'No');

    if (!googleIdToken) {
      console.error('No Google ID token received');
      setApiError('Google sign-in failed. Please try again.');
      return;
    }

    try {
<<<<<<< HEAD
      // Send the ID token to backend
      const response = await axios.post(`http://localhost:8000/api/auth/google/verify`, {
        token: googleIdToken
=======
      // Send the access token to backend /api/auth/google/verify
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/google/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken }),
>>>>>>> b91f78e (Refactor IaC)
      });

      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
        
        // Check onboarding status after Google login and redirect accordingly
        await checkBackendOnboardingStatus();
        navigate('/dashboard'); // Navigate to dashboard, ProtectedRoutes will handle onboarding redirect if needed
      } else {
        console.error('Google login failed on the backend');
        setApiError('Google login failed. Please try again.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setApiError('An error occurred during Google login.');
    }
  };

<<<<<<< HEAD
  const handleGoogleError = () => {
    console.error('Google Login Failed');
    setApiError('Google sign-in was cancelled or failed.');
  };
=======
  const hasGoogleClient = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => console.error('Google Login Failed'),
  });
>>>>>>> b91f78e (Refactor IaC)

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
<<<<<<< HEAD
        <button
          onClick={() => {
            // Try to find and click the hidden Google button
            const hiddenGoogleBtn = document.querySelector('.hidden-google-btn div[role="button"]') as HTMLElement;
            if (hiddenGoogleBtn) {
              hiddenGoogleBtn.click();
            } else {
              // Alternative: try to find any Google button
              setTimeout(() => {
                const googleBtns = document.querySelectorAll('div[role="button"]');
                googleBtns.forEach(btn => {
                  if (btn.textContent?.toLowerCase().includes('google')) {
                    (btn as HTMLElement).click();
                  }
                });
              }, 100);
            }
          }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-[24px] bg-white hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium min-h-[48px]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
        
        {/* Hidden GoogleLogin for functionality */}
        <div className="hidden-google-btn absolute opacity-0 pointer-events-none -z-10">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signin_with"
            ux_mode="popup"
            auto_select={false}
          />
        </div>
=======
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center text-gray-700 py-6 text-md rounded-[24px]"
          onClick={() => hasGoogleClient ? googleLogin() : null}
          disabled={!hasGoogleClient}
        >
          <img src={googleLogo} alt="Google logo" className="mr-3 h-6 w-6" />
          {hasGoogleClient ? 'Sign in with Google' : 'Google sign-in unavailable'}
        </Button>
>>>>>>> b91f78e (Refactor IaC)

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