import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { motion } from "framer-motion";
import frame1 from "../../assets/images/frame1.png";
import { Link } from "react-router-dom";
import { MoveUpRight } from "lucide-react";
import TaskExapanded from "../../assets/design/landing-page design/taskExpanded.png";
import timer1 from "../../assets/design/landing-page design/timer1.png"
import framer3 from "../../assets/images/frame3.png"
import framer5 from "../../assets/images/frame5.png"
import lines from "../../assets/images/lines.png"
import KoPoses from "../../assets/images/KoPoses.png"
import svg from "../../assets/images/SVG.png"
import youtubelogo from "../../assets/images/YoutubeLogo.png"
import tiwtter from "../../assets/images/twitter.png"
import thread from "../../assets/images/thread.png"


// Animation configs
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2 }
  })
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 }
  }
};


const cardData = [
  {
    title: "Effortless Time Tracking",
    desc: "Stop fumbling with timers and manual logs. Our smart detection runs quietly in the background, accurately tracking your productive hours so you can focus on what matters most.",
    number: "1"
  },
  {
    title: "Smart Break Management",
    desc: "Get gentle, science-backed nudges to hydrate, stretch, or reset your mind. Our smart reminders adapt to your work patterns, helping you maintain peak performance throughout the day.",
    number: "2"
  },
  {
    title: "Healthy Work Boundaries",
    desc: "Set personalized daily cutoffs and let our guided shutdown feature help you wrap up gracefully. View weekly wellness reports to see your progress and build sustainable work habits that stick.",
    number: "3"
  }
];

