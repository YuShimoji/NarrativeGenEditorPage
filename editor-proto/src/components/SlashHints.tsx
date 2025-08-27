import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Editor } from '@tiptap/react'

const CANDIDATES = [
  { key: 'image', label: 'image — 画像を挿入' },
  { key: 'choice', label: 'choice — 選択肢を挿入' },
]

type Props = { editor: Editor | null, zen?: boolean }

export const SlashHints: React.FC<Props> = ({ editor, zen }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [coords, setCoords] = useState<{x: number, y: number}>({ x: 0, y: 0 })
  const [active, setActive] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const items = useMemo(() => {
    const q = query.toLowerCase()
    return CANDIDATES.filter(c => c.key.startsWith(q))
  }, [query])

  useEffect(() => {
    if (!editor) return
    if (zen) {
      setOpen(false)
      setQuery('')
      return
    }
    const update = () => {
      const { state } = editor
      const {$from} = state.selection as any
      const start = $from.start()
      const end = $from.pos
      const text = state.doc.textBetween(start, end, '\n', '\n') as string
      const m = text.match(/^\/(.*)$/)
      if (m) {
        setOpen(true)
        setQuery((m[1] || '').trim())
        try {
          const rectSel = editor.view.coordsAtPos(end)
          const rectCont = (editor.view.dom as HTMLElement).getBoundingClientRect()
          setCoords({ x: Math.max(rectSel.left - rectCont.left, 8), y: Math.max(rectSel.bottom - rectCont.top + 6, 8) })
        } catch {}
      } else {
        setOpen(false)
        setQuery('')
      }
    }
    editor.on('update', update)
    editor.on('selectionUpdate', update)
    update()
    return () => {
      editor.off('update', update)
      editor.off('selectionUpdate', update)
    }
  }, [editor, zen])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault(); setActive(a => Math.min(a + 1, Math.max(items.length - 1, 0)))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); setActive(a => Math.max(a - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items.length > 0) apply(items[Math.max(active, 0)].key)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, items, active])

  const apply = (key: string) => {
    if (!editor) return
    const { state } = editor
    const {$from} = state.selection as any
    const start = $from.start()
    const end = $from.pos
    if (key === 'image') {
      const url = typeof window !== 'undefined' ? (window.prompt('画像URLを入力:') || '').trim() : ''
      if (!url) return
      if (!/^https?:\/\//i.test(url)) {
        window.alert('画像URLは http(s):// で始まる必要があります。')
        return
      }
      editor.chain().focus().deleteRange({ from: start, to: end }).setImage({ src: url }).run()
    } else if (key === 'choice') {
      const label = typeof window !== 'undefined' ? (window.prompt('選択肢のラベル:', '選択肢') || '').trim() : '選択肢'
      editor.chain().focus().deleteRange({ from: start, to: end }).insertChoiceButton({ text: label || '選択肢', targetSceneId: '' }).run()
    }
    setOpen(false)
    setQuery('')
  }

  if (zen) return null
  if (!open || items.length === 0) return null

  return (
    <div ref={containerRef} className="slash-hints" style={{ left: coords.x, top: coords.y }}>
      {items.map((it, i) => (
        <div
          key={it.key}
          className={`slash-hints-item ${i === active ? 'is-active' : ''}`}
          onMouseEnter={() => setActive(i)}
          onMouseDown={(e) => { e.preventDefault(); apply(it.key) }}
        >
          <span className="k">/{it.key}</span>
          <span className="t">{it.label}</span>
        </div>
      ))}
    </div>
  )
}
