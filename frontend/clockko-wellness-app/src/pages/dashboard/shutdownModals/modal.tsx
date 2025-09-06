import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { useState } from "react";

// Demo data for progress bar and tasks
const demoProgress = {
  tasksCompleted: 2,
  tasksTotal: 4,
  focusTime: 90, // mins
  focusGoal: 120, // mins
  pendingTasks: 0,
  shutdownStreak: 0,
  pointEarned: 50,
  todayTasks: [
    { name: "Design wireframes for dashboard", completed: true },
    { name: "Attend leadership meeting", completed: true },
    { name: "Design wireframes for dashboard", completed: false },
    { name: "Write API docs", completed: false },
  ],
};


// ------------------ Guided Shutdown Modal ------------------

const SHUTDOWN_STEPS = [
  {
    title: "Review Today's Tasks",
    subtitle: `You completed ${demoProgress.tasksCompleted} of ${demoProgress.tasksTotal} tasks`,
    content: (
      <>
        <div className="mb-2">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-700 rounded-full"
              style={{ width: `${(demoProgress.tasksCompleted / demoProgress.tasksTotal) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {demoProgress.todayTasks.map((task, i) => (
            <div key={i} className={cn("rounded-lg px-3 py-2 bg-gray-100 text-sm", task.completed && "line-through text-gray-400")}>
              {task.name}
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    title: "Disconnect Mindfully",
    subtitle: "Take a moment to properly close your work day",
    content: (
      <div className="flex flex-col gap-2">
        <div className="rounded-lg px-3 py-2 bg-gray-100 text-sm">Set your slack status to Away</div>
        <div className="rounded-lg px-3 py-2 bg-gray-100 text-sm">Pause work notifications till tomorrow</div>
        <div className="rounded-lg px-3 py-2 bg-gray-100 text-sm">Give any necessary updates (if any) to stakeholders</div>
      </div>
    ),
  },
  {
    title: "Day Complete!",
    subtitle: "Well done for today. See you tomorrow!",
    content: (
      <div className="flex flex-col gap-2 items-center">
        <img src="/koala.svg" alt="Koala mascot" className="w-24 h-24 mb-2" />
        <span className="text-lg font-semibold text-center">You’ve shut down intentionally.</span>
      </div>
    ),
  },
  {
    title: "Reflect on your day",
    subtitle: "How was your productivity today?",
    content: (
      <div className="">
        <div className="flex flex-col gap-2 items-center">
        <span className="text-lg font-semibold text-center">Great</span>
        <span className="text-lg font-semibold text-center">Good</span>
        <span className="text-lg font-semibold text-center">Okay</span>
        <span className="text-lg font-semibold text-center">Tough</span>
        </div>

        <div className="mt-4 text-sm text-gray-500">Add a note?</div>
        <textarea name="add-note" id="note" placeholder="Any wins, challenges, or thoughts to remember? "></textarea>
      </div>
    ),
  },
  {
    image: "/koala.svg",
    title: "You’ve clocked out!",
    subtitle: "Well done today. You’ve earned a proper rest.",
    content: (
      <div className="">
        <img src="/koala.svg" alt="Koala mascot" className="w-24 h-24 mb-2 mx-auto" />
        <div className="flex justify-center items-center gap-2">
        <div>
            <span>{demoProgress.tasksCompleted}/{demoProgress.tasksTotal}</span>
            <span>task done</span>
        </div>
        
         <div>
            <span>{demoProgress.focusTime}min</span>
            <span>focus time</span>
        </div>

         <div>
            <span>+{demoProgress.pointEarned}</span>
            <span>Points Earned</span>
        </div>
        </div>
      </div>
    ),
  }

];


export function ShutdownModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);

  function next() {
    if (step < SHUTDOWN_STEPS.length - 1) setStep((s) => s + 1);
    else onClose();
  }
  function prev() {
    if (step > 0) setStep((s) => s - 1);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg py-8 px-6 rounded-2xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <img src="/koala.svg" alt="Koala mascot" className="w-8 h-8" />
          <span className="font-semibold text-md">Clock Out – Step {step + 1} of 3</span>
        </div>
        <div className="font-bold text-lg mb-1">{SHUTDOWN_STEPS[step].title}</div>
        <div className="text-gray-500 mb-3">{SHUTDOWN_STEPS[step].subtitle}</div>
        {SHUTDOWN_STEPS[step].content}
        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <Button variant="outline" onClick={prev}>Previous</Button>
          ) : <div />}
          <Button onClick={next}>{step < SHUTDOWN_STEPS.length - 1 ? "Next" : "Done"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}