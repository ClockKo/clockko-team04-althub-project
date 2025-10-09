import { useState } from 'react'
import { Button } from '@/components/ui/button'

export interface Tab {
  name: string
  component: React.ReactNode
  icon?: React.ReactNode
}

export default function TabsUnderline({
  tabs,
  defaultTab = 0,
}: {
  tabs: Tab[]
  defaultTab?: number
}) {
  const [activeIndex, setActiveIndex] = useState(defaultTab)

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 border-b-2 border-gray-200">
        {tabs.map((tab, idx) => (
          <Button
            variant="ghost"
            key={tab.name}
            onClick={() => setActiveIndex(idx)}
            className={`relative pb-2 font-poppins text-blue1 transition-colors ${
              activeIndex === idx
                ? 'text-blue1 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon && <span className="mr-2 text-blue1">{tab.icon}</span>}
            {tab.name}

            {activeIndex === idx && (
              <span className="absolute bottom-[-2px] left-0 right-0 border-b-2 border-blue1"></span>
            )}
          </Button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="mt-4">{tabs[activeIndex]?.component}</div>
    </div>
  )
}
