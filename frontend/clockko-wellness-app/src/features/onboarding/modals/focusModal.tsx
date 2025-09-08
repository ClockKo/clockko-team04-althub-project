import { Button } from '../../../components/ui/button'
import { motion } from 'framer-motion'
import Group6 from '../../../assets/images/Group6.png'
import { useState } from 'react'

type FocusModalProps = {
  focusTimer: { hour: string; minute: string }
  setFocusTimer: (v: { hour: string; minute: string }) => void
  onNext: () => void
  onPrev: () => void
  step?: number
  totalSteps?: number
}

export function FocusModal({
  focusTimer,
  setFocusTimer,
  onNext,
  onPrev,
  step = 3,
  totalSteps = 5,
}: FocusModalProps) {
  // State for editing mode
  const [editing, setEditing] = useState<boolean>(false)

  // Input handlers
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let time = e.target.value.replace(/\D/, '') // only digits
    if (time.length > 2) time = time.slice(0, 2)
    setFocusTimer({ ...focusTimer, hour: time })
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let time = e.target.value.replace(/\D/, '') // only digits
    if (time.length > 2) time = time.slice(0, 2)
    setFocusTimer({ ...focusTimer, minute: time })
  }

  const handleSet = () => setEditing(false)

  return (
    <motion.div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white rounded-2xl p-4 xs:p-6 w-full max-w-xs xs:max-w-md md:max-w-[800px] mx-auto text-center shadow-lg relative">
        {/* Progress bar & step */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mt-2 mb-1">
            Step {step} of {totalSteps}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-4">
            <div
              className="bg-blue1 h-1 rounded-full transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <img src={Group6} alt="Koala bear face" className="mx-auto mt-8 mb-2" />
        <h2 className="text-[1.5rem] xs:text-xl font-bold mb-1 mt-8">Set your Focus Timer</h2>
        <p className="text-gray-500 mb-4 text-sm mt-4">
          Set a default timer for when you want to focus on work
        </p>

        {/* Timer input */}
        <div className="flex flex-col items-center mb-6 mt-8">
          <div className="flex justify-center items-center gap-2 bg-gray-100 rounded-xl px-4 py-8 mb-2 text-3xl">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{1,2}"
              maxLength={2}
              value={focusTimer.hour}
              onChange={handleHourChange}
              className="w-15 xs:w-12 text-center text-3xl xs:text-4xl font-bold bg-transparent outline-none"
              placeholder="00"
              aria-label="Hour"
              onFocus={() => setEditing(true)}
            />
            <span className="text-3xl xs:text-4xl font-bold">:</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{1,2}"
              maxLength={2}
              value={focusTimer.minute}
              onChange={handleMinuteChange}
              className="w-15 xs:w-12 text-center text-3xl xs:text-4xl font-bold bg-transparent outline-none"
              placeholder="00"
              aria-label="Minute"
              onFocus={() => setEditing(true)}
            />
          </div>

          <div className="mt-4 w-full max-w-[300px] lg:max-w-[100px] mx-auto">
            <Button
              className="w-full lg:rounded-full bg-mint hover:bg-mint/80 cursor-pointer text-black px-7 py-1 mb-3 font-medium"
              type="button"
              onClick={handleSet}
              disabled={!editing}
            >
              Set
            </Button>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="flex justify-between gap-2 flex-col flex-col-reverse lg:flex-row">
          <Button
            variant="ghost"
            className="md:w-[20%] font-thin cursor-pointer text-blue1 hover:bg-gray-200/50 hover:text-blue-900/80 w-full text-center"
            onClick={onPrev}
          >
            Previous
          </Button>
          <Button
            className="w-full md:w-[20%] bg-blue1 text-white xs:px-6 xs:py-2 text-base rounded-lg font-thin cursor-pointer hover:bg-blue-900/80"
            disabled={!focusTimer.hour || !focusTimer.minute}
            onClick={onNext}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
