import React, { useState } from 'react'
import { useSceneStore } from '../store/useSceneStore'

export const ScenePanel: React.FC = () => {
  const { 
    scenes, 
    currentSceneId, 
    addScene, 
    deleteScene, 
    updateScene, 
    setCurrentScene 
  } = useSceneStore()
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleAddScene = () => {
    const newId = addScene()
    setEditingId(newId)
    setEditTitle('新しいシーン')
  }

  const handleEditStart = (scene: any) => {
    setEditingId(scene.id)
    setEditTitle(scene.title)
  }

  const handleEditSave = () => {
    if (editingId && editTitle.trim()) {
      updateScene(editingId, { title: editTitle.trim() })
    }
    setEditingId(null)
    setEditTitle('')
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const handleDelete = (id: string) => {
    if (scenes.length > 1 && window.confirm('このシーンを削除しますか？')) {
      deleteScene(id)
    }
  }

  // ドラッグ開始処理
  const handleDragStart = (e: React.DragEvent, scene: any) => {
    e.stopPropagation()
    
    // ドラッグデータを設定
    const dragData = {
      type: 'scene',
      id: scene.id,
      title: scene.title
    }
    
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData))
    e.dataTransfer.setData('text/scene-id', scene.id)
    e.dataTransfer.effectAllowed = 'copy'
    
    // ビジュアルフィードバック
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = 'rotate(5deg)'
    dragImage.style.opacity = '0.8'
    e.dataTransfer.setDragImage(dragImage, 20, 20)
  }

  return (
    <div className="scene-panel">
      <div className="scene-panel-header">
        <h3>シーン</h3>
        <button 
          className="scene-add-btn"
          onClick={handleAddScene}
          title="新しいシーンを追加"
        >
          +
        </button>
      </div>
      
      <div className="scene-list">
        {scenes.map((scene, index) => (
          <div 
            key={scene.id}
            className={`scene-item ${scene.id === currentSceneId ? 'active' : ''} draggable-scene`}
            onClick={() => setCurrentScene(scene.id)}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, scene)}
            title={`ドラッグして選択肢にリンク設定可能: ${scene.title}`}
          >
            <div className="scene-order">{index + 1}</div>
            
            <div className="scene-content">
              <div className="drag-handle" title="ドラッグハンドル">⋮⋮</div>
              {editingId === scene.id ? (
                <div className="scene-edit">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleEditSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSave()
                      if (e.key === 'Escape') handleEditCancel()
                    }}
                    autoFocus
                    className="scene-title-input"
                  />
                </div>
              ) : (
                <div className="scene-info">
                  <div 
                    className="scene-title"
                    onDoubleClick={() => handleEditStart(scene)}
                  >
                    {scene.title}
                  </div>
                  {scene.description && (
                    <div className="scene-description">{scene.description}</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="scene-actions">
              <button
                className="scene-action-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditStart(scene)
                }}
                title="編集"
              >
                ✏️
              </button>
              {scenes.length > 1 && (
                <button
                  className="scene-action-btn delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(scene.id)
                  }}
                  title="削除"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
