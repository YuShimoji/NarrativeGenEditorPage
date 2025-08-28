import React, { useEffect } from 'react'
import { EditorContent, useEditor, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { useEditorStore } from './store/useEditorStore'
import { useSceneStore } from './store/useSceneStore'
import { Preview } from './components/Preview'
import { ChoiceButton } from './extensions/choiceButton'
import { SlashCommands } from './extensions/slashCommands'
import { ZenIndicator } from './components/ZenIndicator'
import { SlashHints } from './components/SlashHints'
import { ScenePanel } from './components/ScenePanel'

export default function App() {
  const setDoc = useEditorStore((s) => s.setDoc)
  const setHtml = useEditorStore((s) => s.setHtml)
  const zen = useEditorStore((s) => s.zen)
  const toggleZen = useEditorStore((s) => s.toggleZen)
  
  const { getCurrentScene, updateScene } = useSceneStore()
  const currentScene = getCurrentScene()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'ここに物語を記述… /image, /choice などを試せます（実装中）' }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      ChoiceButton,
      SlashCommands,
    ],
    content: currentScene?.content || '<p>ようこそ。ここからZenエディタのプロトを始めます。</p>',
    autofocus: 'end',
    editorProps: {
      attributes: {
        spellcheck: 'false',
        style: 'min-height: 70vh;'
      }
    }
  })

  // シーン切替時にエディタ内容を更新
  useEffect(() => {
    if (!editor || !currentScene) return
    editor.commands.setContent(currentScene.content)
  }, [editor, currentScene?.id])

  useEffect(() => {
    if (!editor) return
    // 初回復元
    try {
      const savedDoc = localStorage.getItem('ngen:doc')
      if (savedDoc && !currentScene) {
        const json = JSON.parse(savedDoc)
        editor.commands.setContent(json)
      }
    } catch (e) {
      console.warn('restore failed', e)
    }
    setHtml(editor.getHTML())
    setDoc(editor.getJSON())
    const handler = () => {
      const newDoc = editor.getJSON()
      const newHtml = editor.getHTML()
      setHtml(newHtml)
      setDoc(newDoc)
      
      // 現在のシーンに内容を保存
      if (currentScene) {
        updateScene(currentScene.id, { content: newDoc })
      }
      
      try {
        localStorage.setItem('ngen:html', newHtml)
        localStorage.setItem('ngen:doc', JSON.stringify(newDoc))
      } catch {}
    }
    editor.on('update', handler)
    return () => { editor.off('update', handler) }
  }, [editor, setDoc, setHtml, currentScene, updateScene])

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
      <div className="pane pane-scene">
        <ScenePanel />
      </div>
      <div className="pane pane-editor">
        <div className="pane-title">Editor</div>
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            shouldShow={({ editor: _ed }) => !zen}
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
          <SlashHints editor={editor} zen={zen} />
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
