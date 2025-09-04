import React, { forwardRef } from 'react'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  required?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  fullWidth = false,
  required = false,
  className = '',
  disabled,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  const baseClasses = [
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-transparent',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed'
  ]

  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-sm'],
    lg: ['px-4', 'py-3', 'text-base']
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
      'bg-transparent',
      'hover:border-gray-400',
      error ? 'border-red-500 focus:ring-red-500' : ''
    ]
  }

  const widthClasses = fullWidth ? ['w-full'] : []
  const iconPadding = {
    left: leftIcon ? (size === 'sm' ? 'pl-10' : size === 'lg' ? 'pl-12' : 'pl-11') : '',
    right: rightIcon ? (size === 'sm' ? 'pr-10' : size === 'lg' ? 'pr-12' : 'pr-11') : ''
  }

  const inputClasses = [
    ...baseClasses,
    ...sizeClasses[size],
    ...variantClasses[variant],
    ...widthClasses,
    iconPadding.left,
    iconPadding.right,
    className
  ].filter(Boolean).join(' ')

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  const iconPosition = {
    left: size === 'sm' ? 'left-3' : 'left-3',
    right: size === 'sm' ? 'right-3' : 'right-3'
  }

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={`absolute ${iconPosition.left} top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none`}>
            <span className={iconSize}>{leftIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          disabled={disabled}
          required={required}
          {...props}
        />
        
        {rightIcon && (
          <div className={`absolute ${iconPosition.right} top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none`}>
            <span className={iconSize}>{rightIcon}</span>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})
