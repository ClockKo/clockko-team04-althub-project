import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { registerUser, googleSignUp} from './api' 
import { useAuth } from './authcontext'
import { useGoogleLogin } from '@react-oauth/google'
import googleLogo from '../../assets/images/google.png'


// Validation schema
const createAccountSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your name' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  agree: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and privacy policy',
  }),
})

type CreateAccountFormData = z.infer<typeof createAccountSchema>

const CreateAccountPage: React.FC = () => {
  const navigate = useNavigate()
  const { setAuthToken } = useAuth() // Get the setAuthToken function
  const [apiError, setApiError] = useState<string | null>(null)

  // Set up react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
  })

 
 const onSubmit = async (data: CreateAccountFormData) => {
  const { agree, ...registrationData } = data;
  
  setApiError(null);

  console.log('Data being sent to backend:', registrationData);

  try {
    const response = await registerUser(registrationData);
    console.log('Registration successful:', response);

    if (response.access_token) {
      setAuthToken(response.access_token);
      navigate('/dashboard');
    } else {
      navigate('/signin');
    }
  } catch (error: any) {
    console.error('Registration failed:', error);
    setApiError(error.response?.data?.detail || 'An unknown registration error occurred.');
  }
};


  const handleGoogleSuccess = async (tokenResponse: any) => {
    const googleAccessToken = tokenResponse.access_token;
    console.log('Google Access Token:', googleAccessToken);

    try {
      // Send Google token to your backend and get your app's token
      const response = await googleSignUp(googleAccessToken);

      // Check if you received your app's access token
      if (response.access_token) {
        // Set the auth state in your app
        setAuthToken(response.access_token);
        // Now navigate to the dashboard
        navigate('/dashboard');
      } else {
        setApiError('Failed to log in after Google sign-up.');
      }
    } catch (error) {
      console.error('Google sign-up failed:', error);
      setApiError('An error occurred during Google sign-up.');
    }
  };

  // Google login popup
  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => console.error('Google Login Failed'),
  })

  return (
    <AuthLayout hideHeader={true}>
      <div className="w-full text-left">
        <h1 className="text-[44px] font-bold mb-2 text-center">Create your account</h1>
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
            <label className="text-sm font-bold text-gray-700 mb-1 block">Password</label>
            <Input
              {...register('password')}
              type="password"
              placeholder="********"
              className="py-6 rounded-[16px]"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
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
        {/* <div className="[&>div]:w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Google Login Failed')}
            theme="outline"
            size="large"
            shape="pill"
            text="signup_with" // 👈 Add this prop
          />
        </div> */}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center text-gray-700 py-6 text-md rounded-[24px]"
          onClick={() => googleLogin()}
        >
          <img src={googleLogo} alt="Google logo" className="mr-3 h-6 w-6" />
          Sign up with Google
        </Button>

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
