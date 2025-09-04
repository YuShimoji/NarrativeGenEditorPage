import React from 'react'
import { ANIMATION_CONFIG } from '../../constants/config'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
  'data-testid'?: string
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  children,
  className = '',
  type = 'button',
  'aria-label': ariaLabel,
  'data-testid': testId,
  ...props
}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-md',
    'transition-all',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none'
  ]

  const variantClasses = {
    primary: [
      'bg-blue-600',
      'text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500',
      'active:bg-blue-800'
    ],
    secondary: [
      'bg-gray-200',
      'text-gray-900',
      'hover:bg-gray-300',
      'focus:ring-gray-500',
      'active:bg-gray-400'
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
      'active:bg-red-800'
    ],
    ghost: [
      'bg-transparent',
      'text-gray-700',
      'hover:bg-gray-100',
      'focus:ring-gray-500',
      'active:bg-gray-200'
    ],
    outline: [
      'bg-transparent',
      'text-gray-700',
      'border',
      'border-gray-300',
      'hover:bg-gray-50',
      'focus:ring-gray-500',
      'active:bg-gray-100'
    ]
  }

  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm', 'gap-1.5'],
    md: ['px-4', 'py-2', 'text-sm', 'gap-2'],
    lg: ['px-6', 'py-3', 'text-base', 'gap-2.5']
  }

  const widthClasses = fullWidth ? ['w-full'] : []

  const allClasses = [
    ...baseClasses,
    ...variantClasses[variant],
    ...sizeClasses[size],
    ...widthClasses,
    className
  ].join(' ')

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return
    onClick?.(event)
  }

  const renderIcon = (position: 'left' | 'right') => {
    if (!icon || iconPosition !== position) return null
    
    return (
      <span className={`flex-shrink-0 ${loading ? 'opacity-0' : ''}`}>
        {icon}
      </span>
    )
  }

  const renderSpinner = () => {
    if (!loading) return null
    
    return (
      <span className="absolute inset-0 flex items-center justify-center">
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </span>
    )
  }

  return (
    <button
      type={type}
      className={allClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-label={ariaLabel}
      data-testid={testId}
      style={{
        transitionDuration: `${ANIMATION_CONFIG.DURATION.FAST}ms`,
        transitionTimingFunction: ANIMATION_CONFIG.EASING.EASE_OUT
      }}
      {...props}
    >
      <span className={`flex items-center gap-inherit ${loading ? 'opacity-0' : ''}`}>
        {renderIcon('left')}
        {children}
        {renderIcon('right')}
      </span>
      {renderSpinner()}
    </button>
  )
}
