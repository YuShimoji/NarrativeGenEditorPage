import { create } from 'zustand'

export interface UIState {
  zen: boolean
  showScenePanel: boolean
  showWikiPanel: boolean
  showPreviewPanel: boolean
  sidebarCollapsed: boolean
  activeModal: string | null
  theme: 'light' | 'dark' | 'auto'
  fontSize: number
  lineHeight: number
  editorWidth: number
  panelSizes: {
    scene: number
    editor: number
    preview: number
    wiki: number
  }
}

export interface UIActions {
  toggleZen: () => void
  setZen: (zen: boolean) => void
  togglePanel: (panel: 'scene' | 'wiki' | 'preview') => void
  showPanel: (panel: 'scene' | 'wiki' | 'preview') => void
  hidePanel: (panel: 'scene' | 'wiki' | 'preview') => void
  toggleSidebar: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  setFontSize: (size: number) => void
  setLineHeight: (height: number) => void
  setEditorWidth: (width: number) => void
  setPanelSize: (panel: keyof UIState['panelSizes'], size: number) => void
  resetLayout: () => void
}

export type UIStore = UIState & UIActions

const DEFAULT_UI_STATE: UIState = {
  zen: false,
  showScenePanel: true,
  showWikiPanel: true,
  showPreviewPanel: true,
  sidebarCollapsed: false,
  activeModal: null,
  theme: 'auto',
  fontSize: 14,
  lineHeight: 1.6,
  editorWidth: 800,
  panelSizes: {
    scene: 25,
    editor: 35,
    preview: 20,
    wiki: 20
  }
}

export const useUIStore = create<UIStore>((set, get) => ({
  ...DEFAULT_UI_STATE,

  toggleZen: () => set((state) => ({ zen: !state.zen })),
  
  setZen: (zen: boolean) => set({ zen }),

  togglePanel: (panel: 'scene' | 'wiki' | 'preview') => set((state) => {
    const panelKey = `show${panel.charAt(0).toUpperCase() + panel.slice(1)}Panel` as keyof UIState
    return { [panelKey]: !state[panelKey] } as Partial<UIState>
  }),

  showPanel: (panel: 'scene' | 'wiki' | 'preview') => set((state) => {
    const panelKey = `show${panel.charAt(0).toUpperCase() + panel.slice(1)}Panel` as keyof UIState
    return { [panelKey]: true } as Partial<UIState>
  }),

  hidePanel: (panel: 'scene' | 'wiki' | 'preview') => set((state) => {
    const panelKey = `show${panel.charAt(0).toUpperCase() + panel.slice(1)}Panel` as keyof UIState
    return { [panelKey]: false } as Partial<UIState>
  }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  openModal: (modalId: string) => set({ activeModal: modalId }),

  closeModal: () => set({ activeModal: null }),

  setTheme: (theme: 'light' | 'dark' | 'auto') => set({ theme }),

  setFontSize: (fontSize: number) => set({ fontSize: Math.max(10, Math.min(24, fontSize)) }),

  setLineHeight: (lineHeight: number) => set({ lineHeight: Math.max(1.2, Math.min(2.5, lineHeight)) }),

  setEditorWidth: (editorWidth: number) => set({ editorWidth: Math.max(400, Math.min(1200, editorWidth)) }),

  setPanelSize: (panel: keyof UIState['panelSizes'], size: number) => set((state) => ({
    panelSizes: {
      ...state.panelSizes,
      [panel]: Math.max(10, Math.min(60, size))
    }
  })),

  resetLayout: () => set({
    panelSizes: DEFAULT_UI_STATE.panelSizes,
    fontSize: DEFAULT_UI_STATE.fontSize,
    lineHeight: DEFAULT_UI_STATE.lineHeight,
    editorWidth: DEFAULT_UI_STATE.editorWidth,
    zen: false,
    showScenePanel: true,
    showWikiPanel: true,
    showPreviewPanel: true,
    sidebarCollapsed: false
  })
}))

// セレクター関数（パフォーマンス最適化）
export const selectZenMode = (state: UIStore) => state.zen
export const selectPanelVisibility = (state: UIStore) => ({
  scene: state.showScenePanel,
  wiki: state.showWikiPanel,
  preview: state.showPreviewPanel
})
export const selectThemeSettings = (state: UIStore) => ({
  theme: state.theme,
  fontSize: state.fontSize,
  lineHeight: state.lineHeight
})
export const selectLayoutSettings = (state: UIStore) => ({
  editorWidth: state.editorWidth,
  panelSizes: state.panelSizes,
  sidebarCollapsed: state.sidebarCollapsed
})
