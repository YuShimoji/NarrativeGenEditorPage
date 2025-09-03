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

  // 高度なNLP分析パターン
  const extractEntities = (text: string): EntityCandidate[] => {
    const candidates: EntityCandidate[] = []
    
    // 1. 人名パターン（複数のパターンを組み合わせ）
    const extractCharacters = () => {
      // 基本的な姓名パターン
      const namePatterns = [
        /([一-龯]{1,4})[・\s]*([一-龯]{1,4})/g,
        /([ァ-ヶー]{2,8})/g, // カタカナ名
        /([A-Za-z]{2,15})/g, // 英語名
        /([一-龯]{1,3})(君|さん|様|殿|ちゃん)/g // 敬称付き
      ]
      
      namePatterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(text)) !== null) {
          let name = match[1] || match[0]
          if (match[2] && !['君', 'さん', '様', '殿', 'ちゃん'].includes(match[2])) {
            name = match[0].replace(/[・\s]/g, '')
          }
          
          // 名前の妥当性チェック
          if (isValidCharacterName(name)) {
            const confidence = calculateNameConfidence(name, text, match.index)
            candidates.push({
              text: name,
              category: EntryCategory.CHARACTER,
              confidence,
              context: getContext(text, match.index, match[0].length),
              suggestedTags: getCharacterTags(name, text)
            })
          }
        }
      })
    }

    // 2. 場所名パターン（より詳細な分析）
    const extractLocations = () => {
      const locationPatterns = [
        /([一-龯]{2,8})(で|に|の|から|へ|まで|にて)/g, // 基本助詞
        /([一-龯]{2,8})(城|町|村|市|県|国|島|山|川|湖|海|森|谷|峠)/g, // 地形・行政区分
        /([一-龯]{2,8})(学校|学院|病院|駅|空港|港|神社|寺|教会)/g, // 施設
        /([一-龯]{2,8})(通り|街|地区|区域|エリア)/g // 都市部
      ]
      
      locationPatterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(text)) !== null) {
          const location = match[0]
          if (isValidLocation(location) && !candidates.some(c => c.text === location)) {
            const confidence = calculateLocationConfidence(location, text, match.index)
            candidates.push({
              text: location,
              category: EntryCategory.LOCATION,
              confidence,
              context: getContext(text, match.index, match[0].length),
              suggestedTags: getLocationTags(location)
            })
          }
        }
      })
    }

    // 3. アイテム・道具パターン（コンテキスト分析強化）
    const extractItems = () => {
      const itemPatterns = [
        /([一-龯]{2,8})(を|が)(持つ|使う|振る|投げる|取る|拾う)/g, // 動作パターン
        /([一-龯]{2,8})(剣|刀|槍|弓|杖|盾|鎧|兜)/g, // 武器・防具
        /([一-龯]{2,8})(薬|石|玉|書|巻物|地図|鍵)/g, // アイテム接尾辞
        /(魔法の|聖なる|古い|伝説の|呪われた)([一-龯]{2,8})/g // 形容詞付き
      ]
      
      itemPatterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(text)) !== null) {
          const item = match[2] || match[1]
          if (isValidItem(item) && !candidates.some(c => c.text === item)) {
            const confidence = calculateItemConfidence(item, text, match.index)
            candidates.push({
              text: item,
              category: EntryCategory.ITEM,
              confidence,
              context: getContext(text, match.index, match[0].length),
              suggestedTags: getItemTags(item, match[0])
            })
          }
        }
      })
    }

    // 4. 組織・団体パターン（詳細分類）
    const extractOrganizations = () => {
      const orgPatterns = [
        /([一-龯]{2,8})(学院|学校|大学|研究所)/g, // 教育機関
        /([一-龯]{2,8})(会社|商会|組合|ギルド)/g, // 商業組織
        /([一-龯]{2,8})(騎士団|軍|部隊|隊)/g, // 軍事組織
        /([一-龯]{2,8})(教会|神殿|寺院|修道院)/g, // 宗教組織
        /([一-龯]{2,8})(王国|帝国|公国|領)/g // 政治組織
      ]
      
      orgPatterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(text)) !== null) {
          const org = match[0]
          if (!candidates.some(c => c.text === org)) {
            const confidence = calculateOrgConfidence(org, text, match.index)
            candidates.push({
              text: org,
              category: EntryCategory.ORGANIZATION,
              confidence,
              context: getContext(text, match.index, match[0].length),
              suggestedTags: getOrgTags(org)
            })
          }
        }
      })
    }
    
    // 全パターンを実行
    extractCharacters()
    extractLocations()
    extractItems()
    extractOrganizations()

    // 重複除去と信頼度でソート
    return candidates
      .filter(candidate => 
        !entries.some(entry => 
          entry.title.toLowerCase() === candidate.text.toLowerCase()
        )
      )
      .filter((candidate, index, self) => 
        self.findIndex(c => c.text === candidate.text) === index
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10) // 上位10件のみ
  }
  
  // ヘルパー関数群
  const isValidCharacterName = (name: string): boolean => {
    const invalidNames = ['こと', 'もの', '時間', '場所', '人間', '自分', '相手', '彼女', '彼ら', 'あなた', 'わたし']
    return name.length >= 2 && name.length <= 8 && !invalidNames.includes(name)
  }
  
  const isValidLocation = (location: string): boolean => {
    return location.length >= 2 && location.length <= 12
  }
  
  const isValidItem = (item: string): boolean => {
    const commonWords = ['こと', 'もの', '時間', '場所', '人間', '自分', '相手', '気持ち', '心配', '問題']
    return item.length >= 2 && item.length <= 10 && !commonWords.includes(item)
  }
  
  const getContext = (text: string, index: number, length: number): string => {
    return text.substring(Math.max(0, index - 25), index + length + 25)
  }
  
  const calculateNameConfidence = (name: string, text: string, index: number): number => {
    let confidence = 0.6
    
    // 敬称が付いている場合は信頼度アップ
    if (/[君さん様殿ちゃん]/.test(text.substring(index, index + name.length + 3))) {
      confidence += 0.2
    }
    
    // 動詞と組み合わせがある場合
    if (/[は言った|は答えた|は笑った|は走った]/.test(text.substring(index + name.length, index + name.length + 10))) {
      confidence += 0.15
    }
    
    return Math.min(confidence, 0.95)
  }
  
  const calculateLocationConfidence = (location: string, text: string, index: number): number => {
    let confidence = 0.5
    
    // 地形・施設接尾辞がある場合
    if (/[城町村市県国島山川湖海森谷峠学校病院駅]$/.test(location)) {
      confidence += 0.3
    }
    
    // 移動動詞と組み合わせ
    if (/[行く|向かう|到着|出発]/.test(text.substring(index + location.length, index + location.length + 15))) {
      confidence += 0.2
    }
    
    return Math.min(confidence, 0.9)
  }
  
  const calculateItemConfidence = (item: string, text: string, index: number): number => {
    let confidence = 0.4
    
    // 武器・道具接尾辞
    if (/[剣刀槍弓杖盾鎧兜薬石玉書鍵]$/.test(item)) {
      confidence += 0.3
    }
    
    // 形容詞が付いている場合
    if (/[魔法の|聖なる|古い|伝説の|呪われた]/.test(text.substring(Math.max(0, index - 10), index))) {
      confidence += 0.25
    }
    
    return Math.min(confidence, 0.85)
  }
  
  const calculateOrgConfidence = (org: string, text: string, index: number): number => {
    return 0.75 // 組織名は接尾辞で判定するため高信頼度
  }
  
  const getCharacterTags = (name: string, text: string): string[] => {
    const tags = ['character', 'person']
    
    if (/[王女王子姫様]/.test(name)) tags.push('royalty')
    if (/[騎士]/.test(name)) tags.push('knight')
    if (/[魔法使い|魔術師|賢者]/.test(text)) tags.push('magic-user')
    
    return tags
  }
  
  const getLocationTags = (location: string): string[] => {
    const tags = ['location', 'place']
    
    if (/[城]$/.test(location)) tags.push('castle')
    if (/[町村市]$/.test(location)) tags.push('settlement')
    if (/[山川湖海森]$/.test(location)) tags.push('natural')
    if (/[学校病院駅]$/.test(location)) tags.push('facility')
    
    return tags
  }
  
  const getItemTags = (item: string, fullMatch: string): string[] => {
    const tags = ['item', 'object']
    
    if (/[剣刀槍弓]$/.test(item)) tags.push('weapon')
    if (/[盾鎧兜]$/.test(item)) tags.push('armor')
    if (/[薬]$/.test(item)) tags.push('consumable')
    if (/[魔法の|聖なる|伝説の]/.test(fullMatch)) tags.push('magical')
    
    return tags
  }
  
  const getOrgTags = (org: string): string[] => {
    const tags = ['organization']
    
    if (/[学院学校大学]$/.test(org)) tags.push('education')
    if (/[騎士団軍部隊隊]$/.test(org)) tags.push('military')
    if (/[教会神殿寺院]$/.test(org)) tags.push('religious')
    if (/[王国帝国公国]$/.test(org)) tags.push('political')
    
    return tags
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
