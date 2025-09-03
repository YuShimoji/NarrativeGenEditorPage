import React, { useEffect, useState } from 'react'
import { EditorContent, useEditor, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { useEditorStore } from './store/useEditorStore'
import { useSceneStore } from './store/useSceneStore'
import { Preview } from './components/Preview'
import { ChoiceButton } from './extensions/choiceButton'
import { SlashCommands } from './extensions/slashCommands'
import { Divider } from './extensions/divider'
import { ZenIndicator } from './components/ZenIndicator'
import { SlashHints } from './components/SlashHints'
import { ScenePanel } from './components/ScenePanel'
import { WikiPanel } from './components/WikiPanel'
import { AutoWikiExtractor } from './components/AutoWikiExtractor'
import { HeadingNavigator } from './components/HeadingNavigator'
import { ChoiceButtonEditor } from './components/ChoiceButtonEditor'
import { ImmersivePostingSystem } from './components/ImmersivePostingSystem'
import { WikiEntryEditor } from './components/WikiEntryEditor'

export default function App() {
  const setDoc = useEditorStore((s) => s.setDoc)
  const setHtml = useEditorStore((s) => s.setHtml)
  const zen = useEditorStore((s) => s.zen)
  const toggleZen = useEditorStore((s) => s.toggleZen)
  
  const { getCurrentScene, updateScene } = useSceneStore()
  const currentScene = getCurrentScene()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [choiceEditorOpen, setChoiceEditorOpen] = useState(false)
  const [immersivePostingOpen, setImmersivePostingOpen] = useState(false)
  const [entryEditorOpen, setEntryEditorOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<any>(null)

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
      Underline,
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      ChoiceButton,
      SlashCommands,
      Divider,
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

  const getEditorPlainText = (): string => {
    if (!editor) return ''
    return editor.getText()
  }

  const handleManualSave = async () => {
    if (!editor) return
    
    setIsSaving(true)
    try {
      const newDoc = editor.getJSON()
      const newHtml = editor.getHTML()
      
      // 現在のシーンに内容を保存
      if (currentScene) {
        updateScene(currentScene.id, { content: newDoc })
      }
      
      // ローカルストレージに保存
      localStorage.setItem('ngen:html', newHtml)
      localStorage.setItem('ngen:doc', JSON.stringify(newDoc))
      
      setLastSaved(new Date())
      console.log('Manual save completed')
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ctrl+S で手動保存
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleManualSave()
        return
      }
      
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
  }, [toggleZen, editor, handleManualSave])


  return (
    <div className={`app ${zen ? 'is-zen' : ''}`}>
      <div className="pane pane-scene">
        <ScenePanel />
      </div>
      <div className="pane pane-editor">
        <div className="pane-title">
          Editor
          <div className="editor-toolbar">
            <button 
              className={`save-btn ${isSaving ? 'saving' : ''}`}
              onClick={handleManualSave}
              disabled={isSaving}
            >
              {isSaving ? '保存中...' : '💾 保存'}
            </button>
            {lastSaved && (
              <span className="last-saved">
                最終保存: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            shouldShow={({ editor: _ed }) => !zen}
          >
            <div className="bubble">
              <button 
                className={editor.isActive('bold') ? 'is-active' : ''}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <strong>B</strong>
              </button>
              <button 
                className={editor.isActive('italic') ? 'is-active' : ''}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <em>I</em>
              </button>
              <button 
                className={editor.isActive('strike') ? 'is-active' : ''}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <s>S</s>
              </button>
              <button 
                className={editor.isActive('underline') ? 'is-active' : ''}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                title="下線"
              >
                <u>U</u>
              </button>
              <button 
                className={editor.isActive('code') ? 'is-active' : ''}
                onClick={() => editor.chain().focus().toggleCode().run()}
              >
                {'</>'}
              </button>
              <div className="bubble-divider"></div>
              {/* 文字色ボタン */}
              <button 
                onClick={() => editor.chain().focus().setColor('#ff0000').run()}
                className={editor.isActive('textStyle', { color: '#ff0000' }) ? 'is-active' : ''}
                title="赤色"
                style={{ color: '#ff0000', fontWeight: 'bold' }}
              >
                A
              </button>
              <button 
                onClick={() => editor.chain().focus().setColor('#0066cc').run()}
                className={editor.isActive('textStyle', { color: '#0066cc' }) ? 'is-active' : ''}
                title="青色"
                style={{ color: '#0066cc', fontWeight: 'bold' }}
              >
                A
              </button>
              <button 
                onClick={() => editor.chain().focus().setColor('#009900').run()}
                className={editor.isActive('textStyle', { color: '#009900' }) ? 'is-active' : ''}
                title="緑色"
                style={{ color: '#009900', fontWeight: 'bold' }}
              >
                A
              </button>
              <button 
                onClick={() => editor.chain().focus().unsetColor().run()}
                title="色をリセット"
              >
                ×
              </button>
              <div className="bubble-divider"></div>
              <button 
                className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                H1
              </button>
              <button 
                className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                H2
              </button>
              <button 
                className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                H3
              </button>
              <div className="bubble-divider"></div>
              <button 
                className={editor.isActive('bulletList') ? 'is-active' : ''}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                • List
              </button>
              <button 
                className={editor.isActive('orderedList') ? 'is-active' : ''}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                1. List
              </button>
              <button 
                className={editor.isActive('blockquote') ? 'is-active' : ''}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                " Quote
              </button>
              <div className="bubble-divider"></div>
              <button 
                onClick={() => editor.chain().focus().insertDivider({ type: 'line' }).run()}
                title="区切り線"
              >
                ━━
              </button>
              <button 
                onClick={() => editor.chain().focus().insertDivider({ type: 'stars' }).run()}
                title="星区切り"
              >
                ✦
              </button>
              <button 
                onClick={() => editor.chain().focus().insertDivider({ type: 'dots' }).run()}
                title="点区切り"
              >
                •••
              </button>
              <button 
                onClick={() => editor.chain().focus().insertDivider({ type: 'wave' }).run()}
                title="波区切り"
              >
                ～
              </button>
              <div className="bubble-divider"></div>
              {/* 選択肢ボタン */}
              <button 
                onClick={() => setChoiceEditorOpen(true)}
                title="選択肢エディターを開く"
              >
                📝 選択肢
              </button>
              <button 
                onClick={() => editor.chain().focus().insertChoiceButton({ text: '続ける', style: 'normal' }).run()}
                title="クイック選択肢"
              >
                続ける
              </button>
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
      <div className="pane pane-wiki">
        <WikiPanel 
          onImmersivePostingOpen={() => setImmersivePostingOpen(true)}
          onEntryEditOpen={(entry) => {
            setEditingEntry(entry || null)
            setEntryEditorOpen(true)
          }}
        />
      </div>
      <ZenIndicator />
      <HeadingNavigator editor={editor} zen={zen} />
      <ChoiceButtonEditor 
        editor={editor}
        isOpen={choiceEditorOpen}
        onClose={() => setChoiceEditorOpen(false)}
      />
      <ImmersivePostingSystem 
        isOpen={immersivePostingOpen}
        onClose={() => setImmersivePostingOpen(false)}
      />
      <WikiEntryEditor 
        entry={editingEntry}
        isOpen={entryEditorOpen}
        onClose={() => {
          setEntryEditorOpen(false)
          setEditingEntry(null)
        }}
      />
      <AutoWikiExtractor 
        content={getEditorPlainText()}
        onSuggestionsReady={(suggestions) => {
          console.log('Wiki suggestions ready:', suggestions.length)
        }}
      />
    </div>
  )
}
