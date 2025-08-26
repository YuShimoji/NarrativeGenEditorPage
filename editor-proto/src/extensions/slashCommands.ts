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
    const handle = () => {
      const editor = this.editor
      const { state } = editor
      const { text, start, end } = getParagraphText(state)
      const trimmed = text.trim()

      // /image [url]
      const img = trimmed.match(/^\/image(?:\s+(.+))?$/i)
      if (img) {
        let url = (img[1] || '').trim()
        if (!url && typeof window !== 'undefined') {
          url = window.prompt('画像URLを入力:')?.trim() || ''
        }
        if (!url) return true
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

