import { useState, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { X, Palette } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useTasks } from '../hooks/useTasks'
import type { Tag } from '@/types'

interface TagSelectorProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  className?: string
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6B7280', // Gray
  '#F97316', // Orange
  '#84CC16', // Lime
  '#06B6D4', // Cyan
  '#8B5A2B', // Brown
]

export default function TagSelector({ selectedTags, onTagsChange, className }: TagSelectorProps) {
  const { tasks, isLoading } = useTasks()
  
  const [newTagName, setNewTagName] = useState('')
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  
  const colorPickerRef = useRef<HTMLDivElement>(null)
  
  useClickOutside(colorPickerRef, () => {
    setEditingTagId(null)
  })

  const existingTags: Tag[] = []
  const tagMap = new Map<string, Tag>()
  
  tasks?.forEach(task => {
    task.tags?.forEach(tag => {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, tag)
        existingTags.push(tag)
      }
    })
  })

  const handleTagToggle = (tag: Tag) => {
    const isSelected = selectedTags.some(selected => selected.id === tag.id)
    
    if (isSelected) {
      onTagsChange(selectedTags.filter(selected => selected.id !== tag.id))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const handleCreateTag = () => {
    if (!newTagName.trim()) return

    const defaultColor = DEFAULT_COLORS[(existingTags.length + selectedTags.length) % DEFAULT_COLORS.length]

    const tempTag: Tag = {
      id: `temp-${Date.now()}`, 
      name: newTagName.trim(),
      color: defaultColor
    }
    
    onTagsChange([...selectedTags, tempTag])
    setNewTagName('')
      
  }


  const updateTagColor = (tagId: string, newColor: string) => {
    const updatedTags = selectedTags.map(tag => 
      tag.id === tagId ? { ...tag, color: newColor } : tag
    )
    onTagsChange(updatedTags)
    setEditingTagId(null)
  }

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading tags...</div>
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Selected Tags</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <div key={tag.id} className="relative group">
                  <Badge
                    variant="secondary"
                    className="flex items-center px-3 py-1 rounded-full pr-8"
                    style={{ 
                      backgroundColor: `${tag.color}20`, 
                      borderColor: tag.color,
                      color: tag.color
                    }}
                  >
                    {tag.name}
                  </Badge>
                  
                  <Popover open={editingTagId === tag.id} onOpenChange={(open) => setEditingTagId(open ? tag.id : null)}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingTagId(tag.id)
                        }}
                      >
                        <Palette className="h-3 w-3" style={{ color: tag.color }} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3" ref={colorPickerRef}>
                      <div className="space-y-3">
                        <div className="grid grid-cols-6 gap-2">
                          {DEFAULT_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                              style={{ 
                                backgroundColor: color,
                                borderColor: tag.color === color ? '#000' : 'transparent'
                              }}
                              onClick={() => updateTagColor(tag.id, color)}
                            />
                          ))}
                        </div>
                        
                        <div className="border-t pt-3">
                          <HexColorPicker
                            color={tag.color}
                            onChange={(color) => updateTagColor(tag.id, color)}
                            className="!w-48 !h-32"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <X
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 cursor-pointer hover:text-red-600 transition-colors"
                    onClick={() => handleTagToggle(tag)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Available Tags</h4>
          <div className="flex flex-wrap gap-2">
            {existingTags
              .filter(tag => !selectedTags.some(selected => selected.id === tag.id))
              .map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleTagToggle(tag)}
                >
                  <span
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </Badge>
              ))}

            <Input
              placeholder="CREATE TAG"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="h-7 w-24 px-2 text-xs rounded-full border-dashed text-gray-500 placeholder:text-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTagName.trim()) {
                  e.preventDefault()
                  handleCreateTag()
                } else if (e.key === 'Escape') {
                  setNewTagName('')
                }
              }}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
