import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { useCreateTask } from '../hooks/useTasks'
import TagSelector from './TagSelector'
import FacesIcon from '@/components/Icons/FacesIcon'
import type { Tag } from '@/types'

//  Validation schema
const taskSchema = z.object({
  title: z.string().min(1, 'Task name is required'),
  startDate: z.date().optional(),
  dueAt: z.date().optional(),
  tags: z.array(z.any()).optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface AddTaskModalProps {
  showModal: boolean
  setShowModal: (show: boolean) => void
}

export default function AddTaskModal({ showModal = false, setShowModal }: AddTaskModalProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const { mutate: createTask, isPending } = useCreateTask()

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      startDate: undefined,
      dueAt: undefined,
      tags: [],
    },
  })

  const handleTagsChange = (newTags: Tag[]) => {
    setTags(newTags)
    form.setValue('tags', newTags, { shouldValidate: true })
  }

  const onSubmit = (data: TaskFormValues) => {
    const taskData = {
      ...data,
      tags,
      startDate: data.startDate?.toISOString(),
      dueAt: data.dueAt?.toISOString(),
    }
    
    console.log('✅ Task submitted:', taskData)
    createTask(taskData as any)
    
    handleClose()
  }

  const handleClose = () => {
    setShowModal(false)
    form.reset({
      title: '',
      startDate: undefined,
      dueAt: undefined,
      tags: [],
    })
    setTags([])
  }

  return (
    <Dialog open={showModal} onOpenChange={handleClose} aria-describedby="add-task-modal">
      <DialogContent aria-describedby="add-task-modal" className="sm:max-w-[600px] rounded-2xl p-6" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-start justify-between pb-6">
          <div className="flex items-center gap-3">
            <FacesIcon width={56} height={34} className="flex-shrink-0" />
            <DialogTitle className="text-xl font-semibold text-gray-900">Add New Task</DialogTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Task Name */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Task Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Design onboarding screens" 
                      className="mt-1 h-11 text-sm"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full h-11 justify-start text-left font-normal mt-1',
                              !field.value && 'text-gray-400'
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
                          autoFocus
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
                    <FormLabel className="text-sm font-medium text-gray-700">Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full h-11 justify-start text-left font-normal mt-1',
                              !field.value && 'text-gray-400'
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
                          autoFocus
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
                  <FormLabel className="text-sm font-medium text-gray-700">Tags</FormLabel>
                  <FormControl>
                    <div className="mt-2">
                      <TagSelector
                        selectedTags={tags}
                        onTagsChange={handleTagsChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-2 h-11 rounded-lg font-medium"
              >
                {isPending ? (
                  <>
                    <LoaderCircleIcon className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Task'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
