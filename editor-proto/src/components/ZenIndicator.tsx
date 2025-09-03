import React, { useState, useEffect } from 'react'
import { useEditorStore } from '../store/useEditorStore'

export const ZenIndicator: React.FC = () => {
  const zen = useEditorStore((s) => s.zen)
  const toggleZen = useEditorStore((s) => s.toggleZen)
  const [isVisible, setIsVisible] = useState(true)
  const [lastActivity, setLastActivity] = useState(Date.now())
  
  // キーボードショートカットでの表示切替
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+H でZenボタンの表示切替
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault()
        setIsVisible(prev => !prev)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  // マウス活動の監視
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now())
      if (!isVisible) setIsVisible(true)
    }
    
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll']
    events.forEach(event => {
      document.addEventListener(event, handleActivity)
    })
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [isVisible])
  
  // 非活動時の自動非表示（Zenモード時のみ）
  useEffect(() => {
    if (!zen) return
    
    const timer = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity
      if (timeSinceActivity > 3000 && isVisible) { // 3秒後に非表示
        setIsVisible(false)
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [zen, lastActivity, isVisible])
  
  if (!isVisible && zen) {
    return (
      <div 
        className="zen-toggle-hidden"
        onMouseEnter={() => setIsVisible(true)}
        title="Zenボタンを表示 (Ctrl+Shift+H)"
      >
        <div className="zen-toggle-hint">●</div>
      </div>
    )
  }
  
  return (
    <button
      className={`zen-toggle ${zen ? 'zen-active' : 'zen-inactive'} ${isVisible ? 'zen-visible' : 'zen-hidden'}`}
      title={zen ? 'Zenモードを終了 (Ctrl+Shift+Z) | 非表示 (Ctrl+Shift+H)' : 'Zenモードを開始 (Ctrl+Shift+Z) | 非表示 (Ctrl+Shift+H)'}
      onClick={() => toggleZen()}
      aria-pressed={zen}
    >
      <div className="zen-toggle-content">
        <span className="zen-icon">
          {zen ? '●' : '○'}
        </span>
        <div className="zen-info">
          <span className="zen-text">
            {zen ? 'Zen ON' : 'Zen OFF'}
          </span>
          <span className="zen-shortcuts">
            <span className="zen-shortcut-item">Ctrl+Shift+Z</span>
            <span className="zen-shortcut-divider">|</span>
            <span className="zen-shortcut-item">Ctrl+Shift+H</span>
          </span>
        </div>
      </div>
    </button>
  )
}
