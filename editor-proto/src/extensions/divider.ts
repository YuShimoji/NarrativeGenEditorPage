import { Node, mergeAttributes } from '@tiptap/core'

export interface DividerAttrs {
  type: 'line' | 'stars' | 'dots' | 'wave' | 'image'
  style?: string
  imageUrl?: string
  customText?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    divider: {
      insertDivider: (attrs?: Partial<DividerAttrs>) => ReturnType
    }
  }
}

export const Divider = Node.create({
  name: 'divider',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      type: {
        default: 'line',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-type') || 'line',
        renderHTML: (attrs) => ({ 'data-type': attrs.type }),
      },
      style: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-style') || '',
        renderHTML: (attrs) => ({ 'data-style': attrs.style }),
      },
      imageUrl: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-image-url') || '',
        renderHTML: (attrs) => ({ 'data-image-url': attrs.imageUrl }),
      },
      customText: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-custom-text') || '',
        renderHTML: (attrs) => ({ 'data-custom-text': attrs.customText }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-divider]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes['data-type'] || 'line'
    const imageUrl = HTMLAttributes['data-image-url']
    const customText = HTMLAttributes['data-custom-text']
    
    let content = ''
    
    if (type === 'image' && imageUrl) {
      content = `<img src="${imageUrl}" alt="区切り画像" />`
    } else if (customText) {
      content = customText
    } else {
      const dividerContent = {
        line: '────────',
        stars: '✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦',
        dots: '• • • • • • • • •',
        wave: '～～～～～～～～～'
      }
      content = dividerContent[type as keyof typeof dividerContent] || dividerContent.line
    }
    
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-divider': 'true',
        'class': `divider divider-${type}`,
      }),
      content
    ]
  },

  addCommands() {
    return {
      insertDivider:
        (attrs) => ({ chain }) =>
          chain()
            .insertContent({ 
              type: this.name, 
              attrs: { 
                type: attrs?.type ?? 'line',
                style: attrs?.style ?? '',
                imageUrl: attrs?.imageUrl ?? '',
                customText: attrs?.customText ?? ''
              } 
            })
            .run(),
    }
  },
})
