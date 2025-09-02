# アーキテクチャ概要

最終更新: 2025-09-03

## システム構成

### フロントエンド構成
```
src/
├── components/          # UIコンポーネント
│   ├── ZenIndicator.tsx # Zenモード切替
│   └── ...
├── extensions/          # Tiptapエクステンション
│   ├── choiceButton.ts  # 選択肢機能
│   ├── divider.ts       # 区切り機能
│   └── ...
├── store/              # 状態管理（Zustand）
│   └── useEditorStore.ts
├── styles/             # CSSモジュール
│   ├── base.css        # 基本スタイル
│   ├── editor.css      # エディタ
│   ├── components.css  # コンポーネント
│   ├── extensions.css  # エクステンション
│   ├── wiki.css        # Wikiパネル
│   └── scenes.css      # シーンパネル
└── App.tsx             # メインアプリ
```

### 技術スタック
- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **エディタ**: Tiptap (ProseMirror)
- **状態管理**: Zustand
- **スタイリング**: CSS Modules + CSS Variables

### 主要機能
1. **4ペインレイアウト**: Scene/Editor/Preview/Wiki
2. **Zenモード**: 集中執筆モード
3. **区切り機能**: 5種類のスタイル対応
4. **選択肢機能**: 拡張属性対応
5. **Wiki自動抽出**: NLP解析
6. **リアルタイムプレビュー**: JSON→React変換

### 設計原則
- **モジュラー設計**: 機能別分離
- **単一責任原則**: 各コンポーネントの明確な役割
- **保守性重視**: CSSファイル分離、型安全性
- **ユーザビリティ**: キーボードショートカット、直感的UI
