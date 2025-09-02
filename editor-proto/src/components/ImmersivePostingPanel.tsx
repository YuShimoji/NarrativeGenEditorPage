import React, { useState, useMemo } from 'react'
import { useWikiStore, WikiEntry, EntryCategory } from '../store/useWikiStore'
import { useSceneStore } from '../store/useSceneStore'

interface ImmersivePost {
  id: string
  type: 'character_writing' | 'rumor' | 'quote' | 'diary' | 'letter' | 'news'
  author: string
  authorId?: string
  title: string
  content: string
  tone: 'formal' | 'casual' | 'mysterious' | 'humorous' | 'dramatic' | 'poetic'
  timestamp: Date
  relatedEntries: string[]
  tags: string[]
  sceneId?: string
}

interface ImmersivePostingPanelProps {
  onPostCreate?: (post: ImmersivePost) => void
}

export const ImmersivePostingPanel: React.FC<ImmersivePostingPanelProps> = ({ 
  onPostCreate 
}) => {
  const { entries } = useWikiStore()
  const { getCurrentScene } = useSceneStore()
  
  const [isCreating, setIsCreating] = useState(false)
  const [postType, setPostType] = useState<ImmersivePost['type']>('character_writing')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postTone, setPostTone] = useState<ImmersivePost['tone']>('casual')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [relatedEntries, setRelatedEntries] = useState<string[]>([])

  // キャラクターエントリのみを取得
  const characterEntries = useMemo(() => 
    entries.filter(entry => entry.category === EntryCategory.CHARACTER),
    [entries]
  )

  // 投稿タイプの設定
  const postTypeConfig = {
    character_writing: {
      icon: '✍️',
      label: 'キャラクター執筆',
      placeholder: 'キャラクターの視点で物語や日記を書く...',
      titlePlaceholder: 'タイトル（例：私の冒険日記）'
    },
    rumor: {
      icon: '🗣️',
      label: 'ルーモア・噂話',
      placeholder: '街で囁かれている噂や情報を書く...',
      titlePlaceholder: 'タイトル（例：王宮の秘密）'
    },
    quote: {
      icon: '💬',
      label: '名言・セリフ',
      placeholder: 'キャラクターの印象的な言葉や名言...',
      titlePlaceholder: 'タイトル（例：賢者の言葉）'
    },
    diary: {
      icon: '📔',
      label: '日記・手記',
      placeholder: 'キャラクターの個人的な記録や感想...',
      titlePlaceholder: 'タイトル（例：冒険の記録）'
    },
    letter: {
      icon: '✉️',
      label: '手紙・書簡',
      placeholder: 'キャラクター間の手紙や公式文書...',
      titlePlaceholder: 'タイトル（例：故郷への手紙）'
    },
    news: {
      icon: '📰',
      label: 'ニュース・告知',
      placeholder: '世界の出来事や重要な発表...',
      titlePlaceholder: 'タイトル（例：王国からの重要なお知らせ）'
    }
  }

  // トーンの設定
  const toneConfig = {
    formal: { label: '丁寧・正式', icon: '🎩' },
    casual: { label: 'カジュアル', icon: '😊' },
    mysterious: { label: '神秘的', icon: '🌙' },
    humorous: { label: 'ユーモラス', icon: '😄' },
    dramatic: { label: 'ドラマチック', icon: '🎭' },
    poetic: { label: '詩的', icon: '🌸' }
  }

  const handleCreatePost = () => {
    if (!postTitle.trim() || !postContent.trim()) return

    const newPost: ImmersivePost = {
      id: `post_${Date.now()}`,
      type: postType,
      author: selectedAuthor || '匿名',
      authorId: characterEntries.find(e => e.title === selectedAuthor)?.id,
      title: postTitle.trim(),
      content: postContent.trim(),
      tone: postTone,
      timestamp: new Date(),
      relatedEntries,
      tags: selectedTags,
      sceneId: getCurrentScene()?.id
    }

    onPostCreate?.(newPost)
    
    // フォームをリセット
    setPostTitle('')
    setPostContent('')
    setSelectedTags([])
    setRelatedEntries([])
    setIsCreating(false)
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleEntryToggle = (entryId: string) => {
    setRelatedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    )
  }

  // 自動生成されたコンテンツの提案
  const generateContentSuggestion = () => {
    const config = postTypeConfig[postType]
    const author = selectedAuthor || 'キャラクター'
    
    const suggestions = {
      character_writing: [
        `今日は${author}として新たな冒険を始めた。`,
        `${author}の心境を綴った個人的な記録。`,
        `${author}が体験した出来事についての考察。`
      ],
      rumor: [
        `街角で聞いた興味深い話によると...`,
        `最近、${author}について奇妙な噂が流れている。`,
        `信頼できる情報筋からの話では...`
      ],
      quote: [
        `「${author}が言った忘れられない言葉」`,
        `「人生で最も大切なのは...」- ${author}`,
        `${author}の哲学を表す印象的な一言。`
      ],
      diary: [
        `${author}の日記より：今日の出来事について`,
        `個人的な記録として残しておきたいこと`,
        `${author}の心の内を綴った日記の一ページ`
      ],
      letter: [
        `親愛なる友へ、${author}より`,
        `${author}からの重要な手紙`,
        `${author}が心を込めて書いた書簡`
      ],
      news: [
        `【速報】${author}に関する重要な発表`,
        `王国からの公式発表：${author}について`,
        `世界に影響を与える重要なニュース`
      ]
    }

    const typeSuggestions = suggestions[postType] || suggestions.character_writing
    const randomSuggestion = typeSuggestions[Math.floor(Math.random() * typeSuggestions.length)]
    setPostContent(randomSuggestion)
  }

  if (!isCreating) {
    return (
      <div className="immersive-posting-panel">
        <div className="posting-header">
          <h3>📝 没入感投稿</h3>
          <button 
            className="create-post-btn"
            onClick={() => setIsCreating(true)}
          >
            + 新規投稿
          </button>
        </div>
        
        <div className="posting-types">
          {Object.entries(postTypeConfig).map(([type, config]) => (
            <div key={type} className="posting-type-card">
              <span className="posting-type-icon">{config.icon}</span>
              <span className="posting-type-label">{config.label}</span>
            </div>
          ))}
        </div>
        
        <div className="posting-tips">
          <h4>💡 投稿のコツ</h4>
          <ul>
            <li>キャラクターの視点で書くことで物語に深みが生まれます</li>
            <li>ルーモアは世界観の拡張に効果的です</li>
            <li>適切なトーンを選ぶことで雰囲気が向上します</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="immersive-posting-panel creating">
      <div className="posting-header">
        <h3>📝 新規投稿作成</h3>
        <button 
          className="cancel-btn"
          onClick={() => setIsCreating(false)}
        >
          ×
        </button>
      </div>

      {/* 投稿タイプ選択 */}
      <div className="form-group">
        <label>投稿タイプ</label>
        <div className="post-type-selector">
          {Object.entries(postTypeConfig).map(([type, config]) => (
            <button
              key={type}
              className={`post-type-option ${postType === type ? 'selected' : ''}`}
              onClick={() => setPostType(type as ImmersivePost['type'])}
            >
              <span className="post-type-icon">{config.icon}</span>
              <span className="post-type-label">{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 著者選択 */}
      <div className="form-group">
        <label>著者</label>
        <select
          value={selectedAuthor}
          onChange={(e) => setSelectedAuthor(e.target.value)}
          className="author-select"
        >
          <option value="">匿名</option>
          {characterEntries.map(character => (
            <option key={character.id} value={character.title}>
              {character.title}
            </option>
          ))}
        </select>
      </div>

      {/* トーン選択 */}
      <div className="form-group">
        <label>トーン</label>
        <div className="tone-selector">
          {Object.entries(toneConfig).map(([tone, config]) => (
            <button
              key={tone}
              className={`tone-option ${postTone === tone ? 'selected' : ''}`}
              onClick={() => setPostTone(tone as ImmersivePost['tone'])}
            >
              <span className="tone-icon">{config.icon}</span>
              <span className="tone-label">{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* タイトル */}
      <div className="form-group">
        <label>タイトル</label>
        <input
          type="text"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          placeholder={postTypeConfig[postType].titlePlaceholder}
          className="post-title-input"
        />
      </div>

      {/* 内容 */}
      <div className="form-group">
        <label>
          内容
          <button 
            className="suggestion-btn"
            onClick={generateContentSuggestion}
            title="内容の提案を生成"
          >
            💡 提案
          </button>
        </label>
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder={postTypeConfig[postType].placeholder}
          className="post-content-textarea"
          rows={6}
        />
      </div>

      {/* 関連エントリ */}
      <div className="form-group">
        <label>関連エントリ</label>
        <div className="related-entries">
          {entries.slice(0, 8).map(entry => (
            <button
              key={entry.id}
              className={`related-entry ${relatedEntries.includes(entry.id) ? 'selected' : ''}`}
              onClick={() => handleEntryToggle(entry.id)}
            >
              {entry.title}
            </button>
          ))}
        </div>
      </div>

      {/* タグ */}
      <div className="form-group">
        <label>タグ</label>
        <div className="tag-input">
          <input
            type="text"
            placeholder="タグを入力してEnter"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handleTagToggle(e.currentTarget.value.trim())
                e.currentTarget.value = ''
              }
            }}
            className="tag-input-field"
          />
        </div>
        <div className="selected-tags">
          {selectedTags.map(tag => (
            <span key={tag} className="selected-tag">
              #{tag}
              <button onClick={() => handleTagToggle(tag)}>×</button>
            </span>
          ))}
        </div>
      </div>

      {/* アクション */}
      <div className="form-actions">
        <button 
          className="cancel-btn"
          onClick={() => setIsCreating(false)}
        >
          キャンセル
        </button>
        <button 
          className="create-btn"
          onClick={handleCreatePost}
          disabled={!postTitle.trim() || !postContent.trim()}
        >
          投稿作成
        </button>
      </div>
    </div>
  )
}
