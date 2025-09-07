import { Dialog, DialogContent } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { cn } from '../../../lib/utils'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import facelogo from '../../../assets/images/Faces.png'
import KoalaPose from '../../../assets/images/Poses.png'

// Types
type TodayTask = {
  name: string
  completed: boolean
}

type ProgressData = {
  tasksCompleted: number
  tasksTotal: number
  focusTime: number
  focusGoal: number
  pendingTasks: number
  shutdownStreak: number
  pointEarned: number
  clockedOutTime?: string
  todayTasks: TodayTask[]
}

// Demo data for progress bar and tasks
const demoProgress: ProgressData = {
  tasksCompleted: 2,
  tasksTotal: 4,
  focusTime: 90, // mins
  focusGoal: 120, // mins
  pendingTasks: 0,
  shutdownStreak: 0,
  pointEarned: 50,
  clockedOutTime: '18:30',
  todayTasks: [
    { name: 'Design wireframes for dashboard', completed: true },
    { name: 'Attend leadership meeting', completed: true },
    { name: 'Design wireframes for dashboard', completed: false },
    { name: 'Write API docs', completed: false },
  ],
}

// Utility to fetch shutdown data from API using axios
async function fetchShutdownData() {
  try {
    const res = await axios.get('/api/dashboard/shutdown-summary')
    return res.data
  } catch (e) {
    console.error('Failed to fetch shutdown data:', e)
    return null
  }
}

// Mock function to simulate API call - replace with real API call as needed
export function ShutdownModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  // function to go to next step or close modal
  function next() {
    if (step < steps.length - 1) setStep((s) => s + 1)
    else onClose()
  }
  function prev() {
    if (step > 0) setStep((s) => s - 1)
  }

  // state to track current step and progress data
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState<ProgressData>(demoProgress)

  //query for fetching shutdown data
  const { data, isLoading } = useQuery({
    queryKey: ['shutdown-summary'],
    queryFn: fetchShutdownData,
    enabled: open, // Only fetch when modal is open
  })

  useEffect(() => {
    if (data) setProgress(data)
    else setProgress(demoProgress) // fallback to mock data
  }, [data])

  // Build steps dynamically from progress data
  const steps = [
    {
      title: "Review Today's Tasks",
      subtitle: `You completed ${progress.tasksCompleted} of ${progress.tasksTotal} tasks`,
      content: (
        <>
          <div className="mb-2">
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue1 rounded-full"
                style={{ width: `${(progress.tasksCompleted / progress.tasksTotal) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-6 mb-6">
            {(progress.todayTasks || []).map((task, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg px-3 py-2 bg-gray-100 text-sm text-darkGray',
                  task.completed && 'line-through text-gray-400'
                )}
              >
                {task.name}
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      title: 'Disconnect Mindfully',
      subtitle: 'Take a moment to properly close your work day',
      content: (
        <div className="flex flex-col gap-2 mb-6 mt-6">
          <div className="rounded-lg px-3 py-4 bg-gray-100 text-sm text-darkGray">
            Set your slack status to Away
          </div>
          <div className="rounded-lg px-3 py-4 bg-gray-100 text-sm text-darkGray">
            Pause work notifications till tomorrow
          </div>
          <div className="rounded-lg px-3 py-4 bg-gray-100 text-sm text-darkGray">
            Give any necessary updates (if any) to stakeholders
          </div>
        </div>
      ),
    },
    {
      title: 'Reflect on your day',
      subtitle: 'How was your productivity today?',
      content: (
        <div className="">
          <div className="flex flex-col lg:flex-row gap-2 items-center justify-center">
            <div className="group1 flex gap-2">
              <span className="text-sm font-regular text-darkGray text-center bg-successGreen px-4 py-2 rounded-lg">
                Great
              </span>
              <span className="text-sm font-regular text-darkGray text-center bg-lightGreen px-4 py-2 rounded-lg">
                Good
              </span>
            </div>
            <div className="group2 flex gap-2">
              <span className="text-sm font-regular text-darkGray text-center bg-warningYellow px-4 py-2 rounded-lg">
                Okay
              </span>
              <span className="text-sm font-regular text-darkGray text-center bg-errorRed px-4 py-2 rounded-lg">
                Tough
              </span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">Add a note?</div>
          <textarea
            className="border-2 border-lightGray w-full rounded-lg py-4 bg-gray-100 text-sm mt-2 px-4"
            name="add-note"
            id="note"
            placeholder="Any wins, challenges, or thoughts to remember? "
          ></textarea>
        </div>
      ),
    },
    {
      content: (
        <div className="">
          <img src={KoalaPose} alt="Koala mascot" className="w-24 h-24 mb-2 mx-auto" />
          <p className="text-darkGray text-sm text-center">
            Well done today. You’ve earned a proper rest.
          </p>
          <div className="flex justify-center items-center gap-2 text-sm text-darkGray mt-4">
            <div className="flex flex-col items-center bg-lightGray px-4 py-2 rounded-lg">
              <span>
                {progress.tasksCompleted}/{progress.tasksTotal}
              </span>
              <span>task done</span>
            </div>
            <div className="flex flex-col items-center bg-lightGray px-4 py-2 rounded-lg">
              <span>{progress.focusTime}min</span>
              <span>focus time</span>
            </div>
            <div className="flex flex-col items-center bg-lightGray px-4 py-2 rounded-lg">
              <span>+{progress.pointEarned}</span>
              <span>Points Earned</span>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="py-8 px-6 rounded-2xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img src={facelogo} alt="Koala mascot" className="w-16 h-16 mb-4" />
            <span className="text-lg text-gray-500">Loading shutdown summary...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <img src={facelogo} alt="Koala mascot" className="w-14 h-8" />
              <span className="font-medium text-md ml-4">
                Clock Out – Step {step + 1} of {steps.length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md min-h-[240px] leading-[2.5]">
              <div className="font-bold text-lg mb-1">{steps[step].title}</div>
              <div className="text-gray-500 mb-3">{steps[step].subtitle}</div>
              {steps[step].content}
            </div>
            <div className="flex justify-between mt-6">
              {step > 0 ? (
                <Button variant="outline" className="text-blue1 cursor-pointer" onClick={prev}>
                  Previous
                </Button>
              ) : (
                <div />
              )}
              <Button className="bg-blue1 px-6 hover:bg-blue-800/60 cursor-pointer" onClick={next}>
                {step < steps.length - 1 ? 'Next' : 'Done'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
