import React, { useEffect } from 'react'
import { EditorContent, useEditor, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { useEditorStore } from './store/useEditorStore'
import { Preview } from './components/Preview'
import { ChoiceButton } from './extensions/choiceButton'
import { SlashCommands } from './extensions/slashCommands'
import { ZenIndicator } from './components/ZenIndicator'
import { SlashHints } from './components/SlashHints'

export default function App() {
  const setDoc = useEditorStore((s) => s.setDoc)
  const setHtml = useEditorStore((s) => s.setHtml)
  const zen = useEditorStore((s) => s.zen)
  const toggleZen = useEditorStore((s) => s.toggleZen)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'ここに物語を記述… /image, /choice などを試せます（実装中）' }),
      Image,
      ChoiceButton,
      SlashCommands,
    ],
    content: '<p>ようこそ。ここからZenエディタのプロトを始めます。</p>',
    autofocus: 'end',
    editorProps: {
      attributes: {
        spellcheck: 'false',
        style: 'min-height: 70vh;'
      }
    }
  })

  useEffect(() => {
    if (!editor) return
    // 初回復元
    try {
      const savedDoc = localStorage.getItem('ngen:doc')
      if (savedDoc) {
        const json = JSON.parse(savedDoc)
        editor.commands.setContent(json)
      }
    } catch (e) {
      console.warn('restore failed', e)
    }
    setHtml(editor.getHTML())
    setDoc(editor.getJSON())
    const handler = () => {
      setHtml(editor.getHTML())
      setDoc(editor.getJSON())
      try {
        localStorage.setItem('ngen:html', editor.getHTML())
        localStorage.setItem('ngen:doc', JSON.stringify(editor.getJSON()))
      } catch {}
    }
    editor.on('update', handler)
    return () => { editor.off('update', handler) }
  }, [editor, setDoc, setHtml])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey) return
      const k = e.key.toLowerCase()
      if (k === 'z') {
        e.preventDefault()
        toggleZen()
        return
      }
      if (k === 'c' && editor) {
        e.preventDefault()
        editor.commands.insertChoiceButton({ text: '選択肢', targetSceneId: '' })
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleZen, editor])

  return (
    <div className={`app ${zen ? 'is-zen' : ''}`}>
      <div className="pane pane-editor">
        <div className="pane-title">Editor</div>
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            shouldShow={() => !zen}
          >
            <div className="bubble">
              <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
              <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
            </div>
          </BubbleMenu>
        )}
        <div className="editor-wrap">
          <EditorContent editor={editor} />
          <SlashHints editor={editor} />
        </div>
      </div>
      <div className="pane pane-preview">
        <div className="pane-title">Preview</div>
        <Preview />
      </div>
      <ZenIndicator />
    </div>
  )
}
