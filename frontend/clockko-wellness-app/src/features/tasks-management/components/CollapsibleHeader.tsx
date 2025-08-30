import React from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

interface CollapsibleHeaderProps {
  title: string
  count: number
  open: boolean
  onToggle: () => void
}

const CollapsibleHeader: React.FC<CollapsibleHeaderProps> = ({ title, count, open, onToggle }) => {
  return (
    <button onClick={onToggle} className="flex items-center gap-2 mb-3.5 w-full text-left">
      <ChevronDown
        className={clsx('h-5 w-5 transition-transform duration-300', open && 'rotate-180')}
      />

      <h1 className="text-lg font-semibold font-poppins">
        {title} <span className="text-gray-500 text-sm">({count})</span>
      </h1>
    </button>
  )
}

export default CollapsibleHeader
