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
import googleLogo from '../../assets/images/google.png'
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
      // Send Google ID token to backend
      const response = await axios.post('http://localhost:8000/api/auth/google/verify', {
        token: googleIdToken
      });

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
        <div className="w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signup_with"
            width="100%"
            size="large"
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
