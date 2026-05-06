import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Label } from '@/components/ui'
import { useAuth } from '@/features/auth/use-auth'
import { authService } from '@/services/auth/auth.service'
import { validators, validateForm } from '@/utils/validation'
import { AlertCircle, Loader2 } from 'lucide-react'

type LoginFormData = {
  email: string
  password: string
}

export function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const validationSchema = {
    email: [validators.required('Email'), validators.email()],
    password: [validators.required('Password')],
  }

  const handleChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    if (apiError) setApiError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError('')

    const validationErrors = validateForm(formData, validationSchema)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      })
      login(response.accessToken, response.user)
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message || 'Invalid email or password')
      } else {
        setApiError('An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[400px] animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {apiError && (
          <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

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
            className={errors.email ? 'border-destructive focus-visible:ring-destructive/30' : ''}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              onClick={() => alert('Password reset not implemented yet')}
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange('password')}
            disabled={isLoading}
            autoComplete="current-password"
            className={errors.password ? 'border-destructive focus-visible:ring-destructive/30' : ''}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <label htmlFor="remember" className="cursor-pointer text-sm text-muted-foreground">
            Remember me
          </label>
        </div>

        <Button type="submit" className="w-full h-10" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Sign up
          </Link>
        </p>

        <div className="rounded-lg bg-muted/60 border border-border/60 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Demo credentials</p>
          <p className="mt-1">Email: demo@aivora.com</p>
          <p>Password: demo123</p>
        </div>
      </form>
    </div>
  )
}
