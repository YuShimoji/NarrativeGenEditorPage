import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { Button, Input, Select, Toggle } from './atoms'
import { ChoicePresetSelector } from './molecules/ChoicePresetSelector'
import { useValidation } from '../hooks/useValidation'
import { ChoiceStyle } from '../types'

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
  const [style, setStyle] = useState<ChoiceStyle>((initialData?.style as ChoiceStyle) || 'normal')
  const [targetSceneId, setTargetSceneId] = useState(initialData?.targetSceneId || '')
  const [condition, setCondition] = useState(initialData?.condition || '')
  const [enabled, setEnabled] = useState(initialData?.enabled ?? true)
  
  const { validateChoiceText, getErrorMessage, isValid } = useValidation()

  useEffect(() => {
    if (initialData) {
      setText(initialData.text)
      setStyle((initialData.style as ChoiceStyle) || 'normal')
      setTargetSceneId(initialData.targetSceneId)
      setCondition(initialData.condition)
      setEnabled(initialData.enabled)
    }
  }, [initialData])
  
  // 初期バリデーション
  useEffect(() => {
    if (text) {
      validateChoiceText(text)
    }
  }, [text, validateChoiceText])

  const handleInsert = () => {
    if (!editor) return
    
    // バリデーション
    const validation = validateChoiceText(text)
    if (!validation.isValid) {
      return
    }

    editor.chain().focus().insertChoiceButton({
      text,
      style,
      targetSceneId,
      condition,
      enabled
    }).run()

    onClose()
  }

  const handleQuickInsert = (quickStyle: ChoiceStyle, quickText: string) => {
    if (!editor) return

    editor.chain().focus().insertChoiceButton({
      text: quickText,
      style: quickStyle,
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
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>

        <div className="choice-editor-content">
          {/* プリセット選択 */}
          <div className="preset-section">
            <ChoicePresetSelector
              selectedStyle={style}
              onStyleChange={setStyle}
              onTextChange={setText}
            />
          </div>

          <div className="divider"></div>

          {/* カスタム設定 */}
          <div className="custom-choice">
            <h4>カスタム設定</h4>
            
            <div className="space-y-4">
              <Input
                label="選択肢テキスト"
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  validateChoiceText(e.target.value)
                }}
                placeholder="選択肢のテキストを入力"
                error={getErrorMessage('choiceText')}
                fullWidth
                required
              />

              <Input
                label="対象シーンID（オプション）"
                value={targetSceneId}
                onChange={(e) => setTargetSceneId(e.target.value)}
                placeholder="scene-1, scene-2 など"
                helperText="リンク先のシーンIDを指定"
                fullWidth
              />

              <Input
                label="表示条件（オプション）"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="例: hasItem('sword')"
                helperText="条件式を入力（JavaScript形式）"
                fullWidth
              />

              <Toggle
                checked={enabled}
                onChange={setEnabled}
                label="選択肢を有効にする"
                description="無効にすると選択できない状態で表示されます"
              />
            </div>

            <div className="form-actions flex gap-2 mt-6">
              <Button variant="secondary" onClick={onClose} fullWidth>
                キャンセル
              </Button>
              <Button 
                variant="primary" 
                onClick={handleInsert}
                disabled={!isValid('choiceText')}
                fullWidth
              >
                挿入
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
