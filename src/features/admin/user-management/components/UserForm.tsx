/**
 * @fileoverview User Form Component
 * @version Next.js 15.5.4 / React Hook Form / Zod
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Comprehensive user creation and editing form with:
 * - React Hook Form + Zod validation
 * - Create and edit modes
 * - Conditional SPPG selector
 * - Password strength indicator
 * - Avatar upload support
 * - Role-based field visibility
 */

'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Save, Shield, User, Mail, Phone, MapPin, Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { createUserSchema, updateUserSchema } from '../schemas'
import { USER_ROLE_OPTIONS, USER_TYPE_OPTIONS, TIMEZONE_OPTIONS } from '../types'
import { userApi } from '../api'
import type { UserDetail, CreateUserInput, UpdateUserInput } from '../types'

interface UserFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<UserDetail> & Pick<UserDetail, 'id' | 'email' | 'name' | 'userRole' | 'userType' | 'isActive'>
  onSuccess?: () => void
  onCancel?: () => void
}

export function UserForm({ mode, initialData, onSuccess, onCancel }: UserFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Determine schema based on mode
  const schema = mode === 'create' ? createUserSchema : updateUserSchema

  // Initialize form
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: mode === 'edit' && initialData ? {
      email: initialData.email,
      name: initialData.name || '',
      userRole: initialData.userRole,
      userType: initialData.userType,
      sppgId: initialData.sppgId || undefined,
      phone: initialData.phone || undefined,
      timezone: (initialData.timezone as 'WIB' | 'WITA' | 'WIT') || 'WIB',
      isActive: initialData.isActive,
      avatar: initialData.avatar || undefined,
    } : {
      email: '',
      name: '',
      password: '',
      userRole: 'SPPG_VIEWER' as const,
      userType: 'SPPG_USER' as const,
      sppgId: undefined,
      phone: undefined,
      timezone: 'WIB' as const,
      isActive: true,
      emailVerified: false,
      avatar: undefined,
    }
  })

  // Watch userRole to show/hide SPPG selector
  const watchedRole = form.watch('userRole')
  const watchedPassword = form.watch('password')
  const isSppgRole = watchedRole?.startsWith('SPPG_')

  // Calculate password strength
  useEffect(() => {
    if (mode === 'create' && watchedPassword) {
      let strength = 0
      if (watchedPassword.length >= 8) strength += 25
      if (/[a-z]/.test(watchedPassword)) strength += 25
      if (/[A-Z]/.test(watchedPassword)) strength += 25
      if (/[0-9]/.test(watchedPassword)) strength += 25
      setPasswordStrength(strength)
    }
  }, [watchedPassword, mode])

  // Auto-adjust userType when role changes
  useEffect(() => {
    const role = watchedRole
    if (!role) return

    if (role.startsWith('PLATFORM_')) {
      form.setValue('userType', 'SUPERADMIN')
      form.setValue('sppgId', null)
    } else if (role === 'SPPG_ADMIN' || role === 'SPPG_KEPALA') {
      form.setValue('userType', 'SPPG_ADMIN')
    } else if (role.startsWith('SPPG_')) {
      form.setValue('userType', 'SPPG_USER')
    }
  }, [watchedRole, form])

  // Form submit handler
  const onSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    try {
      setIsSubmitting(true)
      console.log('📝 [UserForm] Submitting form:', { mode, data })

      if (mode === 'create') {
        const result = await userApi.create(data as CreateUserInput)
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to create user')
        }

        toast.success('User created successfully')
        console.log('✅ [UserForm] User created:', result.data.id)

        // Redirect to user detail page
        router.push(`/admin/users/${result.data.id}`)
      } else {
        if (!initialData?.id) {
          throw new Error('User ID is required for update')
        }

        const result = await userApi.update(initialData.id, data as UpdateUserInput)
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to update user')
        }

        toast.success('User updated successfully')
        console.log('✅ [UserForm] User updated:', result.data.id)

        // Call success callback or refresh
        if (onSuccess) {
          onSuccess()
        } else {
          router.refresh()
        }
      }
    } catch (error) {
      console.error('❌ [UserForm] Submit error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save user')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500'
    if (passwordStrength <= 50) return 'bg-orange-500'
    if (passwordStrength <= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Get password strength label
  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 25) return 'Weak'
    if (passwordStrength <= 50) return 'Fair'
    if (passwordStrength <= 75) return 'Good'
    return 'Strong'
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>
              {mode === 'create' 
                ? 'Create a new user account with basic information' 
                : 'Update user basic information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
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
                        {...field}
                        type="email"
                        placeholder="user@example.com"
                        className="pl-10"
                        disabled={mode === 'edit'} // Email cannot be changed
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    {mode === 'create' 
                      ? 'Used for login and notifications. Must be unique.' 
                      : 'Email cannot be changed after creation.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
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
                        {...field}
                        placeholder="John Doe"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    User&apos;s full name as it appears in the system.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password (Create mode only) */}
            {mode === 'create' && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="relative">
                          <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {/* Password strength indicator */}
                        {watchedPassword && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Password strength:</span>
                              <span className="font-medium">{getPasswordStrengthLabel()}</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                style={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Must contain at least 8 characters, including uppercase, lowercase, and number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder="+628123456789"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Indonesian phone number format (e.g., +628xxx or 08xxx).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Timezone */}
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'WIB'}>
                    <FormControl>
                      <SelectTrigger>
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    User&apos;s local timezone for date/time display.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar URL */}
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </FormControl>
                  <FormDescription>
                    URL to user&apos;s profile picture.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Role & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Role & Permissions
            </CardTitle>
            <CardDescription>
              Assign user role and manage access permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Role */}
            <FormField
              control={form.control}
              name="userRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Group by category */}
                      {['platform', 'sppg-management', 'sppg-operational', 'sppg-staff', 'limited'].map((category) => {
                        const categoryRoles = USER_ROLE_OPTIONS.filter(r => r.category === category)
                        if (categoryRoles.length === 0) return null
                        
                        return (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                              {category.replace('-', ' ')}
                            </div>
                            {categoryRoles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                <div className="flex items-center gap-2">
                                  <span>{role.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Role determines user&apos;s permissions and access level.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* User Type (Auto-set, read-only display) */}
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Type (Auto-assigned)</FormLabel>
                  <FormControl>
                    <Input
                      value={USER_TYPE_OPTIONS.find(t => t.value === field.value)?.label || field.value}
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription>
                    User type is automatically assigned based on selected role.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SPPG Selector (conditional) */}
            {isSppgRole && (
              <FormField
                control={form.control}
                name="sppgId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SPPG Assignment</FormLabel>
                    <FormControl>
                      <SppgSelector
                        value={field.value || undefined}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      SPPG roles require SPPG assignment for access control.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Account Status
            </CardTitle>
            <CardDescription>
              Manage account activation and verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Is Active */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Account</FormLabel>
                    <FormDescription>
                      Active users can log in and access the system.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Email Verified (Create mode only) */}
            {mode === 'create' && (
              <FormField
                control={form.control}
                name="emailVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Verified</FormLabel>
                      <FormDescription>
                        Mark email as verified to skip email verification step.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* Edit mode: Show current status */}
            {mode === 'edit' && initialData && (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Verification Status</span>
                  <Badge variant={initialData.emailVerified ? 'default' : 'secondary'}>
                    {initialData.emailVerified ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
                {initialData.emailVerified && (
                  <p className="text-xs text-muted-foreground">
                    Verified on: {new Date(initialData.emailVerified).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancel ? onCancel() : router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {mode === 'create' ? 'Create User' : 'Update User'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

/**
 * SPPG Selector Component
 * Fetches and displays SPPG options for assignment
 */
interface SppgSelectorProps {
  value?: string
  onChange: (value: string | null) => void
}

function SppgSelector({ value, onChange }: SppgSelectorProps) {
  const [sppgs, setSppgs] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSppgs() {
      try {
        setIsLoading(true)
        // Fetch with high limit to get all SPPGs
        const response = await fetch('/api/admin/sppg?limit=100')
        
        if (!response.ok) {
          throw new Error('Failed to fetch SPPGs')
        }

        const result = await response.json()
        
        // API returns: { success: true, data: [...], pagination: {...} }
        if (result.success && result.data) {
          setSppgs(result.data)
        }
      } catch (error) {
        console.error('❌ [SppgSelector] Fetch error:', error)
        toast.error('Failed to load SPPG options')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSppgs()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading SPPGs...</span>
      </div>
    )
  }

  return (
    <Select 
      value={value || undefined} 
      onValueChange={(val) => onChange(val === '__none__' ? null : val)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select SPPG (Required for SPPG roles)" />
      </SelectTrigger>
      <SelectContent>
        {sppgs.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No SPPG available
          </div>
        ) : (
          <>
            <SelectItem value="__none__">
              <span className="text-muted-foreground italic">None (Clear selection)</span>
            </SelectItem>
            {sppgs.map((sppg) => (
              <SelectItem key={sppg.id} value={sppg.id}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {sppg.code}
                  </Badge>
                  <span>{sppg.name}</span>
                </div>
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  )
}
