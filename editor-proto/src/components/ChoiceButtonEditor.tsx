import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'

interface ChoiceButtonEditorProps {
  editor: Editor | null
  isOpen: boolean
  onClose: () => void
  initialData?: {
    text: string
    style: string
    targetSceneId: string
    condition: string
    enabled: boolean
  }
}

export const ChoiceButtonEditor: React.FC<ChoiceButtonEditorProps> = ({
  editor,
  isOpen,
  onClose,
  initialData
}) => {
  const [text, setText] = useState(initialData?.text || '選択肢')
  const [style, setStyle] = useState(initialData?.style || 'normal')
  const [targetSceneId, setTargetSceneId] = useState(initialData?.targetSceneId || '')
  const [condition, setCondition] = useState(initialData?.condition || '')
  const [enabled, setEnabled] = useState(initialData?.enabled ?? true)

  useEffect(() => {
    if (initialData) {
      setText(initialData.text)
      setStyle(initialData.style)
      setTargetSceneId(initialData.targetSceneId)
      setCondition(initialData.condition)
      setEnabled(initialData.enabled)
    }
  }, [initialData])

  const handleInsert = () => {
    if (!editor) return

    editor.chain().focus().insertChoiceButton({
      text,
      style: style as 'normal' | 'important' | 'danger' | 'subtle',
      targetSceneId,
      condition,
      enabled
    }).run()

    onClose()
  }

  const handleQuickInsert = (quickStyle: string, quickText: string) => {
    if (!editor) return

    editor.chain().focus().insertChoiceButton({
      text: quickText,
      style: quickStyle as 'normal' | 'important' | 'danger' | 'subtle',
      targetSceneId: '',
      condition: '',
      enabled: true
    }).run()

    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="choice-editor-overlay">
      <div className="choice-editor">
        <div className="choice-editor-header">
          <h3>選択肢を追加</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="choice-editor-content">
          {/* クイック挿入ボタン */}
          <div className="quick-choices">
            <h4>クイック挿入</h4>
            <div className="quick-choice-buttons">
              <button 
                className="quick-choice normal"
                onClick={() => handleQuickInsert('normal', '続ける')}
              >
                続ける
              </button>
              <button 
                className="quick-choice important"
                onClick={() => handleQuickInsert('important', '重要な決断')}
              >
                重要な決断
              </button>
              <button 
                className="quick-choice danger"
                onClick={() => handleQuickInsert('danger', '危険な選択')}
              >
                危険な選択
              </button>
              <button 
                className="quick-choice subtle"
                onClick={() => handleQuickInsert('subtle', '控えめに行動')}
              >
                控えめに行動
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* カスタム設定 */}
          <div className="custom-choice">
            <h4>カスタム設定</h4>
            
            <div className="form-group">
              <label>選択肢テキスト</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="選択肢のテキストを入力"
              />
            </div>

            <div className="form-group">
              <label>スタイル</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="normal">通常</option>
                <option value="important">重要</option>
                <option value="danger">危険</option>
                <option value="subtle">控えめ</option>
              </select>
            </div>

            <div className="form-group">
              <label>対象シーンID（オプション）</label>
              <input
                type="text"
                value={targetSceneId}
                onChange={(e) => setTargetSceneId(e.target.value)}
                placeholder="scene-1, scene-2 など"
              />
            </div>

            <div className="form-group">
              <label>表示条件（オプション）</label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="例: hasItem('sword')"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                />
                選択肢を有効にする
              </label>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={onClose}>
                キャンセル
              </button>
              <button className="btn-primary" onClick={handleInsert}>
                挿入
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
