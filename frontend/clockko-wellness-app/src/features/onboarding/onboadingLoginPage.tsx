import { useState } from "react";
import {motion } from "framer-motion";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {useNavigate } from "react-router-dom";
import frame1 from "../../assets/images/frame1.png";
import google from "../../assets/images/google.png";


export function OnboardingLoginPage() {
    const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string|number>("");
  const navigate = useNavigate();

  const handleLoginSubmit = () => {
    // Handle login logic here
    navigate("/onboarding/welcome");
  };

    return (    
  <motion.div className="min-h-screen bg-gray-50 flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    {/* header section */}
    <header className="flex justify-between items-center px-4 py-4 md:px-12 md:py-8">
        <div className="text-2xl font-bold text-blue1">
            {/* logo */}
            <img src={frame1} alt="Logo" className="w-20 md:w-30" />
        </div>

        {/* login/sign up button */}
        <div className="flex gap-2 text-[12px] md:gap-4 md:text-[14px]">
            <Button variant="outline" className="border-blue1 text-blue1 px-6 rounded-[50px] md:px-10">Log In</Button>
            <Button className="bg-blue1 text-white px-6 rounded-[50px] md:px-10">Sign Up</Button>
        </div>
    </header>

    {/* login card */}
    <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-xs md:max-w-md md:p-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Welcome to ClockKo!</h1>

            <motion.form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div>
                    <label htmlFor="email" className="text-[12px]">Email</label>
                    <Input
                      type="email"
                    placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="text-lightDark placeholder:text-lightDark placeholder:opacity-50 placeholder:font-light placeholder:text-[10px]"
                    />
                </div>
                <div className="relative">
                    <label htmlFor="password" className="text-[12px]">Password</label>
                    <Input
                      type="password"
                    placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="text-lightDark placeholder:text-lightDark placeholder:opacity-50 placeholder:font-light placeholder:text-[10px]"
                    />
                     <a href="#forgot-password" className="text-xs text-blue1 float-right mt-1 absolute right-[1rem] top-[1.8rem] text-[9px]">Forgot Password?</a>
                </div>

                {/* submit button */}
                <div className="flex flex-col gap-2 text-[12px]">
                    <Button type="submit" className="w-full bg-blue1 text-white mt-2 md:text-lg">Log In</Button>
                    <Button variant="outline" className="w-full flex items-center justify-between mt-2 text-base md:text-lg">
                       <img src={google} alt="Google logo" className="h-4 w-4" />
                       <span className="text-lightDark text-[12px] mr-[2rem] md:text-base md:text-xs md:mr-[6rem]">Sign in with Google</span>
                    </Button>
                </div>
            </motion.form>
        </div>
    </div>

  </motion.div>
    )
}