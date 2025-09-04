import { useRef, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { CalendarIcon, LoaderCircleIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { useCreateTask } from '../hooks/useTasks'
import { useClickOutside } from '@/hooks/useClickOutside'
import { HexColorPicker } from 'react-colorful'

// ✅ Validation schema
const taskSchema = z.object({
  title: z.string().min(3, 'Task name must be at least 3 characters'),
  startDate: z.date({
    error: 'Start date is required',
  }),
  dueAt: z.date({
    error: 'Due date is required',
  }),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface AddTaskModalProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
}

export default function AddTaskModal({ showModal = false, setShowModal }: AddTaskModalProps) {
  const [tags, setTags] = useState(['WORK', 'PERSONAL PROJECT'])
  const [newTag, setNewTag] = useState('')
  const [color, setColor] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const { mutate: createTask, isPending } = useCreateTask()
  const tagRef = useRef<HTMLDivElement>(null)
  useClickOutside(tagRef, () => setShowColorPicker(false))

  const handleTagClick = (tag: string) => {
    setColor(tag)
    setShowColorPicker(true)
  }

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      startDate: undefined,
      dueAt: undefined,
      tags: ['WORK'],
    },
  })

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      const updated = [...tags, newTag]
      setTags(updated)
      form.setValue('tags', updated, { shouldValidate: true })
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((tag) => tag !== tagToRemove)
    setTags(updated)
    form.setValue('tags', updated, { shouldValidate: true })
  }

  const onSubmit = (data: TaskFormValues) => {
    console.log('✅ Task submitted:', data)
    createTask(data)
    setShowModal(false)
    form.reset()
    setTags(['WORK', 'PERSONAL PROJECT'])
  }

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Task Name */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Design onboarding screens" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'MM/dd/yy') : 'MM/DD/YY'}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'MM/dd/yy') : 'MM/DD/YY'}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={() => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <Popover
                          key={i}
                          open={showColorPicker && color === tag}
                          onOpenChange={setShowColorPicker}
                        >
                          <PopoverTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="relative flex items-center gap-1 rounded-full px-3 py-1 cursor-pointer"
                              onClick={() => {
                                setColor(tag)
                                setShowColorPicker(true)
                              }}
                            >
                              <span
                                className="h-3 w-3 rounded-full border"
                                style={{ backgroundColor: color === tag ? color : '#ccc' }}
                              />
                              {tag}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveTag(tag)
                                }}
                              />
                            </Badge>
                          </PopoverTrigger>

                          <PopoverContent className="p-2 w-auto">
                            <HexColorPicker
                              color={color}
                              onChange={(newColor) => setColor(newColor)}
                              className="!w-40 !h-40"
                            />
                          </PopoverContent>
                        </Popover>
                      ))}

                      {/* Input for new tags */}
                      <Input
                        placeholder="Create tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="w-32"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <div className="flex justify-end pt-4">
                <Button type="submit" className="rounded-xl px-6" disabled={isPending}>
                  {isPending ? <LoaderCircleIcon /> : 'Add Task'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
