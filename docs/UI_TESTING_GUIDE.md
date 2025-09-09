# UIテスト実行ガイド

## 概要
NarrativeGenEditorPageのUIテストをPlaywrightを使用して実行する方法を説明します。

## テスト環境の準備

### 1. 依存関係のインストール
```bash
cd editor-proto
npm install --save-dev @playwright/test
npx playwright install
```

### 2. 開発サーバーの起動
テスト実行前に開発サーバーを起動してください：
```bash
npm run dev
```

## テスト実行方法

### 基本的なテスト実行
```bash
# すべてのテストを実行
npm run test:e2e

# UIモードでテスト実行（ブラウザで確認しながら）
npm run test:e2e:ui

# デバッグモードでテスト実行
npm run test:e2e:debug

# ブラウザを表示しながらテスト実行
npm run test:e2e:headed
```

### 特定のテストのみ実行
```bash
# レイアウトテストのみ
npx playwright test tests/ui-tests.spec.ts --grep "Responsive Layout"

# パネルテストのみ
npx playwright test tests/ui-tests.spec.ts --grep "Panel Toggle"
```

## テスト対象のUI機能

### 1. レスポンシブレイアウトテスト
- **ウィンドウサイズ変更時の動作確認**
- 768px以下でのパネル自動折りたたみ
- 1200px以下でのプレビュー非表示
- ウィンドウ拡大時のパネル復元

### 2. パネル開閉機能テスト
- **シーンパネル開閉ボタンの動作**
- Wikiパネル開閉ボタンの動作
- Zenモード時のボタン非表示

### 3. 選択肢ボタン操作テスト
- **エディターモーダルの開閉**
- ドラッグ&ドロップでの選択肢作成
- プレビューへの反映確認

### 4. シーン切り替えテスト
- **コンテンツ保持の確認**
- 素早いシーン切り替え時のデータ損失防止
- シーン間移動時の状態維持

### 5. Wikiパネル表示テスト
- **横書き表示の確認**
- 長文テキストの適切な改行
- レスポンシブ対応

### 6. BubbleMenu機能テスト
- **テキスト選択時のツールバー表示**
- 閉じるボタンの動作
- 各種フォーマット機能の動作

## CI/CDでのテスト実行

### GitHub Actionsでの自動テスト
```yaml
# .github/workflows/ui-tests.yml
name: UI Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm run test:e2e
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## テスト結果の確認

### レポートの表示
```bash
# HTMLレポートを表示
npx playwright show-report
```

### スクリーンショットとビデオ
テスト失敗時に自動でキャプチャされるスクリーンショットとビデオを確認：
- `test-results/` ディレクトリに保存

## トラブルシューティング

### テストが失敗する場合
1. **開発サーバーが起動しているか確認**
   ```bash
   npm run dev
   ```

2. **ポートが正しいか確認**
   - テストでは `http://localhost:5173` を使用

3. **ブラウザのインストール確認**
   ```bash
   npx playwright install
   ```

### よくあるエラー
- **Timeoutエラー**: ページ読み込みに時間がかかっている場合
- **Element not found**: CSSセレクタが変更された場合
- **Network error**: 開発サーバーが停止している場合

## テストコードの保守

### 新しいテストの追加
1. `tests/ui-tests.spec.ts` にテストケースを追加
2. 適切な `test.describe` ブロックに配置
3. データ属性を活用した安定したセレクタを使用

### セレクタのベストプラクティス
- データ属性を優先: `[data-testid="choice-editor-modal"]`
- CSSクラスよりdata属性を推奨
- テキストベースのセレクタは最小限に

このテストスイートにより、実機確認が必要なUI機能を継続的に検証し、リグレッションを防ぐことができます。
