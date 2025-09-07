import React, { useState, useRef } from 'react'
import { Button, Input, Select } from '../atoms'
import { useSceneStore } from '../../store/useSceneStore'

export interface SceneSelectorProps {
  selectedSceneId: string
  onSceneSelect: (sceneId: string) => void
  label?: string
  placeholder?: string
  allowDragDrop?: boolean
  className?: string
}

export const SceneSelector: React.FC<SceneSelectorProps> = ({
  selectedSceneId,
  onSceneSelect,
  label = 'リンク先シーン',
  placeholder = 'シーンを選択またはドラッグ&ドロップ',
  allowDragDrop = true,
  className = ''
}) => {
  const { scenes } = useSceneStore()
  const [isDragOver, setIsDragOver] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // シーンリストをオプション形式に変換
  const sceneOptions = [
    { value: '', label: 'シーンを選択してください' },
    ...scenes.map(scene => ({
      value: scene.id,
      label: `${scene.title} (${scene.id})`,
      disabled: false
    }))
  ]

  // 選択されたシーンの情報を取得
  const selectedScene = scenes.find(scene => scene.id === selectedSceneId)

  // ドラッグオーバー処理
  const handleDragOver = (e: React.DragEvent) => {
    if (!allowDragDrop) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  // ドラッグリーブ処理
  const handleDragLeave = (e: React.DragEvent) => {
    if (!allowDragDrop) return
    e.preventDefault()
    e.stopPropagation()
    
    // ドロップゾーンから完全に出た場合のみリセット
    const rect = dropZoneRef.current?.getBoundingClientRect()
    if (rect) {
      const { clientX, clientY } = e
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        setIsDragOver(false)
      }
    }
  }

  // ドロップ処理
  const handleDrop = (e: React.DragEvent) => {
    if (!allowDragDrop) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    try {
      // ドラッグされたデータを取得
      const dragData = e.dataTransfer.getData('text/plain')
      
      // シーンIDの形式をチェック
      let sceneId = ''
      
      // JSON形式の場合
      try {
        const parsed = JSON.parse(dragData)
        if (parsed.type === 'scene' && parsed.id) {
          sceneId = parsed.id
        }
      } catch {
        // プレーンテキストの場合（scene-1, scene-2など）
        if (dragData.startsWith('scene-') || scenes.some(s => s.id === dragData)) {
          sceneId = dragData
        }
      }

      if (sceneId && scenes.some(s => s.id === sceneId)) {
        onSceneSelect(sceneId)
      } else {
        console.warn('Invalid scene ID dropped:', dragData)
      }
    } catch (error) {
      console.error('Error handling drop:', error)
    }
  }

  // 手動入力処理
  const handleManualInput = (value: string) => {
    onSceneSelect(value)
  }

  // 選択肢クリア
  const handleClear = () => {
    onSceneSelect('')
  }

  return (
    <div className={`scene-selector ${className}`}>
      {/* ラベル */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* メイン選択エリア */}
      <div className="space-y-3">
        {/* ドロップダウン選択 */}
        <div>
          <Select
            options={sceneOptions}
            value={selectedSceneId}
            onChange={(e) => onSceneSelect(e.target.value)}
            placeholder="ドロップダウンから選択"
            fullWidth
          />
        </div>

        {/* ドラッグ&ドロップエリア */}
        {allowDragDrop && (
          <div
            ref={dropZoneRef}
            className={`
              border-2 border-dashed rounded-lg p-4 text-center transition-colors
              ${isDragOver 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 bg-gray-50 text-gray-500'
              }
              hover:border-gray-400 hover:bg-gray-100
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl">
                {isDragOver ? '📥' : '🎯'}
              </div>
              <div className="text-sm">
                {isDragOver 
                  ? 'シーンをドロップしてください' 
                  : 'シーンパネルからシーンをドラッグ&ドロップ'
                }
              </div>
            </div>
          </div>
        )}

        {/* 手動入力 */}
        <div>
          <Input
            label="または手動でシーンIDを入力"
            value={selectedSceneId}
            onChange={(e) => handleManualInput(e.target.value)}
            placeholder="例: scene-1, chapter-2-scene-3"
            fullWidth
            size="sm"
          />
        </div>

        {/* 選択されたシーンの情報表示 */}
        {selectedScene && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-green-800">
                  選択中: {selectedScene.title}
                </div>
                <div className="text-xs text-green-600">
                  ID: {selectedScene.id}
                </div>
                {selectedScene.content && (
                  <div className="text-xs text-green-600 mt-1">
                    {typeof selectedScene.content === 'string' 
                      ? selectedScene.content.slice(0, 100)
                      : 'コンテンツあり'
                    }
                    {(typeof selectedScene.content === 'string' && selectedScene.content.length > 100) ? '...' : ''}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-green-700 hover:text-green-900"
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        {/* 無効なシーンIDの警告 */}
        {selectedSceneId && !selectedScene && selectedSceneId.trim() !== '' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <div className="text-sm text-yellow-800">
                シーンID "{selectedSceneId}" が見つかりません
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ヘルプテキスト */}
      <div className="mt-2 text-xs text-gray-500">
        💡 ヒント: シーンパネルからシーンをドラッグするか、ドロップダウンから選択してください
      </div>
    </div>
  )
}
