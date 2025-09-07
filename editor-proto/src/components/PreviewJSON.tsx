import React from 'react'
import { useEditorStore } from '../store/useEditorStore'

type PMNode = {
  type: string
  text?: string
  marks?: { type: string }[]
  attrs?: Record<string, any>
  content?: PMNode[]
}

function renderText(node: PMNode) {
  let el: React.ReactNode = node.text ?? ''
  const marks = node.marks ?? []
  for (const m of marks) {
    if (m.type === 'bold') el = <strong>{el}</strong>
    if (m.type === 'italic') el = <em>{el}</em>
    if (m.type === 'strike') el = <s>{el}</s>
    if (m.type === 'code') el = <code>{el}</code>
  }
  return el
}

function renderNode(node: PMNode, key?: React.Key): React.ReactNode {
  switch (node.type) {
    case 'text':
      return <React.Fragment key={key}>{renderText(node)}</React.Fragment>
    case 'paragraph':
      return <p key={key}>{node.content?.map((c, i) => renderNode(c, i))}</p>
    case 'heading': {
      const level = node.attrs?.level ?? 1
      const Tag = (`h${Math.min(Math.max(level,1),6)}` as any)
      return <Tag key={key}>{node.content?.map((c, i) => renderNode(c, i))}</Tag>
    }
    case 'bulletList':
      return <ul key={key}>{node.content?.map((c, i) => renderNode(c, i))}</ul>
    case 'orderedList':
      return <ol key={key}>{node.content?.map((c, i) => renderNode(c, i))}</ol>
    case 'listItem':
      return <li key={key}>{node.content?.map((c, i) => renderNode(c, i))}</li>
    case 'choiceButton': {
      const text = node.attrs?.text ?? '選択肢'
      const style = node.attrs?.style ?? 'normal'
      const target = node.attrs?.targetSceneId ?? ''
      const condition = node.attrs?.condition ?? ''
      const enabled = node.attrs?.enabled ?? true
      
      return (
        <button 
          key={key} 
          className={`choice-button choice-${style} ${enabled ? '' : 'disabled'}`}
          data-choice-button 
          data-target={target}
          data-text={text}
          data-style={style}
          data-condition={condition}
          data-enabled={enabled}
          disabled={!enabled}
        >
          {text}
        </button>
      )
    }
    case 'image': {
      const { src = '', alt = '' } = node.attrs || {}
      return <img key={key} src={src} alt={alt} style={{ maxWidth: '100%' }} />
    }
    case 'hardBreak':
      return <br key={key} />
    default:
      return <div key={key}>{node.content?.map((c, i) => renderNode(c, i))}</div>
  }
}

export const PreviewJSON: React.FC = () => {
  const doc = useEditorStore((s) => s.doc) as { type?: string; content?: PMNode[] } | null
  if (!doc) return <div className="preview-placeholder">プレビューはここに表示されます。</div>
  return (
    <div className="preview-content">
      {doc.content?.map((n, i) => renderNode(n, i))}
    </div>
  )
}
