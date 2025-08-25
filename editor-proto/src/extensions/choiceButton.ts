import { Node, mergeAttributes } from '@tiptap/core'

export interface ChoiceButtonAttrs {
  text: string
  targetSceneId: string
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
    }
  },

  parseHTML() {
    return [{ tag: 'button[data-choice-button]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['button', mergeAttributes(HTMLAttributes, { 'data-choice-button': 'true' }), HTMLAttributes['data-text'] || '選択肢']
  },

  addCommands() {
    return {
      insertChoiceButton:
        (attrs) => ({ chain }) =>
          chain()
            .insertContent({ type: this.name, attrs: { text: attrs.text ?? '選択肢', targetSceneId: attrs.targetSceneId ?? '' } })
            .run(),
    }
  },
})
