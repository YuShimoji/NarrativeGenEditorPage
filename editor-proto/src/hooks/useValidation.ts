import { useState, useCallback } from 'react'
import { ValidationService } from '../utils/validation'
import { ValidationResult } from '../types'

export interface UseValidationOptions {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  debounceMs?: number
}

export interface ValidationState {
  [field: string]: ValidationResult
}

export const useValidation = (options: UseValidationOptions = {}) => {
  const {
    validateOnChange = false,
    validateOnBlur = true,
    debounceMs = 300
  } = options

  const [validationState, setValidationState] = useState<ValidationState>({})
  const [isValidating, setIsValidating] = useState(false)

  const validateField = useCallback((
    field: string,
    value: any,
    validator: (value: any) => ValidationResult
  ) => {
    setIsValidating(true)
    
    const result = validator(value)
    
    setValidationState(prev => ({
      ...prev,
      [field]: result
    }))
    
    setIsValidating(false)
    return result
  }, [])

  const validateSceneTitle = useCallback((title: string) => {
    return validateField('title', title, ValidationService.validateSceneTitle)
  }, [validateField])

  const validateSceneContent = useCallback((content: string) => {
    return validateField('content', content, ValidationService.validateSceneContent)
  }, [validateField])

  const validateWikiTitle = useCallback((title: string) => {
    return validateField('wikiTitle', title, ValidationService.validateWikiTitle)
  }, [validateField])

  const validateTagName = useCallback((tag: string) => {
    return validateField('tag', tag, ValidationService.validateTagName)
  }, [validateField])

  const validateChoiceText = useCallback((text: string) => {
    return validateField('choiceText', text, ValidationService.validateChoiceText)
  }, [validateField])

  const validateEmail = useCallback((email: string) => {
    return validateField('email', email, ValidationService.validateEmail)
  }, [validateField])

  const validateUrl = useCallback((url: string) => {
    return validateField('url', url, ValidationService.validateUrl)
  }, [validateField])

  const validateRequired = useCallback((value: any, fieldName: string) => {
    return validateField(fieldName, value, (val) => 
      ValidationService.validateRequired(val, fieldName)
    )
  }, [validateField])

  const validateRange = useCallback((value: number, min: number, max: number, fieldName: string) => {
    return validateField(fieldName, value, (val) => 
      ValidationService.validateRange(val, min, max, fieldName)
    )
  }, [validateField])

  const clearValidation = useCallback((field?: string) => {
    if (field) {
      setValidationState(prev => {
        const newState = { ...prev }
        delete newState[field]
        return newState
      })
    } else {
      setValidationState({})
    }
  }, [])

  const getFieldValidation = useCallback((field: string): ValidationResult | undefined => {
    return validationState[field]
  }, [validationState])

  const hasErrors = useCallback((field?: string): boolean => {
    if (field) {
      const validation = validationState[field]
      return validation ? validation.errors.length > 0 : false
    }
    
    return Object.values(validationState).some(validation => 
      validation.errors.length > 0
    )
  }, [validationState])

  const hasWarnings = useCallback((field?: string): boolean => {
    if (field) {
      const validation = validationState[field]
      return validation ? validation.warnings.length > 0 : false
    }
    
    return Object.values(validationState).some(validation => 
      validation.warnings.length > 0
    )
  }, [validationState])

  const isValid = useCallback((field?: string): boolean => {
    if (field) {
      const validation = validationState[field]
      return validation ? validation.isValid : true
    }
    
    return Object.values(validationState).every(validation => validation.isValid)
  }, [validationState])

  const getErrorMessage = useCallback((field: string): string | undefined => {
    const validation = validationState[field]
    return validation?.errors[0]?.message
  }, [validationState])

  const getWarningMessage = useCallback((field: string): string | undefined => {
    const validation = validationState[field]
    return validation?.warnings[0]?.message
  }, [validationState])

  const validateAll = useCallback((validators: Array<() => ValidationResult>): boolean => {
    const results = validators.map(validator => validator())
    const combinedResult = ValidationService.combineValidationResults(...results)
    return combinedResult.isValid
  }, [])

  return {
    // State
    validationState,
    isValidating,
    
    // Validation methods
    validateSceneTitle,
    validateSceneContent,
    validateWikiTitle,
    validateTagName,
    validateChoiceText,
    validateEmail,
    validateUrl,
    validateRequired,
    validateRange,
    validateAll,
    
    // Utility methods
    clearValidation,
    getFieldValidation,
    hasErrors,
    hasWarnings,
    isValid,
    getErrorMessage,
    getWarningMessage
  }
}
