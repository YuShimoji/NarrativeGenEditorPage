import { Extension } from '@tiptap/core'

function getParagraphText(state: any) {
  const {$from} = state.selection
  const start = $from.start()
  const end = $from.pos
  const text = state.doc.textBetween(start, end, '\n', '\n')
  return { text, start, end }
}

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addKeyboardShortcuts() {
    // guard to avoid double execution in a very short time window
    let last = { from: -1, to: -1, at: 0 }

    const handle = () => {
      const editor = this.editor
      const { state } = editor
      const { text, start, end } = getParagraphText(state)
      const trimmed = text.trim()

      // short-time duplicate execution guard (e.g., Space then Enter)
      const now = Date.now()
      if (last.from === start && last.to === end && now - last.at < 300) {
        return true
      }

      // /image [url]
      const img = trimmed.match(/^\/image(?:\s+(.+))?$/i)
      if (img) {
        let url = (img[1] || '').trim()
        if (!url && typeof window !== 'undefined') {
          url = window.prompt('画像URLを入力:')?.trim() || ''
        }
        if (!url) return true
        // simple scheme validation
        if (!/^https?:\/\//i.test(url)) {
          if (typeof window !== 'undefined') {
            window.alert('画像URLは http(s):// で始まる必要があります。')
          }
          return true
        }
        last = { from: start, to: end, at: now }
        return editor
          .chain()
          .focus()
          .deleteRange({ from: start, to: end })
          .setImage({ src: url })
          .run()
      }

      // /choice [label]
      const ch = trimmed.match(/^\/choice(?:\s+(.+))?$/i)
      if (ch) {
        const label = (ch[1]?.trim() || (typeof window !== 'undefined' ? window.prompt('選択肢のラベル:', '選択肢') || '' : '')).trim()
        last = { from: start, to: end, at: now }
        return editor
          .chain()
          .focus()
          .deleteRange({ from: start, to: end })
          .insertChoiceButton({ text: label || '選択肢', targetSceneId: '' })
          .run()
      }

      return false
    }

    return {
      Space: handle,
      Enter: handle,
    }
  },
})