export const LandingPage: React.FC = () => {
  return (
    <main className="font-sans bg-white text-gray-900 overflow-hidden">
         {/* Logo */}
          <div className="flex justify-between items-center mb-6 px-8 pt-6 max-w-8xl mx-auto w-full">
            <img src={frame1} alt="Logo" className="w-20 md:w-30 md:translate-x-[50%]" />
              {/* login/sign up button */}
            <div className="text-[.7rem] p-2 z-10">
              <Link to="login" className="mr-[5px]">
                <Button variant="outline" className="border-blue1 text-blue1 px-6 py-2 rounded-[50px] md:px-10">
                  Log In
                </Button>
              </Link>
              <Link to="signup" className="">
                <Button className="bg-blue1 text-white px-6 py-2 rounded-[50px] md:px-10">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row md:items-center px-6 pt-8 pb-12 md:pt-16 md:pb-24 max-w-7xl mx-auto">

          {/* Left - Text */}
        <div className="flex-1">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-3xl md:text-[3rem] font-bold leading-tight mb-4 text-center md:text-left"
          >
            The All-in-one Time Management App for <br />
            <span className="text-blue1">Remote Workers</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="mb-6 text-base text-shadow-md text-xs w-[300px] md:w-[400px] text-center md:text-left md:text-sm"
          >
            Your time, your rules — ClockKo helps remote workers set boundaries, beat burnout, and stay balanced.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block text-xs md:text-sm font-sans"
          >
            <Button className="bg-blue1 text-white rounded-full px-6 py-2 text-base font-semibold shadow-md hover:bg-blue-700/80 transition mx-auto translate-x-15 md:mx-0 md:translate-x-0 font-inherit">
              Get Started for Free <span className="ml-2"><MoveUpRight /></span>
            </Button>
          </motion.div>
        </div>
        {/* Right - Image */}
        <div className="flex-1 flex justify-center mt-8 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-md rounded-xl shadow-lg bg-white border md:translate-x-50"
          >
            <div className="hidden md:block absolute top-[-11rem] z-0 right-0 rounded-[50%] rounded-right-none overflow-hidden bg-powderBlue w-[40vw] h-[74vh] left-[8rem]">
                circles
            </div>
            <img
              src={TaskExapanded}
              alt="Dashboard preview"
              className="w-full h-auto rounded-xl relative z-10"
            />
          </motion.div>
        </div>
      </section>

      {/* Why Choose ClockKo Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeUp}
        className="py-12 md:py-20 px-6 max-w-4xl mx-auto text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="text-2xl md:text-3xl font-bold mb-4"
        >
          Why Choose ClockKo?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={1}
          className="mb-10 text-gray-600 max-w-2xl mx-auto text-sm md:text-base text-shadow-md"
        >
          Built with remote realities in mind — slow internet, inconsistent power, multiple gigs, and that "one last email" at 6 PM.
        </motion.p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-2 md:translate-x-[-20%]"
        >
          <motion.div variants={fadeUp} custom={1} className="flex flex-col items-center">
            <img src={timer1} alt="Timer Icon" />
            <span className="mt-2 font-semibold text-center text-sm md:text-lg p-2 md:w-[230px]">Track your work hours <br className="md:hidden"/> effectively</span>
          </motion.div>

          {/* Vertical Divider */}
          
          <img src={lines} alt="Lines Icon" className="hidden md:block" />
          <motion.div variants={fadeUp} custom={2} className="flex flex-col items-center">
            <img src={framer5} alt="Break Icon" />
            <span className="mt-2 font-semibold text-center text-sm md:text-lg p-2 md:w-[230px]">Set healthy work-life <br className="md:hidden"/> boundaries</span>
          </motion.div>
          <img src={lines} alt="Lines Icon" className="hidden md:block" />


          <motion.div variants={fadeUp} custom={3} className="flex flex-col items-center">
            <img src={framer3} alt="Trend Icon" />
            <span className="mt-2 font-semibold text-center text-sm md:text-lg p-2 md:w-[230px]">Review your productivity <br className="md:hidden"/> trends</span>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* How ClockKo Helps Section */}
      <section className="bg-blue-50 py-12 md:py-20 px-6">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          className="text-2xl md:text-3xl font-bold text-center mb-10"
        >
          How ClockKo Helps
        </motion.h2>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {cardData.map((card, i) => (
            <motion.div
              key={card.number}
              custom={i + 1}
              variants={fadeUp}
              whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(52, 115, 246, 0.15)" }}
            >
              <Card className="rounded-xl shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle>
                    <span className="text-blue1 font-medium text-2xl md:text-5xl">{card.number}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold mb-2">{card.title}</div>
                  <p className="text-gray-600 text-sm">{card.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Ready to Own Your Time Again Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeUp}
        className="py-12 md:py-20 px-6 max-w-3xl mx-auto text-center"
      >
        <img src={KoPoses} alt="Koala Poses" className="mx-auto mb-4" />
        <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Own Your Time Again?
        </motion.h2>
        <motion.div
          variants={fadeUp}
          custom={1}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block font-sans text-xs"
        >
          <Button className="bg-blue1 font-sans text-white rounded-full px-6 py-2 text-base font-semibold shadow-md hover:bg-blue-700 transition">
            Get Started for Free
          </Button>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-white py-8 px-6 mt-8 text-center md:text-left text-shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-8">
          <div>
            <div className="flex items-center mb-2">
              <img src={frame1} alt="Logo" className="w-25 md:w-32 mx-auto md:mx-0" />
            </div>
            <p className="text-gray-600 text-sm max-w-xs mx-auto md:mx-0 w-50 md:w-70 md:text-left">
              The All-in-one Time Management App for Remote Workers
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2 text-sm">QUICK LINKS</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><a href="#" className="hover:text-blue1">Privacy policy</a></li>
              <li><a href="#" className="hover:text-blue1">Terms of Use</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2 text-sm">CONTACT US</h3>
            <p className="text-sm text-gray-700">clockko@gmail.com</p>
          </div>
          <div>
            <h3 className="font-bold mb-2 text-sm">JOIN OUR COMMUNITY</h3>
            <div className="flex gap-2 justify-center md:justify-start">
              {/* Community icons (You can swap for shadcn icons) */}
              <a href="#" className="text-blue-600"><img src={svg} alt="Discord" className="w-5 h-5 hover:transition duration-300 ease-in-out" /></a>
              <a href="#" className="text-blue-600"><img src={youtubelogo} alt="YouTube" className="w-5 h-5 hover:transition duration-300 ease-in-out" /></a>
              <a href="#" className="text-blue-600"><img src={tiwtter} alt="Twitter" className="w-5 h-5 hover:transition duration-300 ease-in-out" /></a>
              <a href="#" className="text-blue-600"><img src={thread} alt="Thread" className="w-5 h-5 hover:transition duration-300 ease-in-out" /></a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};


