# 開発計画（MVP）

## ゴール
- Zenモード/最小UIのエディタでノベルを編集し、同スキーマでリアルタイムプレビュー。

## スコープ（MVP）
- 基盤: React + Vite + TS, Tiptap, Zustand
- エディタ: paragraph, bold/italic, image, video, Slash（/image, /video, /choice, /scene-break, /anim）
- カスタム: choice_buttonノード、text_animationマーク
- UI: Zenモード（Ctrl+K: コマンドパレット、選択時BubbleMenu）
- プレビュー: 同期表示（Tiptap JSON→Reactレンダラー）
- 永続化: LocalStorageオートセーブ

## 里程標（Milestones）
- M1: プロト環境整備（Vite/React/TS、Tailwind）
- M2: Tiptap基盤 + 基本Marks/Nodes
- M3: Slash/Bubbleメニュー + Zenモード
- M4: カスタムchoice_button + text_animation
- M5: リアルタイムプレビュー
- M6: LocalStorage永続化
- M7: 簡易シーンフロー（React Flow）同期
- M8: 手動E2E/ドキュメント整備

## 手動テスト手順（MVP）
1) 起動: `npm run dev`（エディタアプリ）
2) Zenトグル: `Ctrl+Shift+Z` でプレビューの表示/非表示を切替（初期はZen=オンでプレビュー非表示）
3) 入力: 段落作成、bold/italicを適用 → プレビュー反映
4) /image で画像挿入（ローカルURL） → プレビュー表示
5) /choice で選択肢ボタン追加（text/targetSceneId） → Flowにノード/エッジ生成
6) /anim でテキストアニメ設定（type=fade, duration） → プレビューで再生
7) Zen: Ctrl+Kでコマンドパレット、未操作時はUI非表示（将来対応）
8) リロード: LocalStorageから自動復元

## 受け入れ基準
- 編集操作がプレビューへ100ms以内に反映
- choice_buttonのtargetSceneIdがFlowと整合
- UIは未操作5秒で最小表示（Zen）
- リロードでドキュメントが復元

## 今後の拡張
- メディアアップロードAPI、S3等
- シーン間条件分岐、変数/フラグ
- Playwrightで自動E2E

## 進捗ログ（タイムスタンプ）
- 2025-08-24: editor-proto にて以下を実装
  - Zustandストア（`doc`/`html`/`zen`）
  - `App.tsx` にエディタ↔プレビュー同期、BubbleMenu、Placeholder、Image拡張、ローカルストレージ保存/復元、Zenトグル（Ctrl+Shift+Z）
  - `Preview` コンポーネント追加、`index.css` で2ペイン/Zenスタイル
  - 依存追加（`@tiptap/*` 拡張、`zustand`）
- 2025-08-25: 継続対応
  - JSONプレビューRenderer（`PreviewJSON.tsx`）を追加し、`Preview.tsx` を置換
  - カスタムノード `choiceButton` 雛形（`src/extensions/choiceButton.ts`）を作成し `App.tsx` の extensions に組込み
  - キーバインド追加: `Ctrl+Shift+C` で `choiceButton` 挿入
  - `.npmrc` を追加（`fund=false`, `audit=false`, `progress=false`, `loglevel=warn`）
  - npm 承認バナー問題の回避策: 絶対パスで `npm.cmd`/`node.exe` を呼び出す

## 本セッションの簡易テスト手順（暫定）
1) サーバ起動: `node node_modules/vite/bin/vite.js`（IDE から実行。承認が出たら許可）
2) 文章入力: 段落作成、bold/italic を適用 → 右ペインに即時反映（JSONレンダラ）
3) 画像: `/image`（実装中、既存の Image ノードはメニュー等で挿入可）
4) 選択肢: `Ctrl+Shift+C` で `choiceButton` ノード挿入 → プレビューのボタンが表示
5) Zen: `Ctrl+Shift+Z` でプレビューの表示/非表示を切替
6) リロード: LocalStorage から自動復元（`ngen:doc`/`ngen:html`)
