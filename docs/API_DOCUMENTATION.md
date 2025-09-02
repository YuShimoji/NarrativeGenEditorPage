# API ドキュメント

最終更新: 2025-09-03

## Tiptap エクステンション API

### ChoiceButton エクステンション

```typescript
interface ChoiceButtonAttrs {
  text: string           // 選択肢テキスト
  targetSceneId: string  // リンク先シーンID
  style?: 'normal' | 'important' | 'danger' | 'subtle'
  condition?: string     // 表示条件
  enabled?: boolean      // 有効/無効状態
}

// 使用例
editor.chain().insertChoiceButton({
  text: '扉を開ける',
  targetSceneId: 'scene-002',
  style: 'important'
}).run()
```

### Divider エクステンション

```typescript
interface DividerAttrs {
  type: 'line' | 'stars' | 'dots' | 'wave' | 'image'
  imageUrl?: string      // 画像タイプの場合のURL
}

// 使用例
editor.chain().insertDivider({
  type: 'stars'
}).run()
```

## Store API (Zustand)

### EditorStore

```typescript
interface EditorStore {
  // 状態
  zen: boolean
  saveStatus: 'idle' | 'saving' | 'saved'
  
  // アクション
  toggleZen: () => void
  setSaveStatus: (status: SaveStatus) => void
}

// 使用例
const { zen, toggleZen } = useEditorStore()
```

## CSS クラス API

### 区切りスタイル
- `.divider-line` - 線区切り
- `.divider-stars` - 星区切り
- `.divider-dots` - 点区切り
- `.divider-wave` - 波区切り
- `.divider-image` - 画像区切り

### 選択肢スタイル
- `.choice-normal` - 通常選択肢
- `.choice-important` - 重要選択肢
- `.choice-danger` - 危険選択肢
- `.choice-subtle` - 控えめ選択肢
- `.choice-disabled` - 無効選択肢

### Zenモード
- `.app.is-zen` - Zenモード時のレイアウト
