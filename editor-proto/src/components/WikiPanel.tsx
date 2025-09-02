import React, { useState, useMemo } from 'react'
import { useWikiStore, WikiEntry, EntryCategory } from '../store/useWikiStore'

interface WikiPanelProps {
  selectedText?: string
  onEntrySelect?: (entry: WikiEntry) => void
}

export const WikiPanel: React.FC<WikiPanelProps> = ({ 
  selectedText, 
  onEntrySelect 
}) => {
  const { 
    entries, 
    searchTerm, 
    setSearchTerm, 
    selectedCategory, 
    setSelectedCategory,
    selectedEntry,
    setSelectedEntry,
    getRecentEntries,
    searchEntries 
  } = useWikiStore()

  const [showRelated, setShowRelated] = useState(true)

  // 検索結果の計算
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return selectedCategory === 'all' 
        ? entries 
        : entries.filter(entry => entry.category === selectedCategory)
    }
    return searchEntries(searchTerm)
  }, [entries, searchTerm, selectedCategory, searchEntries])

  // 選択されたテキストに関連するエントリを検索
  const textRelatedEntries = useMemo(() => {
    if (!selectedText || selectedText.length < 2) return []
    
    return entries.filter(entry => 
      entry.title.includes(selectedText) ||
      entry.content.markdown.includes(selectedText) ||
      entry.tags.some(tag => selectedText.includes(tag))
    ).slice(0, 5)
  }, [selectedText, entries])

  // 選択されたエントリの関連項目
  const relatedEntries = useMemo(() => {
    if (!selectedEntry) return []
    
    const related = new Set<WikiEntry>()
    
    // タグベースの関連項目
    selectedEntry.tags.forEach(tag => {
      entries.forEach(entry => {
        if (entry.id !== selectedEntry.id && entry.tags.includes(tag)) {
          related.add(entry)
        }
      })
    })
    
    // カテゴリベースの関連項目
    entries.forEach(entry => {
      if (entry.id !== selectedEntry.id && 
          entry.category === selectedEntry.category) {
        related.add(entry)
      }
    })
    
    // 直接関連設定されている項目
    selectedEntry.relations.forEach(relation => {
      const relatedEntry = entries.find(e => e.id === relation.targetId)
      if (relatedEntry) {
        related.add(relatedEntry)
      }
    })
    
    return Array.from(related).slice(0, 8)
  }, [selectedEntry, entries])

  const handleEntryClick = (entry: WikiEntry) => {
    setSelectedEntry(entry)
    onEntrySelect?.(entry)
  }

  const getCategoryIcon = (category: EntryCategory) => {
    switch (category) {
      case EntryCategory.CHARACTER: return '👤'
      case EntryCategory.LOCATION: return '🏛️'
      case EntryCategory.ITEM: return '💎'
      case EntryCategory.ORGANIZATION: return '🏢'
      case EntryCategory.EVENT: return '⚡'
      case EntryCategory.CONCEPT: return '💭'
      default: return '📄'
    }
  }

  const recentEntries = getRecentEntries(5)

  return (
    <div className="wiki-panel">
      {/* 検索セクション */}
      <div className="wiki-search">
        <input
          type="text"
          placeholder="Wikiを検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="wiki-search-input"
        />
      </div>

      {/* カテゴリフィルター */}
      <div className="wiki-categories">
        <select
          value={selectedCategory || 'all'}
          onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : e.target.value as EntryCategory)}
          className="wiki-category-select"
        >
          <option value="all">すべて</option>
          <option value={EntryCategory.CHARACTER}>👤 キャラクター</option>
          <option value={EntryCategory.LOCATION}>🏛️ 場所</option>
          <option value={EntryCategory.ITEM}>💎 アイテム</option>
          <option value={EntryCategory.ORGANIZATION}>🏢 組織</option>
          <option value={EntryCategory.EVENT}>⚡ イベント</option>
          <option value={EntryCategory.CONCEPT}>💭 概念</option>
        </select>
      </div>

      {/* 選択されたテキストに関連するエントリ */}
      {selectedText && textRelatedEntries.length > 0 && (
        <div className="wiki-section">
          <div className="wiki-section-header">
            <span className="wiki-section-title">🔍 "{selectedText}" 関連</span>
          </div>
          <div className="wiki-entries">
            {textRelatedEntries.map(entry => (
              <div
                key={entry.id}
                className="wiki-entry-item"
                onClick={() => handleEntryClick(entry)}
              >
                <span className="wiki-entry-icon">
                  {getCategoryIcon(entry.category)}
                </span>
                <div className="wiki-entry-content">
                  <div className="wiki-entry-title">{entry.title}</div>
                  <div className="wiki-entry-summary">{entry.content.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 検索結果またはエントリ一覧 */}
      <div className="wiki-section">
        <div className="wiki-section-header">
          <span className="wiki-section-title">
            {searchTerm ? `🔍 検索結果 (${searchResults.length})` : '📚 エントリ一覧'}
          </span>
        </div>
        <div className="wiki-entries">
          {searchResults.length === 0 ? (
            <div className="wiki-empty">
              {searchTerm ? '検索結果がありません' : 'エントリがありません'}
            </div>
          ) : (
            searchResults.map(entry => (
              <div
                key={entry.id}
                className={`wiki-entry-item ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                onClick={() => handleEntryClick(entry)}
              >
                <span className="wiki-entry-icon">
                  {getCategoryIcon(entry.category)}
                  {entry.autoGenerated && <span className="auto-generated-badge">🤖</span>}
                </span>
                <div className="wiki-entry-content">
                  <div className="wiki-entry-title">{entry.title}</div>
                  <div className="wiki-entry-summary">{entry.content.summary}</div>
                  <div className="wiki-entry-tags">
                    {entry.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="wiki-tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 関連項目セクション */}
      {selectedEntry && showRelated && relatedEntries.length > 0 && (
        <div className="wiki-section">
          <div className="wiki-section-header">
            <span className="wiki-section-title">🔗 関連項目</span>
            <button 
              className="wiki-section-toggle"
              onClick={() => setShowRelated(!showRelated)}
            >
              {showRelated ? '▼' : '▶'}
            </button>
          </div>
          <div className="wiki-entries">
            {relatedEntries.map(entry => (
              <div
                key={entry.id}
                className="wiki-entry-item related"
                onClick={() => handleEntryClick(entry)}
              >
                <span className="wiki-entry-icon">
                  {getCategoryIcon(entry.category)}
                </span>
                <div className="wiki-entry-content">
                  <div className="wiki-entry-title">{entry.title}</div>
                  <div className="wiki-entry-summary">{entry.content.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 最近のエントリ */}
      {!searchTerm && recentEntries.length > 0 && (
        <div className="wiki-section">
          <div className="wiki-section-header">
            <span className="wiki-section-title">🕒 最近のエントリ</span>
          </div>
          <div className="wiki-entries">
            {recentEntries.map(entry => (
              <div
                key={entry.id}
                className="wiki-entry-item recent"
                onClick={() => handleEntryClick(entry)}
              >
                <span className="wiki-entry-icon">
                  {getCategoryIcon(entry.category)}
                </span>
                <div className="wiki-entry-content">
                  <div className="wiki-entry-title">{entry.title}</div>
                  <div className="wiki-entry-summary">{entry.content.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 選択されたエントリの詳細 */}
      {selectedEntry && (
        <div className="wiki-section">
          <div className="wiki-section-header">
            <span className="wiki-section-title">📖 {selectedEntry.title}</span>
          </div>
          <div className="wiki-entry-detail">
            <div className="wiki-entry-meta">
              <span className="wiki-entry-category">
                {getCategoryIcon(selectedEntry.category)} {selectedEntry.category}
              </span>
              {selectedEntry.metadata.importance > 0 && (
                <span className="wiki-entry-importance">
                  重要度: {selectedEntry.metadata.importance}%
                </span>
              )}
            </div>
            <div className="wiki-entry-content-preview">
              {selectedEntry.content.summary}
            </div>
            <div className="wiki-entry-tags">
              {selectedEntry.tags.map(tag => (
                <span key={tag} className="wiki-tag">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
