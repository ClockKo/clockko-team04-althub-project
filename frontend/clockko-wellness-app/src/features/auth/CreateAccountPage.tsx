import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useHead } from '@unhead/react'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { registerUser } from './api' 
import { useAuth } from './authcontext'
import { GoogleLogin } from '@react-oauth/google'
// import googleLogo from '../../assets/images/google.png'
import toast from 'react-hot-toast'
import axios from 'axios'


// Validation schema
const createAccountSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your name' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
  agree: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and privacy policy',
  }),
})

type CreateAccountFormData = z.infer<typeof createAccountSchema>

const CreateAccountPage: React.FC = () => {
  // Set meta tags for create account page
  useHead({
    title: 'Create Account - ClockKo | Join the Productivity Revolution',
    meta: [
      {
        name: 'description',
        content: 'Create your free ClockKo account to start tracking time, managing tasks, and boosting your productivity with wellness features.'
      },
      {
        name: 'robots',
        content: 'noindex, nofollow' // Auth pages should not be indexed
      }
    ]
  });

  const navigate = useNavigate()
  const { setAuthToken } = useAuth() // Get the setAuthToken function
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Password strength validation function
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

  // Set up react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
  })

  // Watch password field for real-time strength checking
  const passwordValue = watch('password', '')

 
 const onSubmit = async (data: CreateAccountFormData) => {
  const { agree: _agree, ...registrationData } = data;
  setApiError(null);

  console.log('Data being sent to backend:', registrationData);

  try {
    const response = await registerUser(registrationData);
    console.log('Registration successful:', response);

    // Show success toast
    toast.success('Account created successfully! Please check your email for verification.');
    
    // Navigate to email verification page with email as query parameter
    navigate(`/verify-email?email=${encodeURIComponent(registrationData.email)}`);
  } catch (error: any) {
    console.error('Registration failed:', error);
    const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
    toast.error(errorMessage);
    setApiError(errorMessage);
  }
};


  const handleGoogleSuccess = async (credentialResponse: any) => {
    const googleIdToken = credentialResponse.credential;
    console.log('Google ID Token received:', googleIdToken ? 'Yes' : 'No');

    if (!googleIdToken) {
      console.error('No Google ID token received');
      setApiError('Google sign-up failed. Please try again.');
      return;
    }

    try {
      // Send Google ID token to backend using configured API base
      const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8000/api';
      const response = await axios.post(`${apiBase}/auth/google/verify`, { token: googleIdToken });
      const data = response.data;
      if (data.access_token) {
        setAuthToken(data.access_token);
        if (data.is_new_user) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        setApiError('Failed to log in after Google sign-up.');
      }
    } catch (error) {
      console.error('Google sign-up failed:', error);
      setApiError('An error occurred during Google sign-up.');
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    setApiError('Google sign-up was cancelled or failed.');
  };

  return (
    <AuthLayout hideHeader={true}>
      <div className="w-full text-left px-4 md:px-0">
        <h1 className="text-[24px] font-bold mb-2 text-center">Create your account</h1>
        <p className="text-gray-500 mb-8 text-center text-[16px]">
          Get started on ClockKo for free
        </p>

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Name</label>
            <Input {...register('name')} placeholder="Alex Smith" className="py-6 rounded-[16px]" />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Email</label>
            <Input
              {...register('email')}
              placeholder="you@example.com"
              className="py-6 rounded-[16px]"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">
              Password
              <span className="text-xs text-gray-500 font-normal mt-1 mb-2 block text-left">
                (8+ characters with uppercase, lowercase, number, and special character)
              </span>
            </label>
            <div className="relative">
              <Input
                {...register('password')}
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="py-6 rounded-[16px] pr-12"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {passwordValue && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Password Strength:</span>
                  <span className={`text-sm font-semibold ${getPasswordStrength(passwordValue).color}`}>
                    {getPasswordStrength(passwordValue).strength}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      getPasswordStrength(passwordValue).score >= 4 ? 'bg-green-500' :
                      getPasswordStrength(passwordValue).score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(getPasswordStrength(passwordValue).score / 5) * 100}%` }}
                  />
                </div>
                {getPasswordStrength(passwordValue).feedback.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Add:</span> {getPasswordStrength(passwordValue).feedback.join(', ')}
                  </div>
                )}
              </div>
            )}
            
            {errors.password && !passwordValue && (
              <p className="text-red-600 text-sm mt-1">Please enter a password</p>
            )}
            {errors.password && passwordValue && getPasswordStrength(passwordValue).score < 4 && (
              <p className="text-red-600 text-sm mt-1">
                Please create a stronger password using the guidelines above
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-3 pt-2">
              {/* <Checkbox id="agree" {...register('agree')} /> */}
              <input type="checkbox" id="agree" {...register('agree')} className="mr-2" />
              <label htmlFor="agree" className="text-sm text-gray-600">
                I agree to ClockKo's{' '}
                <Link to="/privacy" className="underline hover:text-gray-800">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link to="/terms" className="underline hover:text-gray-800">
                  Terms of Use
                </Link>
              </label>
            </div>
            {/* The error message is now correctly placed inside the parent div */}
            {errors.agree && <p className="text-red-600 text-sm mt-1">{errors.agree.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#34559E] hover:bg-[#2c4885] py-6 text-md mt-4 rounded-[24px]"
          >
            Sign Up
          </Button>
        </form>

        {apiError && <p className="text-red-600 text-sm mt-4 text-center">{apiError}</p>}

        {/* OR Separator */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-xs text-gray-400 font-semibold">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Google Sign Up Button */}
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
          Sign up with Google
        </button>
        
        {/* Hidden GoogleLogin for functionality */}
        <div className="hidden-google-btn absolute opacity-0 pointer-events-none -z-10">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signup_with"
            ux_mode="popup"
            auto_select={false}
          />
        </div>

        {/* Link to Sign In */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default CreateAccountPage
