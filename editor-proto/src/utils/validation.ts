import { VALIDATION_RULES } from '../constants/config'
import { ValidationResult, ValidationError, ValidationWarning } from '../types'

export class ValidationService {
  static validateSceneTitle(title: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    const rules = VALIDATION_RULES.SCENE_TITLE

    if (rules.required && !title.trim()) {
      errors.push({
        field: 'title',
        message: 'タイトルは必須です',
        code: 'REQUIRED'
      })
    }

    if (title.length < rules.minLength) {
      errors.push({
        field: 'title',
        message: `タイトルは${rules.minLength}文字以上である必要があります`,
        code: 'MIN_LENGTH'
      })
    }

    if (title.length > rules.maxLength) {
      errors.push({
        field: 'title',
        message: `タイトルは${rules.maxLength}文字以下である必要があります`,
        code: 'MAX_LENGTH'
      })
    }

    // 警告レベルのチェック
    if (title.length > 50) {
      warnings.push({
        field: 'title',
        message: 'タイトルが長すぎる可能性があります',
        suggestion: '50文字以下にすることをお勧めします'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  static validateSceneContent(content: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    const rules = VALIDATION_RULES.SCENE_CONTENT

    if (content.length > rules.maxLength) {
      errors.push({
        field: 'content',
        message: `コンテンツは${rules.maxLength}文字以下である必要があります`,
        code: 'MAX_LENGTH'
      })
    }

    // 警告レベルのチェック
    if (content.length > 10000) {
      warnings.push({
        field: 'content',
        message: 'コンテンツが非常に長くなっています',
        suggestion: 'シーンを分割することを検討してください'
      })
    }

    if (content.length === 0) {
      warnings.push({
        field: 'content',
        message: 'コンテンツが空です',
        suggestion: '内容を追加してください'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  static validateWikiTitle(title: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    const rules = VALIDATION_RULES.WIKI_TITLE

    if (rules.required && !title.trim()) {
      errors.push({
        field: 'title',
        message: 'Wikiタイトルは必須です',
        code: 'REQUIRED'
      })
    }

    if (title.length < rules.minLength) {
      errors.push({
        field: 'title',
        message: `Wikiタイトルは${rules.minLength}文字以上である必要があります`,
        code: 'MIN_LENGTH'
      })
    }

    if (title.length > rules.maxLength) {
      errors.push({
        field: 'title',
        message: `Wikiタイトルは${rules.maxLength}文字以下である必要があります`,
        code: 'MAX_LENGTH'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  static validateTagName(tag: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    const rules = VALIDATION_RULES.TAG_NAME

    if (rules.required && !tag.trim()) {
      errors.push({
        field: 'tag',
        message: 'タグ名は必須です',
        code: 'REQUIRED'
      })
    }

    if (tag.length < rules.minLength) {
      errors.push({
        field: 'tag',
        message: `タグ名は${rules.minLength}文字以上である必要があります`,
        code: 'MIN_LENGTH'
      })
    }

    if (tag.length > rules.maxLength) {
      errors.push({
        field: 'tag',
        message: `タグ名は${rules.maxLength}文字以下である必要があります`,
        code: 'MAX_LENGTH'
      })
    }

    if (rules.pattern && !rules.pattern.test(tag)) {
      errors.push({
        field: 'tag',
        message: 'タグ名に無効な文字が含まれています',
        code: 'INVALID_FORMAT'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  static validateChoiceText(text: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    const rules = VALIDATION_RULES.CHOICE_TEXT

    if (rules.required && !text.trim()) {
      errors.push({
        field: 'text',
        message: '選択肢テキストは必須です',
        code: 'REQUIRED'
      })
    }

    if (text.length < rules.minLength) {
      errors.push({
        field: 'text',
        message: `選択肢テキストは${rules.minLength}文字以上である必要があります`,
        code: 'MIN_LENGTH'
      })
    }

    if (text.length > rules.maxLength) {
      errors.push({
        field: 'text',
        message: `選択肢テキストは${rules.maxLength}文字以下である必要があります`,
        code: 'MAX_LENGTH'
      })
    }

    // 警告レベルのチェック
    if (text.length > 100) {
      warnings.push({
        field: 'text',
        message: '選択肢テキストが長すぎる可能性があります',
        suggestion: '100文字以下にすることをお勧めします'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  static validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email.trim()) {
      errors.push({
        field: 'email',
        message: 'メールアドレスは必須です',
        code: 'REQUIRED'
      })
    } else if (!emailPattern.test(email)) {
      errors.push({
        field: 'email',
        message: '有効なメールアドレスを入力してください',
        code: 'INVALID_FORMAT'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  static validateUrl(url: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    try {
      new URL(url)
    } catch {
      errors.push({
        field: 'url',
        message: '有効なURLを入力してください',
        code: 'INVALID_FORMAT'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  static validateRequired(value: string | number | boolean, fieldName: string): ValidationResult {
    const errors: ValidationError[] = []

    if (value === '' || value === null || value === undefined) {
      errors.push({
        field: fieldName,
        message: `${fieldName}は必須です`,
        code: 'REQUIRED'
      })
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: []
    }
  }

  static validateRange(value: number, min: number, max: number, fieldName: string): ValidationResult {
    const errors: ValidationError[] = []

    if (value < min || value > max) {
      errors.push({
        field: fieldName,
        message: `${fieldName}は${min}から${max}の間で入力してください`,
        code: 'OUT_OF_RANGE'
      })
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: []
    }
  }

  static combineValidationResults(...results: ValidationResult[]): ValidationResult {
    const allErrors: ValidationError[] = []
    const allWarnings: ValidationWarning[] = []

    for (const result of results) {
      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    }
  }
}
