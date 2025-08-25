# ADR-001: Editor基盤の技術選定

- Status: Proposed
- Date: 2025-08-24

## 背景 / Context
- 目標: 「Zenモード」「最小UI（動的表示）」「画像/動画/装飾/選択肢ボタン等のカスタム要素」「リアルタイムプレビュー」を備えたノベル用エディタを構築。
- 現状: 既存Editorは更新でUIが崩れやすく、プレビューが分離。拡張性・一貫性の高い基盤が必要。

## 決定 / Decision
- Editor基盤: Tiptap（ProseMirrorベース、ヘッドレス）
- UIフレームワーク: React + Vite + TypeScript
- 状態管理: Zustand（グローバル最小、疎結合）
- シーンフロー: React Flow（ノード/エッジ編集）
- アニメーション: Framer Motion（テキスト演出）
- コマンドパレット: cmdk（Ctrl+K）
- スタイル: Tailwind CSS + Radix Primitives

## 根拠 / Rationale
- Tiptap: ヘッドレスでUIを自由設計可能。BubbleMenu/FloatingMenu/Slash等の拡張が成熟。カスタムノード/マーク実装が比較的容易。
- React: 既存知見・エコシステム・型安全（TS）・Viteで起動高速。
- Zustand: シンプルなAPIでEditor/Preview/Flow間の同期を実装しやすい。

## 代替案 / Alternatives
- Slate.js: 高い拡張性だが基本機能から実装量が増えがち。
- Lexical: 近代的で軽量だが、ProseMirror系資産（Tiptap拡張）活用が難しい。
- Editor.js: ブロックエディタ志向で、インライン演出やマークの表現がやや不向き。
- 生ProseMirror: 柔軟だが学習/実装コストが高い。

## トレードオフ / Trade-offs
- Tiptapは内部がProseMirrorのため概念学習が必要。
- 豊富な拡張により依存が増えるため、必要最小限（YAGNI）で導入開始。

## 影響 / Consequences
- カスタム要素（例: choice_buttonノード、text_animationマーク）を統一スキーマで管理。Preview/Flowは同スキーマJSONから描画。
- ZenモードはUI分離により実装容易（コマンドパレット・BubbleMenuを状況表示）。

## 実装メモ / Implementation Notes
- packages/apps構成 or static配下に独立Viteアプリ。初期はLocalStorage永続化→将来DB/S3。
- メディアアップロードは当初ローカル参照→後にAPI連携。

## テスト / Testing
- 手動E2E: 入力→装飾→選択肢追加→プレビュー同期→シーン遷移確認。
- 追ってPlaywrightで回帰テスト化（キーバインド、Slash、BubbleMenu）。
