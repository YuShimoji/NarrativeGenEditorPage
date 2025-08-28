import React from 'react'
import { PreviewJSON } from './PreviewJSON'
import { useEditorStore } from '../store/useEditorStore'

export const Preview: React.FC = () => {
  const doc = useEditorStore((s) => s.doc)
  
  return (
    <div className="preview">
      <div className="preview-header">
        <div className="preview-info">
          <span className="preview-label">リアルタイムプレビュー</span>
          <span className="preview-description">
            左のエディタで入力した内容がゲーム形式で表示されます
          </span>
        </div>
      </div>
      <PreviewJSON />
      {(!doc || !doc.content || doc.content.length === 0) && (
        <div className="preview-placeholder">
          <p>エディタで文章を入力すると、ここにプレビューが表示されます</p>
          <p>画像や選択肢も即座に反映されます</p>
        </div>
      )}
    </div>
  )
}
