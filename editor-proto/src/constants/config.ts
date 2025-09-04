import { ChoiceStyle, DividerStyle } from '../types'

// 選択肢ボタンのプリセット設定
export const CHOICE_PRESETS = [
  {
    id: 'normal',
    label: '通常',
    style: 'normal' as ChoiceStyle,
    description: '標準的な選択肢',
    defaultText: '選択肢',
    cssClass: 'choice-normal',
    icon: '📝'
  },
  {
    id: 'important',
    label: '重要',
    style: 'important' as ChoiceStyle,
    description: '重要な決断を表す選択肢',
    defaultText: '重要な選択',
    cssClass: 'choice-important',
    icon: '⚡'
  },
  {
    id: 'dangerous',
    label: '危険',
    style: 'dangerous' as ChoiceStyle,
    description: 'リスクを伴う選択肢',
    defaultText: '危険な選択',
    cssClass: 'choice-dangerous',
    icon: '⚠️'
  },
  {
    id: 'subtle',
    label: '控えめ',
    style: 'subtle' as ChoiceStyle,
    description: '目立たない選択肢',
    defaultText: '静かに...',
    cssClass: 'choice-subtle',
    icon: '🤫'
  },
  {
    id: 'disabled',
    label: '無効',
    style: 'disabled' as ChoiceStyle,
    description: '選択できない選択肢',
    defaultText: '選択不可',
    cssClass: 'choice-disabled',
    icon: '🚫'
  }
] as const

// 区切り線のプリセット設定
export const DIVIDER_PRESETS = [
  {
    id: 'simple',
    label: 'シンプル',
    style: 'simple' as DividerStyle,
    description: 'シンプルな水平線',
    component: 'SimpleDivider',
    cssClass: 'divider-simple',
    icon: '➖',
    defaultText: ''
  },
  {
    id: 'ornate',
    label: '装飾',
    style: 'ornate' as DividerStyle,
    description: '装飾的な区切り線',
    component: 'OrnateDivider',
    cssClass: 'divider-ornate',
    icon: '✨',
    defaultText: '◆ ◇ ◆'
  },
  {
    id: 'dotted',
    label: '点線',
    style: 'dotted' as DividerStyle,
    description: '点線の区切り',
    component: 'DottedDivider',
    cssClass: 'divider-dotted',
    icon: '⋯',
    defaultText: '・・・・・・・・・・'
  },
  {
    id: 'stars',
    label: '星',
    style: 'stars' as DividerStyle,
    description: '星印の区切り',
    component: 'StarsDivider',
    cssClass: 'divider-stars',
    icon: '⭐',
    defaultText: '✦ ✧ ✦ ✧ ✦'
  },
  {
    id: 'custom',
    label: 'カスタム',
    style: 'custom' as DividerStyle,
    description: 'カスタム区切り線',
    component: 'CustomDivider',
    cssClass: 'divider-custom',
    icon: '🎨',
    defaultText: 'カスタム区切り'
  }
] as const

// エディタ設定のデフォルト値
export const DEFAULT_EDITOR_CONFIG = {
  autoSave: true,
  autoSaveInterval: 30, // seconds
  spellCheck: true,
  wordWrap: true,
  showLineNumbers: false,
  tabSize: 2,
  theme: 'auto' as const,
  font: {
    family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    size: 14,
    lineHeight: 1.6,
    weight: '400' as const
  }
} as const

// UI設定のデフォルト値
export const DEFAULT_UI_CONFIG = {
  language: 'ja' as const,
  animations: true,
  soundEffects: false,
  compactMode: false,
  showTooltips: true,
  keyboardShortcuts: {
    'toggle-zen': 'Ctrl+Shift+Z',
    'save': 'Ctrl+S',
    'bold': 'Ctrl+B',
    'italic': 'Ctrl+I',
    'underline': 'Ctrl+U',
    'strikethrough': 'Ctrl+Shift+X',
    'insert-choice': 'Ctrl+Shift+C',
    'insert-divider': 'Ctrl+Shift+D',
    'focus-search': 'Ctrl+F',
    'toggle-preview': 'Ctrl+Shift+P',
    'toggle-wiki': 'Ctrl+Shift+W'
  }
} as const

// Wiki設定のデフォルト値
export const DEFAULT_WIKI_CONFIG = {
  autoExtraction: true,
  extractionThreshold: 0.7,
  autoLinking: true,
  showRelatedEntries: true,
  maxRelatedEntries: 8
} as const

// 読書設定のデフォルト値
export const DEFAULT_READING_CONFIG = {
  trackingEnabled: true,
  goalMinutesPerDay: 30,
  reminderEnabled: false,
  reminderTime: '20:00',
  privacyMode: false
} as const

// カテゴリアイコンマッピング
export const CATEGORY_ICONS = {
  CHARACTER: '👤',
  LOCATION: '🏛️',
  ITEM: '💎',
  ORGANIZATION: '🏢',
  EVENT: '⚡',
  CONCEPT: '💭',
  TIMELINE: '📅',
  LORE: '📚',
  META: '🔧'
} as const

