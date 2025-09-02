import React from 'react'
import { useEditorStore } from '../store/useEditorStore'

export const ZenIndicator: React.FC = () => {
  const zen = useEditorStore((s) => s.zen)
  const toggleZen = useEditorStore((s) => s.toggleZen)
  
  return (
    <button
      className={`zen-toggle ${zen ? 'zen-active' : 'zen-inactive'}`}
      title={zen ? 'Zenモードを終了 (Ctrl+Shift+Z)' : 'Zenモードを開始 (Ctrl+Shift+Z)'}
      onClick={() => toggleZen()}
      aria-pressed={zen}
    >
      <span className="zen-icon">
        {zen ? '🧘‍♂️' : '📝'}
      </span>
      <span className="zen-text">
        {zen ? 'Zen ON' : 'Zen OFF'}
      </span>
      <span className="zen-shortcut">
        Ctrl+Shift+Z
      </span>
    </button>
  )
}
