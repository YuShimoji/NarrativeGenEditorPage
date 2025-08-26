import React from 'react'
import { useEditorStore } from '../store/useEditorStore'

export const ZenIndicator: React.FC = () => {
  const zen = useEditorStore((s) => s.zen)
  const toggleZen = useEditorStore((s) => s.toggleZen)
  return (
    <div
      className="zen-indicator"
      title="クリック or Ctrl+Shift+Z で切替"
      role="button"
      aria-pressed={zen}
      onClick={() => toggleZen()}
    >
      {zen ? 'Zen: ON' : 'Zen: OFF'}
    </div>
  )
}
