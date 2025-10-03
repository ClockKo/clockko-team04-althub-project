import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import AuthLayout from './AuthLayout'
import { verifyEmail, resendVerificationEmail } from './api'
import toast from 'react-hot-toast'

// Validation schema for OTP
const verificationSchema = z.object({
  otp: z.string().min(6, { message: 'Verification code must be 6 digits' }).max(6, { message: 'Verification code must be 6 digits' }),
})

type VerificationFormData = z.infer<typeof verificationSchema>

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  })

  const onSubmit = async (data: VerificationFormData) => {
    if (!email) {
      toast.error('Email address is missing')
      return
    }

    setIsVerifying(true)
    try {
      await verifyEmail(email, data.otp)
      toast.success('Email verified successfully!')
      // Route to login page after successful verification
      navigate('/signin?verified=true')
    } catch (error: any) {
      console.error('Verification failed:', error)
      const errorMessage = error.response?.data?.detail || 'Invalid or expired verification code'
      toast.error(errorMessage)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Email address is missing')
      return
    }

    setIsResending(true)
    try {
      await resendVerificationEmail(email)
      toast.success('Verification code sent successfully!')
    } catch (error: any) {
      console.error('Resend failed:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to resend verification code'
      toast.error(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout hideHeader={true}>
      <div className="w-full text-left px-4 md:px-0">
        <h1 className="text-[44px] font-bold mb-2 text-center">Verify Your Email</h1>
        <p className="text-gray-500 mb-8 text-center text-[16px]">
          We've sent a 6-digit verification code to<br />
          <span className="font-semibold text-gray-700">{email}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">
              Verification Code
            </label>
            <Input
              {...register('otp')}
              placeholder="Enter 6-digit code"
              className="py-6 rounded-[16px] text-center text-lg tracking-widest"
              maxLength={6}
              autoComplete="one-time-code"
            />
            {errors.otp && (
              <p className="text-red-600 text-sm mt-1">{errors.otp.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-[#34559E] hover:bg-[#2c4885] py-6 text-md mt-6 rounded-[24px]"
          >
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>

        {/* Resend Code */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Didn't receive the code?
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleResendCode}
            disabled={isResending}
            className="text-[#34559E] border-[#34559E] hover:bg-[#34559E] hover:text-white rounded-[16px]"
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </Button>
        </div>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Want to try a different email?{' '}
            <button
              onClick={() => navigate('/create-account')}
              className="font-semibold text-[#34559E] hover:text-[#2c4885] underline"
            >
              Go back to registration
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}

export default EmailVerificationPage