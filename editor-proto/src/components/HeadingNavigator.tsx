import React, { useEffect, useState } from 'react'
import { Editor } from '@tiptap/react'

interface HeadingItem {
  id: string
  level: number
  text: string
  position: number
}

interface HeadingNavigatorProps {
  editor: Editor | null
  zen: boolean
}

export const HeadingNavigator: React.FC<HeadingNavigatorProps> = ({ editor, zen }) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!editor) return

    const updateHeadings = () => {
      const headingItems: HeadingItem[] = []
      const doc = editor.getJSON()
      
      const extractHeadings = (content: any[], position = 0) => {
        content.forEach((node, index) => {
          if (node.type === 'heading' && node.attrs?.level && node.content) {
            const text = node.content
              .filter((item: any) => item.type === 'text')
              .map((item: any) => item.text)
              .join('')
            
            if (text.trim()) {
              headingItems.push({
                id: `heading-${position}-${index}`,
                level: node.attrs.level,
                text: text.trim(),
                position: position + index
              })
            }
          }
          
          if (node.content) {
            extractHeadings(node.content, position + index + 1)
          }
        })
      }

      if (doc.content) {
        extractHeadings(doc.content)
      }
      
      setHeadings(headingItems)
    }

    // 初回実行
    updateHeadings()

    // エディタの変更を監視
    const handleUpdate = () => {
      updateHeadings()
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor])

  const scrollToHeading = (heading: HeadingItem) => {
    if (!editor) return

    // エディタ内の見出しを探して位置を取得
    const editorElement = editor.view.dom
    const headingElements = editorElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
    
    for (const element of headingElements) {
      if (element.textContent?.trim() === heading.text) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      }
    }
    
    setIsOpen(false)
  }

  if (zen || headings.length === 0) {
    return null
  }

  return (
    <div className="heading-navigator">
      <button 
        className={`heading-toggle ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="見出しナビゲーション"
      >
        📋 見出し ({headings.length})
      </button>
      
      {isOpen && (
        <div className="heading-list">
          <div className="heading-list-header">
            <span>見出し一覧</span>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="heading-items">
            {headings.map((heading) => (
              <button
                key={heading.id}
                className={`heading-item heading-level-${heading.level}`}
                onClick={() => scrollToHeading(heading)}
                title={`レベル ${heading.level} 見出し`}
              >
                <span className="heading-marker">
                  {'#'.repeat(heading.level)}
                </span>
                <span className="heading-text">{heading.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
