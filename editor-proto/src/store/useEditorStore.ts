import { create } from 'zustand'

export type DocJSON = any

type EditorState = {
  doc: DocJSON | null
  zen: boolean
  html: string | null
  setDoc: (doc: DocJSON) => void
  setHtml: (html: string) => void
  toggleZen: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  doc: null,
  zen: true,
  html: null,
  setDoc: (doc) => set({ doc }),
  setHtml: (html) => set({ html }),
  toggleZen: () => set((s) => ({ zen: !s.zen })),
}))
