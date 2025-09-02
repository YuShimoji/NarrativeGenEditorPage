import React, { useEffect, useState } from 'react'
import { useWikiStore, WikiEntry, EntryCategory } from '../store/useWikiStore'
import { useSceneStore } from '../store/useSceneStore'

interface EntityCandidate {
  text: string
  category: EntryCategory
  confidence: number
  context: string
  suggestedTags: string[]
}

interface AutoWikiExtractorProps {
  content: string
  onSuggestionsReady?: (suggestions: EntityCandidate[]) => void
}

export const AutoWikiExtractor: React.FC<AutoWikiExtractorProps> = ({ 
  content, 
  onSuggestionsReady 
}) => {
  const { entries, addEntry } = useWikiStore()
  const { getCurrentScene } = useSceneStore()
  const [suggestions, setSuggestions] = useState<EntityCandidate[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // 簡易NLP分析（将来的にはより高度なNLPライブラリを使用）
  const extractEntities = (text: string): EntityCandidate[] => {
    const candidates: EntityCandidate[] = []
    
    // 日本語の人名パターン（姓名）
    const namePattern = /([一-龯]{1,4})[・\s]*([一-龯]{1,4})/g
    let match
    while ((match = namePattern.exec(text)) !== null) {
      const fullName = match[0].replace(/[・\s]/g, '')
      if (fullName.length >= 2 && fullName.length <= 8) {
        candidates.push({
          text: fullName,
          category: EntryCategory.CHARACTER,
          confidence: 0.8,
          context: text.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
          suggestedTags: ['character', 'person']
        })
      }
    }

    // 場所名パターン（「〜で」「〜に」「〜の」などの助詞が続く）
    const locationPattern = /([一-龯]{2,8})(で|に|の|から|へ|まで)/g
    while ((match = locationPattern.exec(text)) !== null) {
      const location = match[1]
      if (!candidates.some(c => c.text === location)) {
        candidates.push({
          text: location,
          category: EntryCategory.LOCATION,
          confidence: 0.6,
          context: text.substring(Math.max(0, match.index - 15), match.index + match[0].length + 15),
          suggestedTags: ['location', 'place']
        })
      }
    }

    // アイテム・道具パターン（「〜を」「〜が」などの目的語）
    const itemPattern = /([一-龯]{2,6})(を|が|は)/g
    while ((match = itemPattern.exec(text)) !== null) {
      const item = match[1]
      // 一般的すぎる語は除外
      const commonWords = ['こと', 'もの', '時間', '場所', '人間', '自分', '相手']
      if (!commonWords.includes(item) && !candidates.some(c => c.text === item)) {
        candidates.push({
          text: item,
          category: EntryCategory.ITEM,
          confidence: 0.4,
          context: text.substring(Math.max(0, match.index - 15), match.index + match[0].length + 15),
          suggestedTags: ['item', 'object']
        })
      }
    }

    // 組織・団体パターン（「〜学院」「〜会」「〜部」など）
    const orgPattern = /([一-龯]{2,8})(学院|学校|会社|組織|団体|部|課|省|庁)/g
    while ((match = orgPattern.exec(text)) !== null) {
      const org = match[0]
      candidates.push({
        text: org,
        category: EntryCategory.ORGANIZATION,
        confidence: 0.7,
        context: text.substring(Math.max(0, match.index - 15), match.index + match[0].length + 15),
        suggestedTags: ['organization', 'institution']
      })
    }

    // 既存エントリとの重複チェック
    return candidates.filter(candidate => 
      !entries.some(entry => 
        entry.title.toLowerCase() === candidate.text.toLowerCase()
      )
    )
  }

  useEffect(() => {
    if (!content || content.length < 10) {
      setSuggestions([])
      return
    }

    // デバウンス処理
    const timer = setTimeout(() => {
      const extracted = extractEntities(content)
      setSuggestions(extracted)
      onSuggestionsReady?.(extracted)
      
      if (extracted.length > 0) {
        setShowSuggestions(true)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [content, entries, onSuggestionsReady])

  const handleAcceptSuggestion = (candidate: EntityCandidate) => {
    const currentScene = getCurrentScene()
    
    const newEntry: Omit<WikiEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      title: candidate.text,
      slug: candidate.text.toLowerCase().replace(/\s+/g, '-'),
      content: {
        markdown: `## 概要\n${candidate.text}について。\n\n*この項目は自動生成されました。詳細を追加してください。*\n\n### 初出\n${candidate.context}`,
        summary: `${candidate.text}に関する項目（自動生成）`
      },
      tags: candidate.suggestedTags,
      category: candidate.category,
      metadata: {
        readCount: 0,
        importance: Math.floor(candidate.confidence * 100),
        spoilerLevel: 0,
        firstMentionScene: currentScene?.id,
        lastUpdateScene: currentScene?.id,
        extractionSource: [candidate.context]
      },
      relations: [],
      autoGenerated: true
    }

    addEntry(newEntry)
    
    // 受け入れた候補を削除
    setSuggestions(prev => prev.filter(s => s.text !== candidate.text))
  }

  const handleRejectSuggestion = (candidate: EntityCandidate) => {
    setSuggestions(prev => prev.filter(s => s.text !== candidate.text))
  }

  const handleDismissAll = () => {
    setSuggestions([])
    setShowSuggestions(false)
  }

  if (!showSuggestions || suggestions.length === 0) {
    return null
  }

  return (
    <div className="auto-wiki-extractor">
      <div className="extractor-header">
        <span className="extractor-title">🤖 自動抽出されたエントリ候補</span>
        <button 
          className="extractor-dismiss"
          onClick={handleDismissAll}
          title="すべて非表示"
        >
          ×
        </button>
      </div>
      
      <div className="extractor-suggestions">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="suggestion-item">
            <div className="suggestion-header">
              <span className="suggestion-category">
                {suggestion.category === EntryCategory.CHARACTER && '👤'}
                {suggestion.category === EntryCategory.LOCATION && '🏛️'}
                {suggestion.category === EntryCategory.ITEM && '💎'}
                {suggestion.category === EntryCategory.ORGANIZATION && '🏢'}
              </span>
              <span className="suggestion-title">{suggestion.text}</span>
              <span className="suggestion-confidence">
                {Math.floor(suggestion.confidence * 100)}%
              </span>
            </div>
            
            <div className="suggestion-context">
              "{suggestion.context}"
            </div>
            
            <div className="suggestion-tags">
              {suggestion.suggestedTags.map(tag => (
                <span key={tag} className="suggestion-tag">#{tag}</span>
              ))}
            </div>
            
            <div className="suggestion-actions">
              <button 
                className="suggestion-accept"
                onClick={() => handleAcceptSuggestion(suggestion)}
              >
                ✓ 追加
              </button>
              <button 
                className="suggestion-reject"
                onClick={() => handleRejectSuggestion(suggestion)}
              >
                × 拒否
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
