import { Button } from '../../../components/ui/button'
import { motion } from 'framer-motion'
import { Progress } from '../../../components/ui/progress'
import Poses3 from '../../../assets/images/Poses3.png'

export function WelcomeModal({ onNext }: { onNext?: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-coolWhite rounded-2xl p-4 xs:p-6 w-full max-w-xs xs:max-w-md md:max-w-lg mx-auto text-center shadow-lg relative">
        <img src={Poses3} alt="koala bear poses" className="w-16 mx-auto mb-4" />
        <h2 className="text-dark text-xl xs:text-2xl font-bold mb-2">Welcome to ClockKo!</h2>
        <p className="text-darkGray mb-6 text-sm xs:text-base">
          Hi there, I’m Ko, your partner in healthy work habits!
          <br className="hidden xs:block" />
          Let’s set up your workspace for better work-life balance
        </p>
        <Progress value={0} className="mb-6 h-1 md:w-[400px] mx-auto bg-progressBarBlue" />

        <Button
          onClick={onNext}
          className="mt-8 bg-blue1 text-white float-right xs:px-6 xs:py-2 text-base rounded-lg transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100 hover:bg-blue1/80"
        >
          Next
        </Button>
      </div>
    </motion.div>
  )
}
