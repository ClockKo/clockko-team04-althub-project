import { Button } from '../../../components/ui/button'
import { motion } from 'framer-motion'
import Group6 from '../../../assets/images/Group6.png'
import { Progress } from '../../../components/ui/progress'
import { Calendar } from 'lucide-react'

const workDays = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
]

export function WorkDaysModal({
  onNext,
  selectedDays,
  setSelectedDays,
  step = 1,
  totalStep = 5,
  onPrev,
}: {
  onNext?: () => void
  onPrev?: () => void
  selectedDays: string[]
  setSelectedDays: (v: string[]) => void
  step?: number
  totalStep?: number
}) {
  const handleToggle = (day: { id: number; name: string }) => {
    setSelectedDays(
      selectedDays.includes(day.name)
        ? selectedDays.filter((d) => d !== day.name)
        : [...selectedDays, day.name]
    )
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white rounded-2xl p-4 xs:p-6 w-full max-w-xs xs:max-w-md md:max-w-xl mx-auto text-center shadow-lg relative">
        {/*Progress bar and steps */}

        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">
            Step {step} of {totalStep}
          </div>
          <Progress value={step} max={totalStep} />
        </div>
        <div className="absolute top-4 right-4">
          <Button variant="outline" onClick={onNext}>
            Skip
          </Button>
        </div>

        <img src={Group6} alt="koala bear face" className="mx-auto mb-2" />

        <h2 className="text-veryDark text-lg xs:text-xl font-bold mb-1">Choose your Work Days</h2>
        <p className="text-darkGray mb-4 text-sm">Select the days you typically work</p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {workDays.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => handleToggle(day)}
              className={`flex items-center justify-center px-2 py-2 rounded-lg border text-sm xs:px-4 xs:py-2 xs:text-base
                ${
                  selectedDays.includes(day.name)
                    ? 'bg-lightBlue text-black'
                    : 'bg-White border border-borderGray text-gray-800'
                }
              `}
            >
              <Calendar className="mr-2 text-blue1" />
              {day.name}
            </button>
          ))}
        </div>

        <div className='flex justify-between gap-2'>
            <Button variant="ghost" onClick={onPrev} className='w-1/2 text-blue1 font-thin'>
              Previous
            </Button>

        <Button
          className="w-1/2 bg-blue1 text-white xs:px-6 xs:py-2 text-base rounded-lg"
          disabled={selectedDays.length === 0}
          onClick={onNext}
        >
          Next
        </Button>
        </div>
      </div>
    </motion.div>
  )
}
