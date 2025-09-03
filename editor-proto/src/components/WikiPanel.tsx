import React, { useState, useMemo } from 'react'
import { useWikiStore, WikiEntry, EntryCategory } from '../store/useWikiStore'

// Simple markdown parser for headings
const parseMarkdownHeadings = (markdown: string) => {
  const lines = markdown.split('\n')
  const headings: { level: number; text: string; id: string }[] = []
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '-')}`
      headings.push({ level, text, id })
    }
  })
  
  return headings
}

// Render markdown with heading anchors
const renderMarkdownWithHeadings = (markdown: string) => {
  const lines = markdown.split('\n')
  
  return lines.map((line, index) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2].trim()
      const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '-')}`
      const HeadingTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements
      
      return (
        <HeadingTag key={index} id={id} className={`wiki-heading wiki-heading-${level}`}>
          {text}
        </HeadingTag>
      )
    }
    
    if (line.trim()) {
      return <p key={index} className="wiki-paragraph">{line}</p>
    }
    
    return <br key={index} />
  })
}

interface WikiPanelProps {
  selectedText?: string
  onEntrySelect?: (entry: WikiEntry) => void
  onImmersivePostingOpen?: () => void
  onEntryEditOpen?: (entry?: WikiEntry) => void
}

export const WikiPanel: React.FC<WikiPanelProps> = ({ 
  selectedText, 
  onEntrySelect,
  onImmersivePostingOpen,
  onEntryEditOpen
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
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showTagFilter, setShowTagFilter] = useState(false)

  // 検索結果の計算
  const searchResults = useMemo(() => {
    let filtered = entries
    
    // カテゴリフィルター
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === selectedCategory)
    }
    
    // タグフィルター
    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry => 
        selectedTags.every(tag => entry.tags.includes(tag))
      )
    }
    
    // 検索フィルター
    if (searchTerm.trim()) {
      const lowerQuery = searchTerm.toLowerCase()
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(lowerQuery) ||
        entry.content.summary.toLowerCase().includes(lowerQuery) ||
        entry.content.markdown.toLowerCase().includes(lowerQuery) ||
        entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    }
    
    return filtered
  }, [entries, searchTerm, selectedCategory, selectedTags])

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
  
  // 全タグの取得
  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>()
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1]) // 使用頻度順
      .map(([tag]) => tag)
  }, [entries])
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <div className="wiki-panel">
      {/* ヘッダーセクション */}
      <div className="wiki-header">
        <div className="wiki-search">
          <input
            type="text"
            placeholder="Wikiを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wiki-search-input"
          />
        </div>
        <div className="wiki-actions">
          <button 
            className="wiki-action-btn entry-edit-btn"
            onClick={() => onEntryEditOpen?.()}
            title="新規エントリ作成"
          >
            ➕ 新規
          </button>
          <button 
            className="wiki-action-btn immersive-posting-btn"
            onClick={onImmersivePostingOpen}
            title="没入感投稿システム"
          >
            📝 投稿
          </button>
        </div>
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
      
      {/* タグフィルター */}
      <div className="wiki-tag-filter">
        <div className="wiki-tag-filter-header">
          <span className="wiki-tag-filter-title">🏷️ タグフィルター</span>
          <button 
            className="wiki-tag-filter-toggle"
            onClick={() => setShowTagFilter(!showTagFilter)}
          >
            {showTagFilter ? '▼' : '▶'}
          </button>
        </div>
        
        {showTagFilter && (
          <div className="wiki-tag-filter-content">
            <div className="wiki-tag-filter-selected">
              {selectedTags.length > 0 && (
                <div className="wiki-selected-tags">
                  {selectedTags.map(tag => (
                    <span 
                      key={tag} 
                      className="wiki-selected-tag"
                      onClick={() => handleTagToggle(tag)}
                    >
                      #{tag} ×
                    </span>
                  ))}
                  <button 
                    className="wiki-clear-tags"
                    onClick={() => setSelectedTags([])}
                  >
                    すべてクリア
                  </button>
                </div>
              )}
            </div>
            
            <div className="wiki-available-tags">
              {allTags.slice(0, 20).map(tag => (
                <span 
                  key={tag}
                  className={`wiki-available-tag ${
                    selectedTags.includes(tag) ? 'selected' : ''
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
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
                <button 
                  className="wiki-entry-edit-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEntryEditOpen?.(entry)
                  }}
                  title="編集"
                >
                  ✏️
                </button>
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
            
            {/* 画像ギャラリー */}
            {selectedEntry.content.gallery && selectedEntry.content.gallery.length > 0 && (
              <div className="wiki-gallery">
                <div className="wiki-gallery-header">
                  <span className="wiki-gallery-title">🖼️ 画像</span>
                </div>
                <div className="wiki-gallery-grid">
                  {selectedEntry.content.gallery.map(media => (
                    <div key={media.id} className="wiki-gallery-item">
                      <img 
                        src={media.url} 
                        alt={media.caption || selectedEntry.title}
                        className="wiki-gallery-image"
                        loading="lazy"
                      />
                      {media.caption && (
                        <div className="wiki-gallery-caption">{media.caption}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 見出し目次 */}
            {(() => {
              const headings = parseMarkdownHeadings(selectedEntry.content.markdown)
              return headings.length > 0 ? (
                <div className="wiki-toc">
                  <div className="wiki-toc-header">
                    <span className="wiki-toc-title">📋 目次</span>
                  </div>
                  <div className="wiki-toc-list">
                    {headings.map(heading => (
                      <a 
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`wiki-toc-item wiki-toc-level-${heading.level}`}
                        onClick={(e) => {
                          e.preventDefault()
                          const element = document.getElementById(heading.id)
                          element?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null
            })()}
            
            <div className="wiki-entry-content-preview">
              {selectedEntry.content.summary}
            </div>
            
            {/* 詳細コンテンツ */}
            <div className="wiki-entry-content-full">
              <div className="wiki-content-header">
                <span className="wiki-content-title">📖 詳細</span>
              </div>
              <div className="wiki-markdown-content">
                {renderMarkdownWithHeadings(selectedEntry.content.markdown)}
              </div>
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
