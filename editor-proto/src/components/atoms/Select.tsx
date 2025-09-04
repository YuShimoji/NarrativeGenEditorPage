import React, { forwardRef } from 'react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  icon?: React.ReactNode
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
  required?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  options,
  placeholder,
  fullWidth = false,
  required = false,
  className = '',
  disabled,
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

  const baseClasses = [
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-transparent',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'appearance-none',
    'bg-no-repeat',
    'bg-right',
    'bg-center'
  ]

  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm', 'pr-8'],
    md: ['px-4', 'py-2', 'text-sm', 'pr-10'],
    lg: ['px-4', 'py-3', 'text-base', 'pr-12']
  }

  const variantClasses = {
    default: [
      'border',
      'border-gray-300',
      'rounded-md',
      'bg-white',
      'hover:border-gray-400',
      error ? 'border-red-500 focus:ring-red-500' : ''
    ],
    filled: [
      'border-0',
      'rounded-md',
      'bg-gray-100',
      'hover:bg-gray-200',
      'focus:bg-white',
      error ? 'bg-red-50 focus:bg-red-50' : ''
    ],
    outlined: [
      'border-2',
      'border-gray-300',
      'rounded-md',
      'bg-white',
      'hover:border-gray-400',
      error ? 'border-red-500 focus:ring-red-500' : ''
    ]
  }

  const widthClasses = fullWidth ? ['w-full'] : []

  const selectClasses = [
    ...baseClasses,
    ...sizeClasses[size],
    ...variantClasses[variant],
    ...widthClasses,
    className
  ].filter(Boolean).join(' ')

  // SVG arrow icon as background
  const arrowIcon = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  `)}`

  const backgroundImage = `url("${arrowIcon}")`
  const backgroundSize = size === 'sm' ? '16px' : size === 'lg' ? '20px' : '18px'
  const backgroundPosition = size === 'sm' ? 'right 8px center' : size === 'lg' ? 'right 12px center' : 'right 10px center'

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          disabled={disabled}
          required={required}
          style={{
            backgroundImage,
            backgroundSize,
            backgroundPosition
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})
