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
            className={`scene-item ${scene.id === currentSceneId ? 'active' : ''}`}
            onClick={() => setCurrentScene(scene.id)}
          >
            <div className="scene-order">{index + 1}</div>
            
            <div className="scene-content">
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
