// src/pages/CreateAccountPage.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './TestAuthLayout';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox'; // Assuming you have a Checkbox component

// 1. Define the validation schema
const createAccountSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your name' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  agree: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and privacy policy',
  }),
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

const CreateAccountPage: React.FC = () => {
  const navigate = useNavigate();

  // 2. Set up react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
  });

  // 3. Handle form submission
  const onSubmit = (data: CreateAccountFormData) => {
    console.log('Create account data:', data);
    // TODO: Call API to register the user
    navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <div className="text-left">
        <h1 className="text-4xl font-bold mb-2">Create your account</h1>
        <p className="text-gray-600 mb-6">Get started on ClockKo for free</p>

        <Button variant="outline" className="w-full mb-4">
          {/* Add Google Icon */}
          Sign up with Google
        </Button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>Name</label>
            <Input {...register('name')} placeholder="Alex Smith" />
            {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
          </div>
          <div>
            <label>Email</label>
            <Input {...register('email')} placeholder="you@example.com" />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <label>Password</label>
            <Input {...register('password')} type="password" placeholder="********" />
            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="agree" {...register('agree')} />
            <label htmlFor="agree" className="text-sm">
              I agree to ClockKo's <Link to="/privacy" className="underline">Privacy Policy</Link> and <Link to="/terms" className="underline">Terms of Use</Link>
            </label>
          </div>
          {errors.agree && <p className="text-red-600 text-sm">{errors.agree.message}</p>}

          <Button type="submit" className="w-full bg-[#34559e] hover:bg-[#2c4885]">
            Sign Up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          Already have an account? <Link to="/signin" className="font-semibold text-indigo-600">Log in</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default CreateAccountPage;