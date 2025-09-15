import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { registerUser } from './api'

// 1. Define the validation schema
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

  // 2. Set up react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
  })

  // 3. Handle form submission
  const onSubmit = async (data: CreateAccountFormData) => {
    // 👇 ADD this line to define registrationData
    const { agree, ...registrationData } = data

    try {
      // This will now work correctly
      const response = await registerUser(registrationData)
      console.log('Registration successful:', response)
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Registration failed:', error)
    }
  }

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    console.log('Google credential:', credentialResponse.credential)
    // TODO: Send this credential to your backend for verification
  }

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
              <Checkbox id="agree" {...register('agree')} />
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

        {/* OR Separator */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-xs text-gray-400 font-semibold">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Google Sign Up Button */}
        {/* <Button variant="outline" className="w-full flex items-center justify-center text-gray-700 py-6 text-md rounded-[16px]">
          <img src={google} alt="Google logo" className="h-5 w-5 mr-3" />
          Sign up with Google
        </Button> */}
        <div className="[&>div]:w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Google Login Failed')}
            theme="outline"
            size="large"
            shape="pill"
            text="signup_with" // 👈 Add this prop
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
