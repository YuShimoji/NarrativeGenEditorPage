import { Node, mergeAttributes } from '@tiptap/core'

export interface ChoiceButtonAttrs {
  text: string
  targetSceneId: string
  style?: 'normal' | 'important' | 'danger' | 'subtle'
  condition?: string
  enabled?: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    choiceButton: {
      insertChoiceButton: (attrs: Partial<ChoiceButtonAttrs>) => ReturnType
    }
  }
}

export const ChoiceButton = Node.create({
  name: 'choiceButton',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      text: {
        default: '選択肢',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-text') || '選択肢',
        renderHTML: (attrs) => ({ 'data-text': attrs.text }),
      },
      targetSceneId: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-target') || '',
        renderHTML: (attrs) => ({ 'data-target': attrs.targetSceneId }),
      },
      style: {
        default: 'normal',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-style') || 'normal',
        renderHTML: (attrs) => ({ 'data-style': attrs.style }),
      },
      condition: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-condition') || '',
        renderHTML: (attrs) => ({ 'data-condition': attrs.condition }),
      },
      enabled: {
        default: true,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-enabled') === 'true',
        renderHTML: (attrs) => ({ 'data-enabled': attrs.enabled ? 'true' : 'false' }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'button[data-choice-button]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const style = HTMLAttributes['data-style'] || 'normal'
    const enabled = HTMLAttributes['data-enabled'] !== 'false'
    const text = HTMLAttributes['data-text'] || '選択肢'
    
    return [
      'button', 
      mergeAttributes(HTMLAttributes, { 
        'data-choice-button': 'true',
        'class': `choice-button choice-${style} ${enabled ? '' : 'choice-disabled'}`,
        'disabled': enabled ? null : 'disabled'
      }), 
      text
    ]
  },

  addCommands() {
    return {
      insertChoiceButton:
        (attrs) => ({ chain }) =>
          chain()
            .insertContent({ 
              type: this.name, 
              attrs: { 
                text: attrs.text ?? '選択肢', 
                targetSceneId: attrs.targetSceneId ?? '',
                style: attrs.style ?? 'normal',
                condition: attrs.condition ?? '',
                enabled: attrs.enabled ?? true
              } 
            })
            .run(),
    }
  },
})
