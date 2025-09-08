import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import TagSelector from './TagSelector'
import type { Task, Tag } from '@/types'

const editTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
})

type EditTaskValues = z.infer<typeof editTaskSchema>

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task
  onSave: (updatedTask: Partial<Task>) => void
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task, onSave }) => {
  const [selectedTags, setSelectedTags] = useState<Tag[]>(task.tags || [])

  const form = useForm<EditTaskValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
    },
  })

  // Reset form and tags when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description,
      })
      setSelectedTags(task.tags || [])
    }
  }, [task, form])

  const handleSubmit = (values: EditTaskValues) => {
    const updatedTask: Partial<Task> = {
      ...values,
      tags: selectedTags,
    }
    onSave(updatedTask)
    onClose()
  }

  const handleClose = () => {
    form.reset()
    setSelectedTags(task.tags || [])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl p-6">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Edit Task
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Task Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter task name" 
                      className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description" 
                      className="min-h-[80px] rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div className="space-y-2">
              <FormLabel className="text-sm font-medium text-gray-700">
                Tags
              </FormLabel>
              <TagSelector
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>

            <DialogFooter className="flex gap-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="px-6 py-2 h-11 rounded-lg border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-2 h-11 rounded-lg font-medium"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditTaskModal
