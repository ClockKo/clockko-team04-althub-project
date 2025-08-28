// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import { Input } from '../../components/ui/input'
// import { Button } from '../../components/ui/button'
// import { useNavigate } from 'react-router-dom'
// import frame1 from '../../assets/images/frame1.png'
// import google from '../../assets/images/google.png'
// import { Mail, LockKeyhole } from 'lucide-react'

// export function OnboardingLoginPage() {
//   const [email, setEmail] = useState<string>('')
//   const [password, setPassword] = useState<string | number>('')
//   const navigate = useNavigate()

//   const handleLoginSubmit = () => {
//     // Handle login logic here
//     navigate('/onboarding/welcome')
//     navigate('/dashboard')
//   }

//   return (
//     <motion.div
//       className="min-h-screen bg-gray-50 flex flex-col"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//     >
//       {/* header section */}
//       <header className="flex justify-between items-center px-4 py-4 md:px-12 md:py-8">
//         <div className="text-2xl font-bold text-blue1">
//           {/* logo */}
//           <img src={frame1} alt="Logo" className="w-20 md:w-30" />
//         </div>

//         {/* login/sign up button */}
//         <div className="flex gap-2 text-[12px] md:gap-4 md:text-[14px]">
//           <Button
//             variant="outline"
//             className="border-blue1 text-blue1 px-6 rounded-[50px] md:px-10"
//           >
//             Log In
//           </Button>
//           <Button className="bg-blue1 text-white px-6 rounded-[50px] md:px-10">Sign Up</Button>
//         </div>
//       </header>

//       {/* login card */}
//       <div className="flex-1 flex items-center justify-center">
//         <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs md:max-w-md md:p-10">
//           <h1 className="text-2xl font-bold mb-6 text-center">Welcome to ClockKo!</h1>

//           <motion.form className="space-y-4" onSubmit={handleLoginSubmit}>
//             <div className='relative'>
//               <label htmlFor="email" className="text-[12px] relative top-[-6px]">
//                 Email
//               </label>
//                 {email === "" && (
//                   <span className="absolute inset-y-0 left-0 top-6 flex items-center pl-3">
//                     <Mail className="h-4 w-4 text-gray" />
//                   </span>
//                 )}
//               <Input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="text-lightDark placeholder:text-lightDark placeholder:opacity-50 placeholder:font-light placeholder:text-[10px] placeholder:pl-6"
//               />
//             </div>
//             <div className="relative">
//               <label htmlFor="password" className="text-[12px] relative top-[-6px]">
//                 Password
//               </label>
//                 {password === "" && (
//                     <span className="absolute inset-y-0 left-0 top-6 flex items-center pl-3">
//                     <LockKeyhole className="h-4 w-4 text-gray" />
//                     </span>
//                 )}
//               <Input
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="text-lightDark placeholder:text-lightDark placeholder:opacity-50 placeholder:font-light placeholder:text-[10px] placeholder:pl-6"
//               />
//               <a
//                 href="#forgot-password"
//                 className="text-xs text-blue1 float-right mt-1 absolute right-[1rem] top-[1.8rem] text-[9px]"
//               >
//                 Forgot Password?
//               </a>
//             </div>

//             {/* submit button */}
//             <div className="flex flex-col gap-2 text-[12px]">
//               <Button type="submit" className="shadow-lg cursor-pointer w-full bg-blue1 text-white mt-2 md:text-lg transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100 hover:bg-blue1/80">
//                 Log In
//               </Button>
//               <Button
//                 variant="outline"
//                 className="cursor-pointer w-full flex items-center justify-between mt-2 text-base md:text-lg transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
//               >
//                 <img src={google} alt="Google logo" className="h-4 w-4" />
//                 <span className="text-lightDark text-[12px] mr-[2rem] md:text-base md:text-xs md:mr-[6rem]">
//                   Sign in with Google
//                 </span>
//               </Button>
//             </div>
//           </motion.form>
//         </div>
//       </div>
//     </motion.div>
//   )
// }

import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import google from '../../assets/images/google.png'
import { Mail, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import TestAuthLayout from '../auth/TestAuthLayout'

// 1. Define the validation schema and TypeScript type
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

type LoginFormInputs = z.infer<typeof loginSchema>

export function OnboardingLoginPage() {
  const navigate = useNavigate()

  // 2. Set up react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  })
  // 3. This function will run on successful form submission
  const handleLoginSubmit = (data: LoginFormInputs) => {
    console.log('Login data:', data)
    navigate('/dashboard')
  }

  return (
    <TestAuthLayout bgColor="bg-gray-50">
      <motion.div className="flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Login card */}
        <div className="flex-1 flex items-center justify-center flex-col">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs md:max-w-md md:p-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Welcome to ClockKo!</h1>

            {/* 4. Connect the form to handleSubmit */}
            <motion.form className="space-y-4" onSubmit={handleSubmit(handleLoginSubmit)}>
              <div className="relative">
                <label htmlFor="email" className="text-[12px] block mb-1 text-left">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </span>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className={`pl-10 text-lightDark placeholder:text-lightDark placeholder:opacity-50 placeholder:font-light placeholder:text-[12px] ${errors.email ? 'border-red-500' : ''}`}
                    // 5. Register the input field
                    {...register('email')}
                  />
                </div>
                {/* 6. Display validation error */}
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="password" className="text-[12px] block mb-1 text-left">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockKeyhole className="h-4 w-4 text-gray-400" />
                  </span>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className={`pl-10 text-lightDark placeholder:text-lightDark placeholder:opacity-50 placeholder:font-light placeholder:text-[12px] ${errors.password ? 'border-red-500' : ''}`}
                    // 5. Register the input field
                    {...register('password')}
                  />
                  <a
                    href="#forgot-password"
                    className="text-xs text-blue1 absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    Forgot Password?
                  </a>
                </div>
                {/* 6. Display validation error */}
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="submit"
                  className="shadow-lg w-full bg-blue1 text-white md:text-lg transition hover:-translate-y-1 hover:scale-100 hover:bg-blue1/80"
                >
                  Log In
                </Button>
                <Button
                  variant="outline"
                  type="button" // Set type to button to prevent form submission
                  className="w-full flex items-center justify-center mt-2 text-base md:text-lg transition hover:-translate-y-1 hover:scale-100"
                >
                  <img src={google} alt="Google logo" className="h-5 w-5 mr-3" />
                  <span className="text-lightDark text-[12px] md:text-sm">Sign in with Google</span>
                </Button>
              </div>
            </motion.form>
          </div>
          {/* Sign Up Link */}
          <p className="mt-16 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/create-account" className='ml-8'>
              <Button
                type="submit"
                className="shadow-lg bg-blue1 text-white md:text-lg transition hover:-translate-y-1 hover:scale-100 hover:bg-blue1/80"
              >
                Sign Up
              </Button>
            </Link>
          </p>
        </div>
      </motion.div>
    </TestAuthLayout>
  )
}
