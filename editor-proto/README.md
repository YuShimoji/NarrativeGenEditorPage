# editor-proto

Vite + React + TypeScript + Tiptap の最小プロトタイプです。

## セットアップ
```
npm install
npm run dev
```

http://localhost:5173 にアクセス。

## 機能概要（現状）
- Tiptap StarterKit + Placeholder + Image + カスタムノード `choiceButton`（雛形）
- 選択時 BubbleMenu（Bold/Italic/BulletList）
- プレビュー連動（JSON→React レンダラー: `PreviewJSON` を使用）
- LocalStorage 自動保存/復元（キー: `ngen:html`, `ngen:doc`）
- Zen トグル（Ctrl+Shift+Z でプレビュー表示切替）

## キーバインド
- Ctrl+Shift+Z: ZenモードON/OFF（プレビューの表示/非表示）
- Ctrl+Shift+C: `choiceButton` ノードを挿入

## 既知の注意点
- IDE からのコマンド実行時に承認ダイアログが表示されない場合があります。その際は IDE を再読み込みして再実行し、承認UIが出たら許可してください。ワークアラウンドとして PowerShell で以下のように絶対パスで実行できます。
  - `& "C:\\Program Files\\nodejs\\npm.cmd" ci --no-audit --no-fund --loglevel=warn`
  - `node node_modules/vite/bin/vite.js`
- Node/NPM が未インストールの場合は https://nodejs.org/ から LTS 版を導入してください。
