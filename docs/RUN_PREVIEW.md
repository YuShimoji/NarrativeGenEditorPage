# プレビュー起動手順（最短・安定）

最終更新: 2025-08-27

本手順は「ダブルクリックで起動・停止」を最優先に簡素化しています。IDEの承認や複数系統のフォールバック操作は不要です。

## 使うファイル
- 起動（ビルド込み）: `editor-proto/scripts/preview-build-start.cmd`
- 起動（ビルドなし）: `editor-proto/scripts/preview-start.cmd`
- 前面起動（デバッグ用）: `editor-proto/scripts/preview-start-foreground.cmd`
- 停止: `editor-proto/scripts/preview-stop.cmd`

既定ポート: 5194

## 起動（推奨: ビルド込み）
1. エクスプローラーで `editor-proto/scripts/preview-build-start.cmd` をダブルクリック
2. 自動で以下が実行されます
   - Viteビルド → 既存プロセス停止 → 簡易HTTPサーバー起動（5194） → 既定ブラウザで `http://127.0.0.1:5194` を開く
3. ヘルスチェック（任意）: `http://127.0.0.1:5194/healthz` → `ok` が表示されれば稼働中

## 前面起動（デバッグ用）
1. `editor-proto/scripts/preview-start-foreground.cmd` をダブルクリック
2. コンソールに次の行が出れば起動成功です
   - `[serve-simple] listening on http://127.0.0.1:5194 (serving dist/)`
3. 任意の疎通確認（PowerShell）
   ```powershell
   try {
     $r = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:5194/healthz'
     $r.StatusCode; $r.Content  # 期待: 200 と ok
   } catch { $_.Exception.Message }
   ```
4. 補助確認（LISTEN状態）
   ```powershell
   Get-NetTCPConnection -LocalPort 5194 -State Listen
   ```

## 停止
1. `editor-proto/scripts/preview-stop.cmd` をダブルクリック（引数なしで5194を停止）

## 変更の反映
- コードを修正したら、もう一度 `preview-build-start.cmd` をダブルクリック（再ビルド→再起動）
- 変更がない場合の再起動は、`preview-start.cmd` でOK

## 手動テスト（MVP）
1. エディタで段落入力し、Bold/Italic を適用 → 右ペイン（JSONレンダラ `src/components/PreviewJSON.tsx`）に反映
2. Zenトグル: Ctrl+Shift+Z（`src/store/useEditorStore.ts` の `zen`）。右上に「Zen: ON/OFF」インジケータ表示。インジケータをクリックでも切替可能。
   - Zen OFF のときは 2 ペイン表示（左: Editor / 右: Preview）。Zen ON のときはプレビュー非表示。
   - Zen OFF のとき、各ペインの左上に小さなラベル（Editor/Preview）が表示されます（`src/index.css` の `.pane-title`）。
3. 選択肢: Ctrl+Shift+C → `choiceButton` ノード挿入（`src/extensions/choiceButton.ts`）
4. Slashコマンド（Space または Enter で発火）:
    - 画像: `"/image <URL>"` または `"/image"` → プロンプトでURL → 画像ノード挿入
    - 選択肢: `"/choice <ラベル>"` または `"/choice"` → プロンプトでラベル → `choiceButton` ノード挿入
   - メモ: Space と Enter を連打したときの二重挿入を抑止する短時間ガードを実装済み（`src/extensions/slashCommands.ts`）。
   - サジェストUI: 段落先頭で `/` を入力すると候補ポップアップが表示されます（`src/components/SlashHints.tsx`）。
     - ↑/↓ で選択、Enter または クリックで確定できます。
     - 候補: `/image`, `/choice`。確定後は必要に応じてプロンプトが出ます。
     - 既存の Space/Enter 発火とも並存します。
5. リロード → LocalStorage 復元（`ngen:doc`/`ngen:html`）

## トラブルシュート（必要時のみ）
- 5194が使用中: `preview-stop.cmd` を実行 → 再度 `preview-build-start.cmd`
- 別ポートを使いたい: `preview-*.cmd` の `PORT` 変数を書き換え
- ブラウザが開かない: アドレスバーに `http://127.0.0.1:5194` を手入力
 - コンソールに `Could not establish connection. Receiving end does not exist.` が出る:
   - ブラウザ拡張（例: 共有・翻訳・スクショ系）が発している場合があります。アプリ動作には無関係なので無視するか、拡張を一時的に無効化してください。
   - アプリ側のエラーは、スタックトレースに `src/` 下のファイルが出るものを対象に確認します。
