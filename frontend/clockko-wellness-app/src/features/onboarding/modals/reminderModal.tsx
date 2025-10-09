import { Button } from '../../../components/ui/button'
import { motion } from 'framer-motion'
import Group6 from '../../../assets/images/Group6.png'
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
      <div className="bg-coolWhite rounded-2xl p-4 xs:p-6 w-full max-w-xs xs:max-w-md md:max-w-[800px] mx-auto text-center shadow-lg relative">
        {/* Progress bar & step */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">
            Step {step} of {totalSteps}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-4">
            <div
              className="bg-blue1 h-1 rounded-full transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>{' '}
        </div>
        <img src={Group6} alt="Koala" className="mx-auto mb-2 mt-8" />
        <h2 className="text-lg xs:text-xl font-bold mb-1 mt-4">Enable Reminders</h2>
        <p className="text-gray-500 mb-4 text-sm">Help us help you maintain healthy work habits</p>
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="rounded-xl bg-whitey py-4 px-8 w-full max-w-[500px] xs:max-w-sm mx-auto shadow-md">
            {/* Guided Shutdown */}
            <div className="flex items-center justify-between py-4">
              <div className="text-left">
                <div className="font-semibold text-sm md:text-[1rem]">
                  Guided Shutdown Reminders
                </div>
                <div className="text-xs text-gray-500">
                  Get reminded to start your end-of-day routine
                </div>
              </div>
              <Switch
                role='switch'
                aria-label='guided shutdown reminders'
                checked={reminders.shutdown}
                onCheckedChange={(v) => setReminders({ ...reminders, shutdown: v })}
                className={`cursor-pointer !bg-lightGray !border-lightGray ${reminders.shutdown ? '!bg-blue1 !border-blue1' : '!bg-lightGray'} switch-bg !ring-0`}
              />
            </div>
            {/* Work Break */}
            <div className="flex items-center justify-between py-2">
              <div className="text-left">
                <div className="font-semibold text-sm md:text-lg">Work Break Reminders</div>
                <div className="text-xs text-gray-500">
                  Gentle nudges to take breaks during work sessions
                </div>
              </div>
              <Switch
                role='switch'
                aria-label='work break reminders'
                checked={reminders.break}
                onCheckedChange={(v) => setReminders({ ...reminders, break: v })}
                className={`cursor-pointer !bg-lightGray !border-lightGray ${reminders.break ? '!bg-blue1 !border-blue1' : '!bg-lightGray'} switch-bg !ring-0`}
              />
            </div>
            {/* Due Tasks */}
            <div className="flex items-center justify-between py-2">
              <div className="text-left">
                <div className="font-semibold text-sm md:text-lg">Due Tasks</div>
                <div className="text-xs text-gray-500">Get reminded about tasks and deadlines</div>
              </div>
              <Switch
                role='switch'
                aria-label='due tasks reminders'
                checked={reminders.tasks}
                onCheckedChange={(v) => setReminders({ ...reminders, tasks: v })}
                className={`cursor-pointer !bg-lightGray !border-lightGray ${reminders.tasks ? '!bg-blue1 !border-blue1' : '!bg-lightGray'} switch-bg !ring-0`}
              />
            </div>
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="flex justify-between gap-2 flex-col flex-col-reverse lg:flex-row">
          <Button
            variant="ghost"
            className="w-full md:w-[20%] font-thin cursor-pointer text-blue1 hover:bg-gray-200/50 hover:text-blue-900/80"
            onClick={onPrev}
          >
            Previous
          </Button>
          <Button
            className="w-full md:w-[20%] bg-blue1 text-white xs:px-6 xs:py-2 text-base rounded-lg font-thin cursor-pointer hover:bg-blue-900/80"
            onClick={onNext}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
