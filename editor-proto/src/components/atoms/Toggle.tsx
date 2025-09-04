import React from 'react'
import { ANIMATION_CONFIG } from '../../constants/config'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  color?: 'blue' | 'green' | 'red' | 'purple'
  className?: string
  'aria-label'?: string
  'data-testid'?: string
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  disabled = false,
  color = 'blue',
  className = '',
  'aria-label': ariaLabel,
  'data-testid': testId
}) => {
  const toggleId = `toggle-${Math.random().toString(36).substr(2, 9)}`

  const sizeClasses = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  }

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600'
  }

  const handleToggle = () => {
    if (disabled) return
    onChange(!checked)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      handleToggle()
    }
  }

  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? `${toggleId}-label` : undefined}
          aria-label={ariaLabel}
          data-testid={testId}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`
            relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-${color}-500 disabled:opacity-50 disabled:cursor-not-allowed
            ${sizeClasses[size].track}
            ${checked ? colorClasses[color] : 'bg-gray-200'}
          `}
          style={{
            transitionDuration: `${ANIMATION_CONFIG.DURATION.FAST}ms`,
            transitionTimingFunction: ANIMATION_CONFIG.EASING.EASE_OUT
          }}
        >
          <span
            className={`
              pointer-events-none inline-block rounded-full bg-white shadow transform ring-0
              transition duration-200 ease-in-out
              ${sizeClasses[size].thumb}
              ${checked ? sizeClasses[size].translate : 'translate-x-0'}
            `}
            style={{
              transitionDuration: `${ANIMATION_CONFIG.DURATION.FAST}ms`,
              transitionTimingFunction: ANIMATION_CONFIG.EASING.EASE_OUT
            }}
          />
        </button>
      </div>

      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              id={`${toggleId}-label`}
              htmlFor={toggleId}
              className={`
                font-medium text-gray-900 cursor-pointer
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-sm'}
              `}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={`
              text-gray-500 mt-1
              ${size === 'sm' ? 'text-xs' : 'text-sm'}
            `}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
