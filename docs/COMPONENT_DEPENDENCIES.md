# コンポーネント依存関係

## 概要
- Editor（Tiptap）: ドキュメント編集、Slash/Bubbleメニュー、カスタムノード/マーク。
- PreviewRenderer: Tiptap JSONスキーマからゲーム表示用にレンダリング。
- SceneFlow（React Flow）: シーンノード/エッジ編集、エディタの選択肢とnodeId連携。
- Schema: ドキュメントスキーマ（paragraph, image, video, choice_button, scene_break, marks: bold/italic/text_animation）。
- State（Zustand）: Editor/Preview/Flowの同期ストア。
- StorageService: LocalStorage/将来API永続化。
- MediaService: 画像/動画の取り回し（ローカル→将来アップロード）。

## 依存関係図
```mermaid
flowchart LR
  subgraph Editor[Tiptap Editor]
    E1[Core] --> E2[SlashCommands]
    E1 --> E3[Bubble/Floating Menu]
    E1 --> E4[Custom Nodes/Marks]
  end

  subgraph App
    S[State (Zustand)]
    PR[PreviewRenderer]
    SF[SceneFlow (React Flow)]
    ST[StorageService]
    MS[MediaService]
  end

  Editor -->|doc JSON| S
  S --> PR
  S --> SF
  Editor --> MS
  Editor --> ST
  PR --> MS
  SF --> S
```

## データフロー（要点）
1. Editorのトランザクションでdoc JSONが更新 → Stateに反映。
2. PreviewRendererがdoc JSONを購読して即時レンダリング。
3. choice_buttonノードの`targetSceneId`とSceneFlowノードIDを対応付け。

## 分離方針（SoC）
- Editorは編集専用。描画ロジック（Preview）は独立。
- スキーマは単一ソース。Editor/Preview/Flowで共有。
- 永続化/メディアはサービス層で抽象化（DIP）。
