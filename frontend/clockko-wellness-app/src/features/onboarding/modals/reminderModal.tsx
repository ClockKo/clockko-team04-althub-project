import { Button } from '../../../components/ui/button'
import { motion } from 'framer-motion'
import Group6 from '../../../assets/images/Group6.png'
import { Progress } from '../../../components/ui/progress'
import { Switch } from '../../../components/ui/switch'

type ReminderModalProps = {
  reminders: {
    shutdown: boolean
    break: boolean
    tasks: boolean
  }
  setReminders: (v: { shutdown: boolean; break: boolean; tasks: boolean }) => void
  onNext: () => void
  onPrev: () => void
  step?: number
  totalSteps?: number
}

export function ReminderModal({
  reminders,
  setReminders,
  onNext,
  onPrev,
  step = 5,
  totalSteps = 5,
}: ReminderModalProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white rounded-2xl p-4 xs:p-6 w-full max-w-xs xs:max-w-md md:max-w-xl mx-auto text-center shadow-lg relative">
        {/* Progress bar & step */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">
            Step {step} of {totalSteps}
          </div>
          <Progress className="bg-progressBarBlue h-1" value={(step / totalSteps) * 100} />
        </div>
        <img src={Group6} alt="Koala" className="mx-auto mb-2" />
        <h2 className="text-lg xs:text-xl font-bold mb-1">Enable Reminders</h2>
        <p className="text-gray-500 mb-4 text-sm">Help us help you maintain healthy work habits</p>
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="rounded-xl bg-gray-50 p-4 w-full max-w-xs xs:max-w-sm mx-auto">
            {/* Guided Shutdown */}
            <div className="flex items-center justify-between py-2">
              <div className="text-left">
                <div className="font-semibold">Guided Shutdown Reminders</div>
                <div className="text-xs text-gray-500">
                  Get reminded to start your end-of-day routine
                </div>
              </div>
              <Switch
                checked={reminders.shutdown}
                onCheckedChange={(v) => setReminders({ ...reminders, shutdown: v })}
                className={reminders.shutdown ? 'bg-blue-600' : 'bg-gray-200'}
              />
            </div>
            {/* Work Break */}
            <div className="flex items-center justify-between py-2">
              <div className="text-left">
                <div className="font-semibold">Work Break Reminders</div>
                <div className="text-xs text-gray-500">
                  Gentle nudges to take breaks during work sessions
                </div>
              </div>
              <Switch
                checked={reminders.break}
                onCheckedChange={(v) => setReminders({ ...reminders, break: v })}
                className="cursor-pointer switch"
              />
            </div>
            {/* Due Tasks */}
            <div className="flex items-center justify-between py-2">
              <div className="text-left">
                <div className="font-semibold">Due Tasks</div>
                <div className="text-xs text-gray-500">Get reminded about tasks and deadlines</div>
              </div>
              <Switch
                checked={reminders.tasks}
                onCheckedChange={(v) => setReminders({ ...reminders, tasks: v })}
                className="cursor-pointer switch"
              />
            </div>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="flex justify-between gap-2">
          <Button
            variant="ghost"
            className="w-1/2 md:w-[20%] font-thin cursor-pointer"
            onClick={onPrev}
          >
            Previous
          </Button>
          <Button
            className="w-1/2 md:w-[20%] bg-blue1 text-white xs:px-6 xs:py-2 text-base rounded-lg"
            onClick={onNext}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
