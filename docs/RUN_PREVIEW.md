# プレビュー起動手順（安定運用版）

最終更新: 2025-08-26

## 方針
- 開発サーバー（HMR付き）は環境依存で終了/切断する場合があるため、まずは静的配信で安定表示を優先します。
- 本手順は Windows 環境で Node と npm の絶対パス呼び出しを前提にしています。

## 1) 依存とビルド
- 依存復元（必要時）
  - `"C:\\Program Files\\nodejs\\npm.cmd" ci`
- ビルド
  - `"C:\\Program Files\\nodejs\\node.exe" .\\node_modules\\vite\\bin\\vite.js build --clearScreen false`

## 2) 安定プレビュー（推奨）
- 簡易HTTPサーバー（依存なし）
  - npm スクリプト: `npm run serve:simple`（`package.json` の `scripts.serve:simple`）
  - 既定ポート: 5192
  - ヘルスチェック: `http://127.0.0.1:5192/healthz`
  - 配信元: `editor-proto/dist/`（存在すれば）

- Vite の静的プレビュー
  - 例: `"C:\\Program Files\\nodejs\\node.exe" .\\node_modules\\vite\\bin\\vite.js preview --host 0.0.0.0 --port 5180 --clearScreen false`

## 3) 開発サーバー（必要に応じて）
- 例: `"C:\\Program Files\\nodejs\\node.exe" .\\node_modules\\vite\\bin\\vite.js --host 127.0.0.1 --port 5175 --strictPort --clearScreen false`
- 切断が発生する場合は静的プレビューに切り替えてください。

## 4) 手動テスト（MVP）
1. 起動後、エディタで段落入力、Bold/Italic → 右ペインに反映（JSONレンダラー `src/components/PreviewJSON.tsx`）。
2. Zenトグル: Ctrl+Shift+Z（`src/store/useEditorStore.ts` の `zen`）。
3. 選択肢: Ctrl+Shift+C → `choiceButton` ノード挿入（`src/extensions/choiceButton.ts`）。
4. リロード → LocalStorage 復元（`ngen:doc`/`ngen:html`）。

## 5) トラブルシュート
- ブラウザが直ちに閉じる: 開発サーバーではなく静的プレビュー（5180/5192）を使用。
- 到達不可: 別ポートに切り替え（例: 5178/5180/5192/5195）。
- 変更が反映されない: 静的配信時は再ビルドが必要（2)→ビルドを再実行）。
