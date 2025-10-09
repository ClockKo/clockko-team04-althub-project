import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { cn } from '../../../lib/utils'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchShutdownSummary, submitShutdownReflection, calculateShutdownPoints, type ProductivityRating, type ShutdownReflection } from '@/features/shutdowns/api'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import { FiCheck } from 'react-icons/fi'
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

// Demo data as fallback
const demoProgress: ProgressData = {
  tasksCompleted: 0,
  tasksTotal: 0,
  focusTime: 0,
  focusGoal: 0,
  pendingTasks: 0,
  shutdownStreak: 0,
  pointEarned: 0,
  clockedOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  todayTasks: [],
}

// Mock function to simulate API call - replace with real API call as needed
export function ShutdownModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  // function to go to next step or close modal
  function next() {
    if (step < steps.length - 1) {
      setStep((s) => s + 1)
    } else {
      // On final step, submit reflection data
      if (selectedRating) {
        const reflectionData: ShutdownReflection = {
          productivity_rating: selectedRating,
          reflection_note: reflectionNote || undefined,
          mindful_disconnect_completed: mindfulItems,
        }
        submitReflectionMutation.mutate(reflectionData)
      }
      onClose()
    }
  }
  function prev() {
    if (step > 0) setStep((s) => s - 1)
  }

  // state to track current step and progress data
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState<ProgressData>(demoProgress)
  
  // Reflection state management
  const [selectedRating, setSelectedRating] = useState<ProductivityRating | null>(null)
  const [reflectionNote, setReflectionNote] = useState('')
  const [mindfulItems, setMindfulItems] = useState<boolean[]>([false, false, false, false])

  //query for fetching shutdown data
  const { data, isLoading } = useQuery({
    queryKey: ['shutdown-summary'],
    queryFn: fetchShutdownSummary,
    enabled: open, // Only fetch when modal is open
  })

  // Mutation for submitting reflection data
  const submitReflectionMutation = useMutation({
    mutationFn: submitShutdownReflection,
    onSuccess: () => {
      toast.success('Reflection saved successfully!')
    },
    onError: (error) => {
      console.error('Failed to submit reflection:', error)
      toast.error('Failed to save reflection. Please try again.')
    }
  })

  useEffect(() => {
    if (data) {
      // Convert API response to internal format
      const progressData: ProgressData = {
        ...data,
        pointEarned: calculateShutdownPoints(data), // Calculate points dynamically
        clockedOutTime: data.clockedOutTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setProgress(progressData)
    } else {
      setProgress(demoProgress) // fallback to mock data
    }
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
          {[
            'Set your slack status to Away',
            'Pause work notifications till tomorrow', 
            'Give any necessary updates (if any) to stakeholders',
            'Take a deep breath and close your laptop'
          ].map((item, index) => (
            <div 
              key={index}
              className={cn(
                "rounded-lg px-3 py-4 text-sm text-darkGray flex items-center gap-3 cursor-pointer transition-all",
                mindfulItems[index] ? "bg-green-100 border border-green-300" : "bg-gray-100 hover:bg-gray-200"
              )}
              onClick={() => {
                const newItems = [...mindfulItems]
                newItems[index] = !newItems[index]
                setMindfulItems(newItems)
              }}
            >
              <div className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                mindfulItems[index] 
                  ? "bg-green-500 border-green-500 text-white" 
                  : "border-gray-300 bg-white"
              )}>
                {mindfulItems[index] && <FiCheck className="w-3 h-3" />}
              </div>
              <span className={mindfulItems[index] ? "line-through opacity-75" : ""}>
                {item}
              </span>
            </div>
          ))}
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
              <button
                onClick={() => setSelectedRating('great')}
                className={cn(
                  "text-sm font-regular text-darkGray text-center px-4 py-2 rounded-lg transition-all",
                  selectedRating === 'great' 
                    ? "bg-successGreen ring-2 ring-green-400 shadow-md" 
                    : "bg-successGreen hover:bg-green-200"
                )}
              >
                Great
              </button>
              <button
                onClick={() => setSelectedRating('good')}
                className={cn(
                  "text-sm font-regular text-darkGray text-center px-4 py-2 rounded-lg transition-all",
                  selectedRating === 'good' 
                    ? "bg-lightGreen ring-2 ring-green-300 shadow-md" 
                    : "bg-lightGreen hover:bg-green-100"
                )}
              >
                Good
              </button>
            </div>
            <div className="group2 flex gap-2">
              <button
                onClick={() => setSelectedRating('okay')}
                className={cn(
                  "text-sm font-regular text-darkGray text-center px-4 py-2 rounded-lg transition-all",
                  selectedRating === 'okay' 
                    ? "bg-warningYellow ring-2 ring-yellow-400 shadow-md" 
                    : "bg-warningYellow hover:bg-yellow-200"
                )}
              >
                Okay
              </button>
              <button
                onClick={() => setSelectedRating('tough')}
                className={cn(
                  "text-sm font-regular text-darkGray text-center px-4 py-2 rounded-lg transition-all",
                  selectedRating === 'tough' 
                    ? "bg-errorRed ring-2 ring-red-400 shadow-md" 
                    : "bg-errorRed hover:bg-red-200"
                )}
              >
                Tough
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">Add a note?</div>
          <Textarea
            className="border-2 border-lightGray w-full rounded-lg py-4 bg-gray-50 text-sm mt-2 px-4 focus:border-primary focus:ring-1 focus:ring-primary"
            name="add-note"
            id="note"
            placeholder="Any wins, challenges, or thoughts to remember?"
            value={reflectionNote}
            onChange={(e) => setReflectionNote(e.target.value)}
            rows={4}
          />
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
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Loading Shutdown Summary</DialogTitle>
              <DialogDescription>Please wait while we prepare your work session summary</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-12">
              <img src={facelogo} alt="Koala mascot" className="w-16 h-16 mb-4" />
              <span className="text-lg text-gray-500">Loading shutdown summary...</span>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <img src={facelogo} alt="Koala mascot" className="w-14 h-8" />
                <div className="flex flex-col ml-4">
                  <DialogTitle className="font-medium text-md">
                    Clock Out – Step {step + 1} of {steps.length}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 mt-1">
                    Review your work session and reflect on your productivity
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
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
