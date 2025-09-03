import React, { useState, useEffect } from 'react'
import { useWikiStore, WikiEntry, EntryCategory, RelationType } from '../store/useWikiStore'

interface RelatedEntriesGeneratorProps {
  targetEntry: WikiEntry
  isOpen: boolean
  onClose: () => void
}

interface RelationSuggestion {
  entry: WikiEntry
  relationType: RelationType
  strength: number
  confidence: number
  reason: string
}

export const RelatedEntriesGenerator: React.FC<RelatedEntriesGeneratorProps> = ({
  targetEntry,
  isOpen,
  onClose
}) => {
  const { entries, updateEntry } = useWikiStore()
  const [suggestions, setSuggestions] = useState<RelationSuggestion[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)

  // 関連項目の自動生成
  const generateRelatedEntries = () => {
    setIsGenerating(true)
    
    const newSuggestions: RelationSuggestion[] = []
    const existingRelationIds = new Set(targetEntry.relations.map(r => r.targetId))
    
    entries.forEach(entry => {
      if (entry.id === targetEntry.id || existingRelationIds.has(entry.id)) {
        return
      }
      
      const suggestion = analyzeRelationship(targetEntry, entry)
      if (suggestion && suggestion.confidence > 0.3) {
        newSuggestions.push(suggestion)
      }
    })
    
    // 信頼度でソート
    newSuggestions.sort((a, b) => b.confidence - a.confidence)
    setSuggestions(newSuggestions.slice(0, 10)) // 上位10件
    setIsGenerating(false)
  }

  // 2つのエントリ間の関係を分析
  const analyzeRelationship = (entry1: WikiEntry, entry2: WikiEntry): RelationSuggestion | null => {
    let confidence = 0
    let relationType = RelationType.RELATED_TO
    let strength = 1
    let reason = ''

    // タグベースの関連性
    const commonTags = entry1.tags.filter(tag => entry2.tags.includes(tag))
    if (commonTags.length > 0) {
      confidence += commonTags.length * 0.2
      reason += `共通タグ: ${commonTags.join(', ')}. `
    }

    // カテゴリベースの関連性
    if (entry1.category === entry2.category) {
      confidence += 0.15
      reason += `同じカテゴリ (${entry1.category}). `
    }

    // 特定のカテゴリ組み合わせによる関連性
    const categoryRelation = getCategoryRelation(entry1.category, entry2.category)
    if (categoryRelation) {
      confidence += categoryRelation.confidence
      relationType = categoryRelation.relationType
      strength = categoryRelation.strength
      reason += categoryRelation.reason + '. '
    }

    // テキスト内容での言及チェック
    const textMention = checkTextMention(entry1, entry2)
    if (textMention.mentioned) {
      confidence += textMention.confidence
      reason += textMention.reason + '. '
    }

    // 同じシーンでの言及
    if (entry1.metadata.firstMentionScene && 
        entry1.metadata.firstMentionScene === entry2.metadata.firstMentionScene) {
      confidence += 0.25
      reason += '同じシーンで初登場. '
    }

    // 重要度による調整
    const importanceBonus = Math.min(entry1.metadata.importance, entry2.metadata.importance) * 0.05
    confidence += importanceBonus

    if (confidence < 0.3) {
      return null
    }

    return {
      entry: entry2,
      relationType,
      strength: Math.min(5, Math.max(1, Math.round(strength))),
      confidence: Math.min(1, confidence),
      reason: reason.trim()
    }
  }

  // カテゴリ間の関係性を判定
  const getCategoryRelation = (cat1: EntryCategory, cat2: EntryCategory) => {
    const relations: Record<string, { relationType: RelationType, confidence: number, strength: number, reason: string }> = {
      [`${EntryCategory.CHARACTER}-${EntryCategory.LOCATION}`]: {
        relationType: RelationType.LOCATED_IN,
        confidence: 0.2,
        strength: 2,
        reason: 'キャラクターと場所の関連'
      },
      [`${EntryCategory.CHARACTER}-${EntryCategory.ORGANIZATION}`]: {
        relationType: RelationType.BELONGS_TO,
        confidence: 0.25,
        strength: 3,
        reason: 'キャラクターと組織の関連'
      },
      [`${EntryCategory.CHARACTER}-${EntryCategory.ITEM}`]: {
        relationType: RelationType.RELATED_TO,
        confidence: 0.15,
        strength: 2,
        reason: 'キャラクターとアイテムの関連'
      },
      [`${EntryCategory.ITEM}-${EntryCategory.LOCATION}`]: {
        relationType: RelationType.LOCATED_IN,
        confidence: 0.2,
        strength: 2,
        reason: 'アイテムと場所の関連'
      },
      [`${EntryCategory.EVENT}-${EntryCategory.CHARACTER}`]: {
        relationType: RelationType.APPEARS_WITH,
        confidence: 0.3,
        strength: 3,
        reason: 'イベントとキャラクターの関連'
      },
      [`${EntryCategory.EVENT}-${EntryCategory.LOCATION}`]: {
        relationType: RelationType.LOCATED_IN,
        confidence: 0.25,
        strength: 3,
        reason: 'イベントと場所の関連'
      }
    }

    return relations[`${cat1}-${cat2}`] || relations[`${cat2}-${cat1}`] || null
  }

  // テキスト内での言及をチェック
  const checkTextMention = (entry1: WikiEntry, entry2: WikiEntry) => {
    const text1 = `${entry1.title} ${entry1.content.markdown} ${entry1.content.summary}`.toLowerCase()
    const text2 = `${entry2.title} ${entry2.content.markdown} ${entry2.content.summary}`.toLowerCase()
    
    const title1Lower = entry1.title.toLowerCase()
    const title2Lower = entry2.title.toLowerCase()
    
    let confidence = 0
    let reason = ''
    
    if (text1.includes(title2Lower)) {
      confidence += 0.3
      reason += `「${entry1.title}」が「${entry2.title}」に言及`
    }
    
    if (text2.includes(title1Lower)) {
      confidence += 0.3
      reason += `「${entry2.title}」が「${entry1.title}」に言及`
    }
    
    return {
      mentioned: confidence > 0,
      confidence,
      reason
    }
  }

  // 提案を適用
  const applySuggestions = () => {
    const newRelations = suggestions
      .filter(suggestion => selectedSuggestions.has(suggestion.entry.id))
      .map(suggestion => ({
        targetId: suggestion.entry.id,
        relationType: suggestion.relationType,
        strength: suggestion.strength,
        description: suggestion.reason,
        bidirectional: true
      }))

    const updatedEntry = {
      ...targetEntry,
      relations: [...targetEntry.relations, ...newRelations],
      updatedAt: new Date()
    }

    updateEntry(targetEntry.id, updatedEntry)

    // 双方向関係の場合、相手側にも関係を追加
    newRelations.forEach(relation => {
      if (relation.bidirectional) {
        const targetEntryToUpdate = entries.find(e => e.id === relation.targetId)
        if (targetEntryToUpdate) {
          const reverseRelation = {
            targetId: targetEntry.id,
            relationType: relation.relationType,
            strength: relation.strength,
            description: `${targetEntry.title}との関連`,
            bidirectional: true
          }
          
          const updatedTargetEntry = {
            ...targetEntryToUpdate,
            relations: [...targetEntryToUpdate.relations, reverseRelation],
            updatedAt: new Date()
          }
          
          updateEntry(targetEntryToUpdate.id, updatedTargetEntry)
        }
      }
    })

    onClose()
  }

  // 提案の選択/選択解除
  const toggleSuggestion = (entryId: string) => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId)
    } else {
      newSelected.add(entryId)
    }
    setSelectedSuggestions(newSelected)
  }

  // 全選択/全解除
  const toggleAllSuggestions = () => {
    if (selectedSuggestions.size === suggestions.length) {
      setSelectedSuggestions(new Set())
    } else {
      setSelectedSuggestions(new Set(suggestions.map(s => s.entry.id)))
    }
  }

  // 信頼度に基づく色を取得
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4CAF50' // 緑
    if (confidence >= 0.6) return '#FF9800' // オレンジ
    if (confidence >= 0.4) return '#2196F3' // 青
    return '#9E9E9E' // グレー
  }

  // 関係タイプの日本語表示
  const getRelationTypeLabel = (relationType: RelationType) => {
    const labels: Record<RelationType, string> = {
      [RelationType.APPEARS_WITH]: '共演',
      [RelationType.LOCATED_IN]: '所在',
      [RelationType.BELONGS_TO]: '所属',
      [RelationType.RELATED_TO]: '関連',
      [RelationType.CAUSED_BY]: '原因',
      [RelationType.PART_OF]: '一部',
      [RelationType.SIMILAR_TO]: '類似',
      [RelationType.OPPOSITE_TO]: '対立'
    }
    return labels[relationType] || '関連'
  }

  useEffect(() => {
    if (isOpen && targetEntry) {
      generateRelatedEntries()
    }
  }, [isOpen, targetEntry])

  if (!isOpen) return null

  return (
    <div className="related-entries-generator-overlay">
      <div className="related-entries-generator-modal">
        <div className="related-entries-generator-header">
          <h3>「{targetEntry.title}」の関連項目自動生成</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="related-entries-generator-content">
          {isGenerating ? (
            <div className="generating-indicator">
              <div className="spinner"></div>
              <p>関連項目を分析中...</p>
            </div>
          ) : (
            <>
              <div className="suggestions-header">
                <div className="suggestions-info">
                  <span>{suggestions.length}件の関連項目候補が見つかりました</span>
                  {suggestions.length > 0 && (
                    <button 
                      className="toggle-all-btn"
                      onClick={toggleAllSuggestions}
                    >
                      {selectedSuggestions.size === suggestions.length ? '全解除' : '全選択'}
                    </button>
                  )}
                </div>
              </div>

              <div className="suggestions-list">
                {suggestions.length === 0 ? (
                  <div className="no-suggestions">
                    <p>関連項目の候補が見つかりませんでした。</p>
                    <p>他のエントリとの共通タグや内容の関連性を高めることで、より良い提案が得られます。</p>
                  </div>
                ) : (
                  suggestions.map(suggestion => (
                    <div 
                      key={suggestion.entry.id}
                      className={`suggestion-item ${selectedSuggestions.has(suggestion.entry.id) ? 'selected' : ''}`}
                      onClick={() => toggleSuggestion(suggestion.entry.id)}
                    >
                      <div className="suggestion-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedSuggestions.has(suggestion.entry.id)}
                          onChange={() => toggleSuggestion(suggestion.entry.id)}
                        />
                      </div>
                      
                      <div className="suggestion-content">
                        <div className="suggestion-title">
                          <span className="entry-title">{suggestion.entry.title}</span>
                          <span className="entry-category">({suggestion.entry.category})</span>
                        </div>
                        
                        <div className="suggestion-relation">
                          <span className="relation-type">
                            {getRelationTypeLabel(suggestion.relationType)}
                          </span>
                          <span className="relation-strength">
                            強度: {suggestion.strength}
                          </span>
                          <span 
                            className="confidence-badge"
                            style={{ backgroundColor: getConfidenceColor(suggestion.confidence) }}
                          >
                            信頼度: {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                        
                        <div className="suggestion-reason">
                          {suggestion.reason}
                        </div>
                        
                        <div className="suggestion-summary">
                          {suggestion.entry.content.summary}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="related-entries-generator-footer">
          <button className="cancel-btn" onClick={onClose}>キャンセル</button>
          <button 
            className="apply-btn"
            onClick={applySuggestions}
            disabled={selectedSuggestions.size === 0 || isGenerating}
          >
            {selectedSuggestions.size}件の関連項目を追加
          </button>
        </div>
      </div>
    </div>
  )
}
