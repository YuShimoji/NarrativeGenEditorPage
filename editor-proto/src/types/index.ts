// 共通型定義
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// エディタ関連の型定義
export interface EditorContent {
  markdown: string
  html: string
  plainText: string
  wordCount: number
  characterCount: number
}

export interface EditorSelection {
  from: number
  to: number
  text: string
}

export interface EditorPosition {
  line: number
  column: number
  offset: number
}

// シーン関連の型定義
export interface Scene extends BaseEntity {
  title: string
  content: string
  summary: string
  tags: string[]
  order: number
  parentId?: string
  children: string[]
  metadata: SceneMetadata
}

export interface SceneMetadata {
  wordCount: number
  estimatedReadingTime: number
  difficulty: 1 | 2 | 3 | 4 | 5
  status: 'draft' | 'review' | 'published' | 'archived'
  lastEditedAt: Date
  version: number
}

// Wiki関連の型定義（既存のものを強化）
export interface WikiContent {
  markdown: string
  summary: string
  infobox?: InfoboxData
  gallery?: MediaItem[]
  quotes?: Quote[]
  rumors?: Rumor[]
  authorVoice?: AuthorPost[]
}

export interface InfoboxData {
  [key: string]: string | number | boolean | Date
}

export interface MediaItem {
  id: string
  url: string
  caption?: string
  type: 'image' | 'audio' | 'video'
  metadata: MediaMetadata
}

export interface MediaMetadata {
  size: number
  dimensions?: { width: number; height: number }
  duration?: number
  format: string
  uploadedAt: Date
}

export interface Quote {
  id: string
  text: string
  speaker?: string
  context?: string
  scene?: string
  tags: string[]
  importance: 1 | 2 | 3 | 4 | 5
}

export interface Rumor {
  id: string
  content: string
  source?: string
  veracity: number // 0-1
  spreadLevel: number // 1-5
  relatedEntries: string[]
  firstHeard: Date
  tags: string[]
}

export interface AuthorPost {
  id: string
  authorId: string
  authorName: string
  authorRole: AuthorRole
  content: string
  style: PostStyle
  timestamp: Date
  mood?: string
  reliability: number // 0-1
  tags: string[]
}

// 選択肢システムの型定義
export interface ChoiceButton {
  id: string
  text: string
  targetSceneId?: string
  style: ChoiceStyle
  condition?: ChoiceCondition
  enabled: boolean
  metadata: ChoiceMetadata
}

export interface ChoiceCondition {
  type: 'variable' | 'flag' | 'item' | 'custom'
  key: string
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'not_contains'
  value: string | number | boolean
}

export interface ChoiceMetadata {
  importance: 1 | 2 | 3 | 4 | 5
  consequences: string[]
  requiredItems?: string[]
  requiredFlags?: string[]
  createdAt: Date
  lastModified: Date
}

export type ChoiceStyle = 'normal' | 'important' | 'dangerous' | 'subtle' | 'disabled'

// 区切り線システムの型定義
export interface Divider {
  id: string
  style: DividerStyle
  text?: string
  metadata: DividerMetadata
}

export interface DividerMetadata {
  createdAt: Date
  usage: 'scene_break' | 'time_skip' | 'perspective_change' | 'thematic_break'
}

export type DividerStyle = 'simple' | 'ornate' | 'dotted' | 'stars' | 'custom'

// 読書進捗の型定義
export interface ReadingSession extends BaseEntity {
  sceneId: string
  sceneName: string
  startTime: Date
  endTime?: Date
  wordsRead: number
  timeSpent: number // minutes
  scrollProgress: number // 0-100%
  metadata: ReadingSessionMetadata
}

export interface ReadingSessionMetadata {
  device: 'desktop' | 'tablet' | 'mobile'
  readingSpeed: number // words per minute
  pauseCount: number
  averageScrollSpeed: number
}

export interface ReadingStats {
  totalSessions: number
  totalTimeSpent: number // minutes
  totalWordsRead: number
  averageReadingSpeed: number // words per minute
  sessionsToday: number
  currentStreak: number // consecutive days
  longestStreak: number
  favoriteScenes: string[]
  readingGoal: number // minutes per day
  goalProgress: number // 0-100%
  weeklyStats: WeeklyReadingStats[]
}

export interface WeeklyReadingStats {
  week: string // ISO week string
  totalTime: number
  totalWords: number
  sessionsCount: number
  averageSessionLength: number
}

// API関連の型定義
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  timestamp: Date
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// 設定関連の型定義
export interface AppConfig {
  editor: EditorConfig
  ui: UIConfig
  wiki: WikiConfig
  reading: ReadingConfig
}

export interface EditorConfig {
  autoSave: boolean
  autoSaveInterval: number // seconds
  spellCheck: boolean
  wordWrap: boolean
  showLineNumbers: boolean
  tabSize: number
  theme: 'light' | 'dark' | 'auto'
  font: FontConfig
}

export interface FontConfig {
  family: string
  size: number
  lineHeight: number
  weight: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700'
}

export interface UIConfig {
  language: 'ja' | 'en'
  animations: boolean
  soundEffects: boolean
  compactMode: boolean
  showTooltips: boolean
  keyboardShortcuts: Record<string, string>
}

export interface WikiConfig {
  autoExtraction: boolean
  extractionThreshold: number // 0-1
  autoLinking: boolean
  showRelatedEntries: boolean
  maxRelatedEntries: number
}

export interface ReadingConfig {
  trackingEnabled: boolean
  goalMinutesPerDay: number
  reminderEnabled: boolean
  reminderTime: string // HH:MM format
  privacyMode: boolean
}

// イベント関連の型定義
export interface AppEvent {
  type: string
  payload: Record<string, unknown>
  timestamp: Date
  source: 'user' | 'system' | 'auto'
}

export interface UserAction extends AppEvent {
  userId?: string
  sessionId: string
  action: 'create' | 'update' | 'delete' | 'view' | 'search'
  target: 'scene' | 'wiki' | 'choice' | 'divider' | 'session'
  targetId: string
}

// バリデーション関連の型定義
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

// ユーティリティ型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// 既存のenumを再エクスポート
export { EntryCategory, RelationType, AuthorRole, PostStyle } from '../store/useWikiStore'
