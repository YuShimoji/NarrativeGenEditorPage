import { create } from 'zustand'

export interface Scene {
  id: string
  title: string
  description: string
  content: any // Tiptap JSON document
  order: number
  createdAt: Date
  updatedAt: Date
}

interface SceneStore {
  scenes: Scene[]
  currentSceneId: string | null
  
  // Actions
  addScene: (title?: string) => string
  deleteScene: (id: string) => void
  updateScene: (id: string, updates: Partial<Scene>) => void
  setCurrentScene: (id: string) => void
  reorderScenes: (sceneIds: string[]) => void
  
  // Getters
  getCurrentScene: () => Scene | null
  getSceneById: (id: string) => Scene | null
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  scenes: [
    {
      id: 'scene-1',
      title: 'オープニング',
      description: '物語の始まり',
      content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ようこそ。ここからZenエディタのプロトを始めます。' }] }] },
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  currentSceneId: 'scene-1',

  addScene: (title = '新しいシーン') => {
    const newId = `scene-${Date.now()}`
    const newScene: Scene = {
      id: newId,
      title,
      description: '',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      order: get().scenes.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    set(state => ({
      scenes: [...state.scenes, newScene],
      currentSceneId: newId
    }))
    
    return newId
  },

  deleteScene: (id: string) => {
    set(state => {
      const filteredScenes = state.scenes.filter(s => s.id !== id)
      const newCurrentId = state.currentSceneId === id 
        ? (filteredScenes.length > 0 ? filteredScenes[0].id : null)
        : state.currentSceneId
      
      return {
        scenes: filteredScenes,
        currentSceneId: newCurrentId
      }
    })
  },

  updateScene: (id: string, updates: Partial<Scene>) => {
    set(state => ({
      scenes: state.scenes.map(scene => 
        scene.id === id 
          ? { ...scene, ...updates, updatedAt: new Date() }
          : scene
      )
    }))
  },

  setCurrentScene: (id: string) => {
    set({ currentSceneId: id })
  },

  reorderScenes: (sceneIds: string[]) => {
    set(state => {
      const sceneMap = new Map(state.scenes.map(s => [s.id, s]))
      const reorderedScenes = sceneIds.map((id, index) => ({
        ...sceneMap.get(id)!,
        order: index
      }))
      
      return { scenes: reorderedScenes }
    })
  },

  getCurrentScene: () => {
    const state = get()
    return state.scenes.find(s => s.id === state.currentSceneId) || null
  },

  getSceneById: (id: string) => {
    return get().scenes.find(s => s.id === id) || null
  },
}))
