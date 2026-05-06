import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Label } from '@/components/ui'
import { useAuth } from '@/features/auth/use-auth'
import { authService } from '@/services/auth/auth.service'
import { validators, validateForm } from '@/utils/validation'
import { toPublicErrorMessage } from '@/lib/errors'
import { AlertCircle, Loader2 } from 'lucide-react'

type RegisterFormData = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  tenantName: string
}

export function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    tenantName: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const validationSchema = {
    fullName: [validators.required('Full name')],
    tenantName: [validators.required('Organization name')],
    email: [validators.required('Email'), validators.email()],
    password: [
      validators.required('Password'),
      validators.minLength(6, 'Password'),
    ],
    confirmPassword: [
      validators.required('Confirm password'),
      validators.match(() => formData.password, 'Passwords'),
    ],
  }

  const handleChange = (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    if (apiError) setApiError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setApiError('')

    const validationErrors = validateForm(formData, validationSchema)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        tenantName: formData.tenantName,
      })
      login(response.accessToken, response.user)
      navigate('/dashboard')
    } catch (err) {
      setApiError(toPublicErrorMessage(err, 'Registration failed. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = (field: keyof RegisterFormData) =>
    errors[field] ? 'border-destructive focus-visible:ring-destructive/30' : ''

  return (
    <div className="w-full max-w-[400px] animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Create an account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your details to get started with Aivora
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange('fullName')}
              disabled={isLoading}
              autoComplete="name"
              className={inputClass('fullName')}
            />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantName">Organization</Label>
            <Input
              id="tenantName"
              type="text"
              placeholder="Company name"
              value={formData.tenantName}
              onChange={handleChange('tenantName')}
              disabled={isLoading}
              autoComplete="organization"
              className={inputClass('tenantName')}
            />
            {errors.tenantName && <p className="text-xs text-destructive">{errors.tenantName}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange('email')}
            disabled={isLoading}
            autoComplete="email"
            className={inputClass('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange('password')}
              disabled={isLoading}
              autoComplete="new-password"
              className={inputClass('password')}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              disabled={isLoading}
              autoComplete="new-password"
              className={inputClass('confirmPassword')}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>
        </div>

        <Button type="submit" className="w-full h-10 mt-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
