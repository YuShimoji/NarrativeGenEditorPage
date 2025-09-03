# Narrative Generation Editor Page

Wiki-Based Story Database System with Tiptap Editor

## 概要

物語創作支援のための包括的エディタシステム。Wikiベースの物語世界データベースと高機能エディタを統合し、没入感のある創作体験を提供します。

## アーキテクチャ

### システム構成図

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[4-Pane Layout]
        B[Zen Mode Toggle]
        C[BubbleMenu]
        D[SlashHints]
    end
    
    subgraph "Business Logic Layer"
        E[Tiptap Editor Core]
        F[Extension System]
        G[Wiki Engine]
    end
    
    subgraph "State Management Layer"
        H[Zustand Stores]
    end
    
    subgraph "Data Layer"
        I[LocalStorage]
        J[IndexedDB]
    end
    
    A --> E
    B --> H
    C --> F
    D --> F
    E --> F
    E --> H
    G --> H
    H --> I
    H --> J
```

### コンポーネント関係図

```mermaid
classDiagram
    class App {
        -editor: Editor
        -zen: boolean
        +getEditorPlainText(): string
        +handleManualSave(): void
    }
    
    class EditorStore {
        -doc: JSONContent
        -html: string
        -zen: boolean
        +setDoc(): void
        +toggleZen(): void
    }
    
    class WikiStore {
        -entries: WikiEntry[]
        +addEntry(): void
        +getRelatedEntries(): WikiEntry[]
    }
    
    class ChoiceButton {
        -text: string
        -style: ChoiceStyle
        +insertChoiceButton(): Command
    }
    
    class AutoWikiExtractor {
        -content: string
        +extractEntities(): WikiSuggestion[]
    }
    
    App --> EditorStore : uses
    App --> WikiStore : uses
    App --> ChoiceButton : uses
    App --> AutoWikiExtractor : contains
    
    ChoiceButton --|> TiptapExtension : extends
```

### システムアーキテクチャ

![Architecture Diagram](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/YuShimoji/NarrativeGenEditorPage/main/docs/uml/architecture-diagram.puml)

## 主要機能

### ✨ エディタ機能
- **4ペインレイアウト**: Scene/Editor/Preview/Wiki の統合表示
- **Zenモード**: 集中執筆モード（`Ctrl+Shift+Z`）
- **区切り機能**: 5種類のスタイル（線、星、点、波、画像）
- **選択肢機能**: 4種類のスタイル（通常、重要、危険、控えめ）
- **リアルタイムプレビュー**: JSON→React変換

### 🔍 Wiki機能
- **自動Wiki抽出**: 日本語NLPによる人名、場所、アイテム、組織の自動抽出
- **タグベース関連項目表示**: エントリ間の関連性を自動表示
- **エディタ連携**: テキスト選択からWikiリンク生成

### 📝 没入感投稿システム
- キャラクター執筆、ルーモア、名言、日記、手紙、ニュースの6種類

## セットアップ

```bash
cd editor-proto
npm install
npm run dev
```

http://localhost:5173 にアクセス

## キーバインド

| キー | 機能 |
|------|------|
| `Ctrl+Shift+Z` | Zenモード切替 |
| `Ctrl+Shift+C` | 選択肢ボタン挿入 |
| `Ctrl+S` | 手動保存 |

## 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **エディタ**: Tiptap (ProseMirror)
- **状態管理**: Zustand
- **スタイリング**: CSS Modules + CSS Variables

## プロジェクト構造

```
src/
├── components/          # UIコンポーネント
│   ├── ZenIndicator.tsx # Zenモード切替
│   ├── Preview.tsx      # プレビューパネル
│   ├── ScenePanel.tsx   # シーンパネル
│   ├── WikiPanel.tsx    # Wikiパネル
│   └── ...
├── extensions/          # Tiptapエクステンション
│   ├── choiceButton.ts  # 選択肢機能
│   ├── divider.ts       # 区切り機能
│   └── ...
├── store/              # 状態管理（Zustand）
│   ├── useEditorStore.ts
│   ├── useSceneStore.ts
│   └── useWikiStore.ts
├── styles/             # CSSモジュール
│   ├── base.css        # 基本スタイル
│   ├── editor.css      # エディタ
│   ├── components.css  # コンポーネント
│   ├── extensions.css  # エクステンション
│   ├── wiki.css        # Wikiパネル
│   └── scenes.css      # シーンパネル
└── App.tsx             # メインアプリ
```

## 操作フロー

### エディタ操作とWiki自動抽出

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant E as Editor
    participant ES as EditorStore
    participant AWE as AutoWikiExtractor
    participant WS as WikiStore
    participant WP as WikiPanel

    U->>A: テキスト入力
    A->>E: editor.on('update')
    E->>ES: setDoc(newDoc)
    E->>ES: setHtml(newHtml)
    ES->>A: state更新通知
    A->>AWE: content更新
    AWE->>AWE: NLP解析実行
    AWE->>AWE: エンティティ抽出
    AWE->>WS: 候補エンティティ送信
    WS->>WP: Wiki候補表示
    U->>WP: Wiki候補を承認
    WP->>WS: addEntry(newEntry)
```

## ドキュメント

- [API ドキュメント](./docs/API_DOCUMENTATION.md)
- [アーキテクチャ概要](./docs/ARCHITECTURE_OVERVIEW.md)
- [UML ダイアグラム](./docs/UML_README.md)
- [DoxyGen ガイド](./docs/README_DOXYGEN.md)
- [開発計画](./docs/DEVELOPMENT_PLAN.md)

## ライセンス

MIT License
