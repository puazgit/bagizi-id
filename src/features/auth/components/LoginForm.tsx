/**
 * @fileoverview Enterprise authentication components for login system
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Eye, 
  EyeOff, 
  Shield, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import { useLogin, useFormValidation } from '../hooks'

interface LoginFormProps {
  callbackUrl?: string
  className?: string
}

/**
 * Enterprise-grade login form with advanced security features
 */
export function LoginForm({ callbackUrl, className }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [deviceTrust, setDeviceTrust] = useState(false)
  
  const { 
    isSubmitting, 
    loginProgress, 
    authError, 
    securityMetrics, 
    login, 
    clearError 
  } = useLogin()
  
  const { validation, validateEmail, validatePassword } = useFormValidation()
  
  // Simple form schema for UI
  const simpleLoginSchema = z.object({
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi')
  })
  
  type SimpleLoginForm = z.infer<typeof simpleLoginSchema>
  
  // Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors
  } = useForm<SimpleLoginForm>({
    resolver: zodResolver(simpleLoginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  })
  
  // Watch form values for real-time validation
  const watchedEmail = watch('email')
  const watchedPassword = watch('password')
  
  // Real-time validation effects
  useEffect(() => {
    if (watchedEmail) {
      const emailValidation = validateEmail(watchedEmail)
      if (emailValidation.isValid) {
        clearErrors('email')
      }
    }
  }, [watchedEmail, validateEmail, clearErrors])
  
  useEffect(() => {
    if (watchedPassword) {
      validatePassword(watchedPassword)
    }
  }, [watchedPassword, validatePassword])
  
  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('bagizi-remember-email')
    if (rememberedEmail) {
      setValue('email', rememberedEmail)
      setRememberMe(true)
    }
  }, [setValue])
  
  // Clear auth error when form changes
  useEffect(() => {
    if (authError && (watchedEmail || watchedPassword)) {
      clearError()
    }
  }, [watchedEmail, watchedPassword, authError, clearError])
  
  // Handle form submission
  const onSubmit = async (data: SimpleLoginForm) => {
    const result = await login(data.email, data.password, {
      rememberMe,
      deviceTrust,
      callbackUrl
    })
    
    // Auth.js and middleware will handle the redirect based on user role
    // No need for manual redirect here
    if (result.success) {
      // Login success - redirect will be handled automatically
    }
  }
  
  // Get password strength color and text
  const getPasswordStrengthInfo = () => {
    const strength = validation.password.strength
    if (strength < 30) return { color: 'destructive', text: 'Lemah', bgColor: 'bg-red-500' }
    if (strength < 60) return { color: 'warning', text: 'Sedang', bgColor: 'bg-yellow-500' }
    if (strength < 80) return { color: 'info', text: 'Baik', bgColor: 'bg-blue-500' }
    return { color: 'success', text: 'Kuat', bgColor: 'bg-green-500' }
  }
  
  const passwordStrengthInfo = getPasswordStrengthInfo()
  
  return (
    <Card className={cn('w-full max-w-md mx-auto shadow-2xl border-0', className)}>
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-center">Bagizi-ID</CardTitle>
            <CardDescription className="text-center">
              SPPG Management Platform
            </CardDescription>
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-1">Masuk ke Akun Anda</h1>
          <p className="text-sm text-muted-foreground">
            Kelola program gizi dengan mudah dan efisien
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Security Status Indicator */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Keamanan</span>
          </div>
          <Badge variant={securityMetrics.riskLevel === 'low' ? 'default' : 'destructive'}>
            {securityMetrics.riskLevel === 'low' ? 'Aman' : 'Perhatian'}
          </Badge>
        </div>
        
        {/* Authentication Error */}
        {authError && (
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{authError}</span>
          </div>
        )}
        
        {/* Login Progress */}
        {isSubmitting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Memverifikasi kredensial...</span>
              <span>{loginProgress}%</span>
            </div>
            <Progress value={loginProgress} className="h-2" />
          </div>
        )}
        
        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="nama@sppg.id"
                disabled={isSubmitting}
                className={cn(
                  validation.email.isValid && 'border-green-500 focus:border-green-500',
                  errors.email && 'border-red-500 focus:border-red-500'
                )}
                {...register('email')}
              />
              {validation.email.isValid && (
                <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            
            {/* Email Validation Feedback */}
            {watchedEmail && (
              <div className="flex items-center justify-between text-xs">
                <span className={cn(
                  validation.email.isValid ? 'text-green-600' : 'text-amber-600'
                )}>
                  {validation.email.message}
                </span>
                {validation.email.isValid && (
                  <Badge variant="outline" className="text-xs">
                    Terverifikasi
                  </Badge>
                )}
              </div>
            )}
            
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Password</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password Anda"
                disabled={isSubmitting}
                className={cn(
                  validation.password.strength > 70 && 'border-green-500 focus:border-green-500',
                  errors.password && 'border-red-500 focus:border-red-500'
                )}
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Password Strength Indicator */}
            {watchedPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Kekuatan Password</span>
                  <Badge variant="outline" className={cn(
                    'text-xs',
                    passwordStrengthInfo.color === 'success' && 'text-green-600 border-green-200',
                    passwordStrengthInfo.color === 'info' && 'text-blue-600 border-blue-200',
                    passwordStrengthInfo.color === 'warning' && 'text-yellow-600 border-yellow-200',
                    passwordStrengthInfo.color === 'destructive' && 'text-red-600 border-red-200'
                  )}>
                    {passwordStrengthInfo.text}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={cn('h-1.5 rounded-full transition-all', passwordStrengthInfo.bgColor)}
                    style={{ width: `${validation.password.strength}%` }}
                  />
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          
          {/* Security Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="remember-me" className="text-sm cursor-pointer">
                Ingat email saya
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="device-trust"
                checked={deviceTrust}
                onCheckedChange={(checked) => setDeviceTrust(!!checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="device-trust" className="text-sm cursor-pointer flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Percayai perangkat ini</span>
              </Label>
            </div>
          </div>
          
          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-11 font-medium" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Masuk Aman
              </>
            )}
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Atau
            </span>
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="text-center space-y-2">
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-primary hover:underline"
          >
            Lupa password?
          </Link>
          
          <div className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Daftar di sini
            </Link>
          </div>
          
          <div className="text-xs text-muted-foreground pt-2">
            Ingin mencoba?{' '}
            <Link href="/demo-request" className="text-primary hover:underline">
              Request Demo
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Login page wrapper with security context
 */
export function LoginPage({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-8">
        <LoginForm callbackUrl={callbackUrl} />
        
        {/* Security Notice */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-full">
            <Shield className="w-3 h-3" />
            <span>Dilindungi dengan enkripsi tingkat enterprise</span>
          </div>
        </div>
      </div>
    </div>
  )
}