// 関係タイプの日本語ラベル
export const RELATION_TYPE_LABELS = {
  APPEARS_WITH: '共演',
  LOCATED_IN: '所在',
  BELONGS_TO: '所属',
  RELATED_TO: '関連',
  CAUSED_BY: '原因',
  PART_OF: '一部',
  SIMILAR_TO: '類似',
  OPPOSITE_TO: '対立'
} as const

// 投稿スタイルの設定
export const POST_STYLE_CONFIG = {
  FORMAL: {
    label: '正式',
    description: '公式文書や正式な発表',
    icon: '📋',
    cssClass: 'post-formal'
  },
  CASUAL: {
    label: 'カジュアル',
    description: '日常的な会話や記録',
    icon: '💬',
    cssClass: 'post-casual'
  },
  DIARY: {
    label: '日記',
    description: '個人的な日記や記録',
    icon: '📔',
    cssClass: 'post-diary'
  },
  LETTER: {
    label: '手紙',
    description: '手紙や書簡',
    icon: '✉️',
    cssClass: 'post-letter'
  },
  REPORT: {
    label: '報告書',
    description: '調査報告や業務報告',
    icon: '📊',
    cssClass: 'post-report'
  },
  GOSSIP: {
    label: '噂話',
    description: '噂や憶測',
    icon: '🗣️',
    cssClass: 'post-gossip'
  },
  POETRY: {
    label: '詩',
    description: '詩や韻文',
    icon: '🎭',
    cssClass: 'post-poetry'
  },
  TECHNICAL: {
    label: '技術文書',
    description: '技術的な説明や仕様',
    icon: '⚙️',
    cssClass: 'post-technical'
  }
} as const

// 没入感投稿タイプの設定
export const IMMERSIVE_POST_TYPES = {
  character_writing: {
    title: 'キャラクター執筆',
    placeholder: 'キャラクターの視点から書かれた文章...',
    icon: '✍️',
    defaultTags: ['character', 'perspective', 'writing'],
    suggestedAuthors: ['character']
  },
  rumor: {
    title: 'ルーモア・噂',
    placeholder: '街で囁かれる噂話...',
    icon: '🗣️',
    defaultTags: ['rumor', 'gossip', 'information'],
    suggestedAuthors: ['anonymous', 'character']
  },
  quote: {
    title: '名言・引用',
    placeholder: '印象的な言葉や名言...',
    icon: '💬',
    defaultTags: ['quote', 'wisdom', 'memorable'],
    suggestedAuthors: ['character']
  },
  diary: {
    title: '日記・記録',
    placeholder: '個人的な日記や記録...',
    icon: '📔',
    defaultTags: ['diary', 'personal', 'record'],
    suggestedAuthors: ['character']
  },
  letter: {
    title: '手紙・文書',
    placeholder: '手紙や公式文書...',
    icon: '📜',
    defaultTags: ['letter', 'document', 'correspondence'],
    suggestedAuthors: ['character', 'organization']
  },
  news: {
    title: 'ニュース・告知',
    placeholder: '公式発表、ニュース、告知など...',
    icon: '📰',
    defaultTags: ['news', 'announcement', 'official'],
    suggestedAuthors: ['organization']
  }
} as const

// バリデーションルール
export const VALIDATION_RULES = {
  SCENE_TITLE: {
    minLength: 1,
    maxLength: 100,
    required: true
  },
  SCENE_CONTENT: {
    minLength: 0,
    maxLength: 50000,
    required: false
  },
  WIKI_TITLE: {
    minLength: 1,
    maxLength: 200,
    required: true
  },
  WIKI_SUMMARY: {
    minLength: 0,
    maxLength: 500,
    required: false
  },
  CHOICE_TEXT: {
    minLength: 1,
    maxLength: 200,
    required: true
  },
  TAG_NAME: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]+$/,
    required: true
  }
} as const

// パフォーマンス設定
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300, // ms
  AUTO_SAVE_DELAY: 5000, // ms
  SEARCH_DELAY: 200, // ms
  SCROLL_THROTTLE: 16, // ms (60fps)
  MAX_SEARCH_RESULTS: 50,
  MAX_RELATED_ENTRIES: 10,
  CHUNK_SIZE: 1000, // characters for large text processing
  VIRTUAL_LIST_ITEM_HEIGHT: 60 // px
} as const

// アニメーション設定
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350
  },
  EASING: {
    EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    EASE_IN_OUT: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
} as const

// ローカルストレージキー
export const STORAGE_KEYS = {
  EDITOR_CONTENT: 'narrative-editor-content',
  UI_SETTINGS: 'narrative-ui-settings',
  WIKI_DATA: 'narrative-wiki-data',
  READING_STATS: 'narrative-reading-stats',
  USER_PREFERENCES: 'narrative-user-preferences',
  SCENE_DATA: 'narrative-scene-data',
  LAST_SESSION: 'narrative-last-session'
} as const
