import { Button } from '../../../components/ui/button'
import { motion } from 'framer-motion'
import Group6 from '../../../assets/images/Group6.png'

type ClockOutModalProps = {
  clockOut: { hour: string; minute: string }
  setClockOut: (t: { hour: string; minute: string }) => void
  ampm: 'AM' | 'PM'
  setAmpm: (t: 'AM' | 'PM') => void
  onNext: () => void
  onPrev: () => void
  step?: number
  totalSteps?: number
}

export function ClockOutModal({
  clockOut,
  setClockOut,
  ampm,
  setAmpm,
  onNext,
  onPrev,
  step = 2,
  totalSteps = 5,
}: ClockOutModalProps) {
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Allow empty input and single digit
    if (value === '') {
      setClockOut({ ...clockOut, hour: '' });
      return;
    }

    // Remove non-digits
    value = value.replace(/\D/g, '');

    // Handle single digit
    if (value.length === 1) {
      const digit = parseInt(value);
      if (digit >= 0) {
        setClockOut({ ...clockOut, hour: value });
        return;
      }
    }

    // Handle two digits
    if (value.length >= 2) {
      const num = parseInt(value.slice(0, 2));
      if (num >= 1 && num <= 12) {
        setClockOut({ ...clockOut, hour: num.toString().padStart(2, '0') });
      } else if (num === 0) {
        setClockOut({ ...clockOut, hour: '12' });
      } else {
        // If number is > 12, take the last digit only
        setClockOut({ ...clockOut, hour: value.slice(-1) });
      }
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Allow empty input
    if (value === '') {
      setClockOut({ ...clockOut, minute: '' });
      return;
    }

    // Remove non-digits
    value = value.replace(/\D/g, '');

    // Handle single digit
    if (value.length === 1) {
      const digit = parseInt(value);
      if (digit >= 0) {
        setClockOut({ ...clockOut, minute: value });
        return;
      }
    }

    // Handle two digits
    if (value.length >= 2) {
      const num = parseInt(value.slice(0, 2));
      if (num >= 0 && num <= 59) {
        setClockOut({ ...clockOut, minute: num.toString().padStart(2, '0') });
      } else {
        // If number is > 59, take the first valid number from the last two digits
        const lastTwo = value.slice(-2);
        const lastTwoNum = parseInt(lastTwo);
        if (lastTwoNum <= 59) {
          setClockOut({ ...clockOut, minute: lastTwo });
        } else {
          setClockOut({ ...clockOut, minute: '59' });
        }
      }
    }
  };

  // Modal content
  return (
    <motion.div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white rounded-2xl p-4 xs:p-6 w-full max-w-xs xs:max-w-md md:max-w-[800px] mx-auto text-center shadow-lg relative">
        {/* Progress and Step indicator */}
        <div className="mb-4">
          <div className="text-xs text-darkGray mb-1">
            Step {step} of {totalSteps}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-4">
            <div
              className="bg-blue1 h-1 rounded-full transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <img src={Group6} alt="koala bear face" className="mx-auto mb-2 mt-8" />
        <h2 className="text-dark text-lg xs:text-xl font-bold mb-1 mt-8">
          Set your Clock-out Time
        </h2>
        <p className="text-lightDark mb-4 text-sm mt-2">
          When do you want to be reminded to finish work
        </p>

        {/* Time input section*/}
        <div className="flex flex-col items-center mb-6">
          <div className="flex justify-center items-center gap-2 bg-gray-100 rounded-xl px-4 py-8 mb-2 text-3xl">
            {/* hour input */}
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={clockOut.hour}
              onChange={handleHourChange}
              placeholder="HH"
              aria-label="Hour"
              className="w-15 xs:w-12 text-center text-3xl xs:text-4xl font-bold bg-transparent outline-none border-none"
            />
            <span className="text-3xl xs:text-4xl font-bold">:</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={clockOut.minute}
              onChange={handleMinuteChange}
              placeholder="MM"
              aria-label="Minute"
              className="w-15 xs:w-12 text-center text-3xl xs:text-4xl font-bold bg-transparent outline-none border-none"
            />
          </div>

          {/* AM/PM toggle */}
          <div className="flex mt-2 ">
            <Button
              variant={ampm === 'AM' ? 'default' : 'outline'}
              onClick={() => setAmpm('AM')}
              className={`relative right-8 z-10 rounded-full px-8 py-1 md:px-10 transition-colors duration-200 ease-in-out font-thin cursor-pointer hover:bg-blue1 ${ampm === 'AM' ? 'bg-lilac text-dark font-bold shadow' : ''}`}
              type="button"
            >
              AM
            </Button>
            <Button
              variant={ampm === 'PM' ? 'default' : 'outline'}
              onClick={() => setAmpm('PM')}
              className={`absolute right-[5.5rem] md:right-[19.5rem] rounded-full px-8 py-1 md:px-10 transition-colors duration-200 ease-in-out font-thin cursor-pointer hover:bg-blue1 ${ampm === 'PM' ? 'bg-lilac text-dark font-bold shadow' : ''}`}
              type="button"
            >
              PM
            </Button>
          </div>
        </div>

        {/* Navigation Button */}
        <div className="flex justify-between gap-2 flex-col-reverse lg:flex-row">
          <Button
            variant="ghost"
            onClick={onPrev}
            className="w-full md:w-[20%] text-dark hover:text-blue1 hover:border-blue1 transition-all duration-200 scale-100 ease-in-out font-thin cursor-pointer"
          >
            Previous
          </Button>
          <Button
            variant="ghost"
            onClick={onNext}
            disabled={!(clockOut.hour && clockOut.minute.length === 2)}
            className="w-full md:w-[20%] bg-blue1 text-white xs:px-6 xs:py-2 text-base rounded-lg hover:bg-blue-900/80 transition duration-200 scale-100 ease-in-out shadow-md cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
