/**
 * @fileoverview User Creation Page - Multi-step Form
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check,
  User,
  Shield,
  Mail,
  Phone,
  Lock
} from 'lucide-react'
import { useCreateUser } from '@/features/admin/user-management/hooks'
import { createUserSchema } from '@/features/admin/user-management/schemas'
import type { CreateUserInput } from '@/features/admin/user-management/types'
import { 
  USER_ROLE_OPTIONS, 
  USER_TYPE_OPTIONS,
  requiresSppgAssignment 
} from '@/features/admin/user-management/types'
import { UserRole } from '@prisma/client'

// Multi-step form steps
const STEPS = [
  { id: 1, title: 'Basic Information', icon: User },
  { id: 2, title: 'Role & Access', icon: Shield },
  { id: 3, title: 'Review & Create', icon: Check },
]

/**
 * User Creation Page
 * Multi-step wizard for creating new users
 */
export default function CreateUserPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const { mutate: createUser, isPending } = useCreateUser()

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      userRole: UserRole.SPPG_VIEWER,
      userType: 'SPPG_USER',
      isActive: true,
      emailVerified: false,
      phone: undefined,
      sppgId: undefined,
      timezone: undefined,
      avatar: undefined,
    },
  })

  const handleNext = async () => {
    let fieldsToValidate: (keyof CreateUserInput)[] = []

    // Validate fields based on current step
    if (currentStep === 1) {
      fieldsToValidate = ['email', 'name', 'password', 'phone']
    } else if (currentStep === 2) {
      fieldsToValidate = ['userRole', 'userType', 'sppgId']
    }

    const isValid = await form.trigger(fieldsToValidate)

    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    const values = form.getValues()
    createUser(values, {
      onSuccess: () => {
        router.push('/admin/users')
      },
    })
  }

  const watchedRole = form.watch('userRole')
  const needsSppg = requiresSppgAssignment(watchedRole)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
          <p className="text-muted-foreground mt-1">
            Add a new user to the platform with role-based access control
          </p>
        </div>
        
        <Button 
          variant="outline" 
          asChild
        >
          <Link href="/admin/users">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex items-center justify-center h-10 w-10 rounded-full
                    ${isActive ? 'bg-primary text-primary-foreground' : ''}
                    ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                    ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Step {step.id}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <Separator className="flex-1 mx-4" />
              )}
            </div>
          )
        })}
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Enter the basic information for the new user'}
                {currentStep === 2 && 'Assign role and access permissions'}
                {currentStep === 3 && 'Review all information before creating the user'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="user@example.com" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          This will be used for login and notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="John Doe" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Minimum 8 characters with uppercase, lowercase, and numbers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="+62 812 3456 7890" 
                              className="pl-10"
                              {...field}
                              value={field.value || ''}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Optional: Indonesian phone number format
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Role & Access */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select user type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {USER_TYPE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Determines the level of platform access
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(() => {
                              const categories = ['platform', 'sppg-management', 'sppg-operational', 'sppg-staff', 'limited'] as const
                              return categories.map((cat) => {
                                const rolesInCategory = USER_ROLE_OPTIONS.filter(r => r.category === cat)
                                if (rolesInCategory.length === 0) return null
                                
                                return (
                                  <div key={cat}>
                                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground capitalize">
                                      {cat.replace('-', ' ')}
                                    </div>
                                    {rolesInCategory.map((role) => (
                                      <SelectItem key={role.value} value={role.value}>
                                        {role.label}
                                      </SelectItem>
                                    ))}
                                  </div>
                                )
                              })
                            })()}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Defines specific permissions and capabilities
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {needsSppg && (
                    <FormField
                      control={form.control}
                      name="sppgId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SPPG Assignment</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select SPPG" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* TODO: Fetch from API */}
                              <SelectItem value="sppg-1">SPPG Jakarta Pusat</SelectItem>
                              <SelectItem value="sppg-2">SPPG Jakarta Selatan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            This role requires SPPG assignment
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Review Information</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please review all information before creating the user
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Badge variant="outline" className="mb-2">Basic Information</Badge>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-medium">{form.getValues('email')}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{form.getValues('name')}</p>
                        </div>
                        {form.getValues('phone') && (
                          <div>
                            <span className="text-muted-foreground">Phone:</span>
                            <p className="font-medium">{form.getValues('phone')}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Badge variant="outline" className="mb-2">Role & Access</Badge>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">User Type:</span>
                          <p className="font-medium">
                            {USER_TYPE_OPTIONS.find(t => t.value === form.getValues('userType'))?.label}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">User Role:</span>
                          <p className="font-medium">
                            {USER_ROLE_OPTIONS.find(r => r.value === form.getValues('userRole'))?.label}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isPending}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                asChild
              >
                <Link href="/admin/users">Cancel</Link>
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={isPending}
              >
                {currentStep < 3 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  isPending ? 'Creating...' : 'Create User'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
