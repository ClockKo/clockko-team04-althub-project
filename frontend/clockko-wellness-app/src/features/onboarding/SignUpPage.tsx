import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import AuthLayout from './AuthLayout'

// 1. Define the validation schema for the sign-up form
const signUpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid work email' }),
})

// 2. Infer the TypeScript type from the schema
type SignUpFormInputs = z.infer<typeof signUpSchema>

const SignUpPage: React.FC = () => {
  const navigate = useNavigate()

  // 3. Set up react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormInputs>({
    resolver: zodResolver(signUpSchema),
  })

  // 4. This function will run on successful form submission
  const onSubmit = (data: SignUpFormInputs) => {
    console.log('Registration email submitted:', data.email)
    // TODO: Send the email to your backend API to generate a registration link

    // After successfully sending to the backend, navigate to the confirmation page
    // We pass the email in the route's state so the next page can display it
    navigate('/check-inbox', { state: { email: data.email } })
  }

  return (
    <AuthLayout>
      <div className="flex flex-col min-h-screen bg-white">
        

        {/* Sign Up Card */}
        <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
          <div className="w-full max-w-md">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Sign up for Free</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your Work E-mail"
                  className={`w-full text-center rounded-md border text-lg p-3 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full justify-center rounded-md bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Send me a registration link
              </Button>
            </form>

            <p className="mt-6 text-xs text-gray-500">
              By signing in, you agree to ClockKo's{' '}
              <Link to="/terms" className="underline hover:text-gray-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline hover:text-gray-700">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default SignUpPage
