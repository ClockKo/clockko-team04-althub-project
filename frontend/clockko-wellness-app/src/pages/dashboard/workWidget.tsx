import { motion } from "framer-motion";
import React, { useState } from "react";
import { Button } from "../../components/ui/button"
import { BriefcaseBusiness } from "lucide-react";
type WorkSession = {
  start_time?: string;
  end_time?: string;
  // Add other fields as needed
};

export function WorkSessionCard({ session, onClockIn, onClockOut, onTestShutdown }: { session: WorkSession | null; onClockIn: () => void; onClockOut: () => void; onTestShutdown?: () => void }) {
  // Calculate duration if session is active
  const [duration, setDuration] = useState("");
  React.useEffect(() => {
    if (session?.start_time && !session?.end_time) {
      const interval = setInterval(() => {
        const start = new Date(session.start_time!);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const minutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        setDuration(`${hours > 0 ? `${hours}h ` : ""}${mins}m`);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setDuration("");
    }
  }, [session]);

  const isActiveSession = session?.start_time && !session?.end_time;

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow min-h-[180px] flex flex-col justify-between"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <div className="font-semibold text-lg mb-1">Work session</div>
        <div className="text-gray-600 text-sm">
          {isActiveSession ? "Currently working" : "Ready for work?"}
        </div>
      </div>
      <div className="flex flex-col items-center mt-4">
        {isActiveSession ? (
          <>
            <span className="text-4xl font-bold mb-2 text-blue-600">{duration}</span>
            <div className="flex gap-2">
              <Button className="bg-blue1 px-4 hover:bg-blue-800/80 cursor-pointer" onClick={onClockOut}>Clock Out</Button>
              {onTestShutdown && (
                <Button variant="outline" size="sm" onClick={onTestShutdown} title="Test shutdown modal UI">
                  Test Shutdown
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold mb-2 text-gray-400"><BriefcaseBusiness/></div>
            <div className="flex gap-2">
              <Button className="bg-blue1 px-6 hover:bg-blue-800/80 cursor-pointer" onClick={onClockIn}>Clock In</Button>
              {onTestShutdown && (
                <Button variant="outline" size="sm" onClick={onTestShutdown} title="Test shutdown modal UI">
                  Test Shutdown
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}