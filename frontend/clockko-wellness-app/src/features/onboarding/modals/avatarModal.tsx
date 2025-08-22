import { useRef } from 'react'
import { motion } from 'framer-motion'
import Group6 from '../../../assets/images/Group6.png'
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar'
import { Button } from '../../../components/ui/button'
import Ellipse11 from '../../../assets/images/Ellipse11.png'

// Avatar Images
import Ellipse6 from '../../../assets/images/Ellipse6.png'
import Ellipse7 from '../../../assets/images/Ellipse7.png'
import Ellipse8 from '../../../assets/images/Ellipse8.png'
import Ellipse9 from '../../../assets/images/Ellipse9.png'
import Ellipse10 from '../../../assets/images/Ellipse10.png'

const avatars = [
  { src: Ellipse6, alt: 'Avatar 1' },
  { src: Ellipse7, alt: 'Avatar 2' },
  { src: Ellipse8, alt: 'Avatar 3' },
  { src: Ellipse9, alt: 'Avatar 4' },
  { src: Ellipse10, alt: 'Avatar 5' },
]

type AvatarModalProps = {
  avatar: string | null
  setAvatar: (v: string | null) => void
  onNext: () => void
  onPrev: () => void
  step?: number
  totalSteps?: number
}

export function AvatarModal({
  avatar,
  setAvatar,
  onNext,
  onPrev,
  step = 4,
  totalSteps = 5,
}: AvatarModalProps) {
  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Avatar selection
  const handleAvatarClick = (src: string) => setAvatar(src)

  // Avatar upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatar(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white rounded-2xl p-4 xs:p-6 w-full max-w-xs xs:max-w-md md:max-w-[800px] md:h-[500px] mx-auto text-center shadow-lg relative">
        {/* Progress bar & step */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">
            Step {step} of {totalSteps}
          </div>
          <div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-4">
              <div
                className="bg-blue1 h-1 rounded-full transition-all"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        <img src={Group6} alt="Koala bear face" className="mx-auto mb-2 mt-8" />
        <h2 className="text-lg xs:text-xl font-bold mb-1 mt-4">Choose an Avatar</h2>
        <p className="text-gray-500 mb-4 text-sm font-thin">Which of the following matches your vibe?</p>
        {/* Avatar grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 mx-auto md:ml-[7.5rem] md:mr-[2.5rem] justify-evenly items-center md:mt-8">
          {avatars.map((a, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAvatarClick(a.src)}
              className={`rounded-full border-blue1 border-2 w-16 h-16 xs:w-20 xs:h-20 flex items-center justify-center bg-gray-100 shadow-sm overflow-hidden focus:outline-none ${avatar === a.src ? 'border-blue-600' : 'border-transparent'}`}
              aria-label={a.alt}
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={a.src} alt={a.alt} />
                <AvatarFallback>{a.alt[0]}</AvatarFallback>
              </Avatar>
            </button>
          ))}
          {/* Upload Photo Option */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-full border-2 w-16 h-16 xs:w-20 xs:h-20 flex flex-col items-center justify-center bg-gray-200 shadow-sm overflow-hidden focus:outline-none ${avatar && !avatars.some((a) => a.src === avatar) ? 'border-blue-600' : 'border-transparent'}`}
            aria-label="Upload your photo"
          >
            {avatar && !avatars.some((a) => a.src === avatar) ? (
              <Avatar className="w-full h-full">
                <AvatarImage src={avatar} alt="Uploaded Avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            ) : (
              <>
                <img src={Ellipse11} alt="Upload your photo" />
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </button>
        </div>
        {/* Navigation buttons */}
        <div className="flex justify-between gap-2 md:mt-[6rem]">
          <Button
            variant="ghost"
            className="w-1/2 md:w-[20%] font-thin cursor-pointer text-blue1"
            onClick={onPrev}
          >
            Previous
          </Button>
          <Button
            className="w-1/2 md:w-[20%] bg-blue1 text-white xs:px-6 xs:py-2 text-base rounded-lg hover:bg-blue-900/80 cursor-pointer font-thin"
            onClick={onNext}
            disabled={!avatar}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
