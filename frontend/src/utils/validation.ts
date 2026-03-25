// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export function isValidPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' }
  }
  return { valid: true, message: '' }
}

// Required field validation
export function isRequired(value: string, fieldName: string): { valid: boolean; message: string } {
  if (!value.trim()) {
    return { valid: false, message: `${fieldName} is required` }
  }
  return { valid: true, message: '' }
}

// Form validation types
export type ValidationRule<T> = (value: T) => string | null

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[]
}

// Generic form validation
export function validateForm<T extends Record<string, string>>(
  values: T,
  schema: ValidationSchema<T>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {}

  for (const key in schema) {
    const rules = schema[key]
    if (!rules) continue

    for (const rule of rules) {
      const error = rule(values[key])
      if (error) {
        errors[key] = error
        break // Stop at first error for this field
      }
    }
  }

  return errors
}

// Pre-built validation rules
export const validators = {
  required: (fieldName: string): ValidationRule<string> => (value) => {
    if (!value?.trim()) return `${fieldName} is required`
    return null
  },

  email: (): ValidationRule<string> => (value) => {
    if (!value) return null // Let required handle empty
    if (!isValidEmail(value)) return 'Please enter a valid email address'
    return null
  },

  minLength: (min: number, fieldName: string): ValidationRule<string> => (value) => {
    if (!value) return null
    if (value.length < min) return `${fieldName} must be at least ${min} characters`
    return null
  },

  match: (getOtherValue: () => string, fieldName: string): ValidationRule<string> => (value) => {
    if (!value) return null
    if (value !== getOtherValue()) return `${fieldName} do not match`
    return null
  },
}
