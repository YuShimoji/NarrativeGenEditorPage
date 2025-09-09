import { test, expect } from '@playwright/test'

test.describe('NarrativeGenEditorPage - Layout and UI Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle')
  })

  test.describe('Responsive Layout', () => {
    test('should collapse panels on small screens', async ({ page }) => {
      // ビューポートを小さく設定
      await page.setViewportSize({ width: 768, height: 1024 })

      // シーンパネルが折りたたまれていることを確認
      const scenePanel = page.locator('.pane-scene')
      await expect(scenePanel).toHaveClass(/collapsed/)

      // Wikiパネルも折りたたまれていることを確認
      const wikiPanel = page.locator('.pane-wiki')
      await expect(wikiPanel).toHaveClass(/collapsed/)
    })

    test('should hide preview panel on medium screens', async ({ page }) => {
      // ビューポートを中サイズに設定
      await page.setViewportSize({ width: 1200, height: 800 })

      // プレビューパネルが非表示になっていることを確認
      const previewPanel = page.locator('.pane-preview')
      await expect(previewPanel).toHaveClass(/display: none/)
    })

    test('should restore panels when expanding window', async ({ page }) => {
      // 最初に小さいサイズで開く
      await page.setViewportSize({ width: 768, height: 1024 })

      // 大きく戻す
      await page.setViewportSize({ width: 1400, height: 900 })

      // パネルが復元されていることを確認
      const scenePanel = page.locator('.pane-scene')
      await expect(scenePanel).not.toHaveClass(/collapsed/)

      const wikiPanel = page.locator('.pane-wiki')
      await expect(wikiPanel).not.toHaveClass(/collapsed/)
    })
  })

  test.describe('Panel Toggle Functionality', () => {
    test('should toggle scene panel', async ({ page }) => {
      // シーンパネル開閉ボタンをクリック
      const sceneToggle = page.locator('.scene-toggle')
      await sceneToggle.click()

      // パネルが折りたたまれることを確認
      const scenePanel = page.locator('.pane-scene')
      await expect(scenePanel).toHaveClass(/collapsed/)

      // 再クリックで復元
      await sceneToggle.click()
      await expect(scenePanel).not.toHaveClass(/collapsed/)
    })

    test('should toggle wiki panel', async ({ page }) => {
      // Wikiパネル開閉ボタンをクリック
      const wikiToggle = page.locator('.wiki-toggle')
      await wikiToggle.click()

      // パネルが折りたたまれることを確認
      const wikiPanel = page.locator('.pane-wiki')
      await expect(wikiPanel).toHaveClass(/collapsed/)

      // 再クリックで復元
      await wikiToggle.click()
      await expect(wikiPanel).not.toHaveClass(/collapsed/)
    })

    test('should hide toggles in zen mode', async ({ page }) => {
      // Zenモードを有効化（Ctrl+Shift+Z）
      await page.keyboard.press('Control+Shift+Z')

      // 開閉ボタンが非表示になっていることを確認
      const sceneToggle = page.locator('.scene-toggle')
      const wikiToggle = page.locator('.wiki-toggle')

      await expect(sceneToggle).toBeHidden()
      await expect(wikiToggle).toBeHidden()
    })
  })

  test.describe('Choice Button Interactions', () => {
    test('should open choice button editor', async ({ page }) => {
      // 選択肢ボタンをクリックしてエディタを開く
      await page.click('text=選択肢')

      // モーダルが開いていることを確認
      const modal = page.locator('[data-testid="choice-editor-modal"]')
      await expect(modal).toBeVisible()
    })

    test('should create choice button with drag and drop', async ({ page }) => {
      // シーンリストからシーンをドラッグ
      const sceneItem = page.locator('.scene-item').first()
      const choiceEditor = page.locator('.choice-button-editor')

      // ドラッグ&ドロップ操作をシミュレート
      await sceneItem.dragTo(choiceEditor)

      // 選択肢が作成されたことを確認
      const choiceButton = page.locator('.choice-button').last()
      await expect(choiceButton).toBeVisible()
    })

    test('should display choice button in preview', async ({ page }) => {
      // 選択肢ボタンを作成
      await page.click('text=選択肢')
      await page.fill('[data-testid="choice-text"]', 'テスト選択肢')
      await page.click('[data-testid="save-choice"]')

      // プレビューに表示されていることを確認
      const previewChoice = page.locator('.preview-json .choice-button')
      await expect(previewChoice).toContainText('テスト選択肢')
    })
  })

  test.describe('Scene Switching', () => {
    test('should preserve content when switching scenes', async ({ page }) => {
      // エディタにテキストを入力
      const editor = page.locator('.ProseMirror')
      await editor.fill('テストコンテンツ')

      // シーンを切り替え
      await page.click('.scene-selector')
      await page.click('.scene-option:nth-child(2)')

      // 別のシーンに切り替え
      await page.click('.scene-selector')
      await page.click('.scene-option:first-child')

      // コンテンツが保持されていることを確認
      await expect(editor).toContainText('テストコンテンツ')
    })

    test('should not lose content on rapid scene switching', async ({ page }) => {
      // コンテンツを入力
      const editor = page.locator('.ProseMirror')
      await editor.fill('重要なコンテンツ')

      // 素早くシーンを切り替え
      for (let i = 0; i < 3; i++) {
        await page.click('.scene-selector')
        await page.click(`.scene-option:nth-child(${i + 1})`)
        await page.waitForTimeout(100)
      }

      // コンテンツが保持されていることを確認
      await expect(editor).toContainText('重要なコンテンツ')
    })
  })

  test.describe('Wiki Panel Display', () => {
    test('should display wiki entries horizontally', async ({ page }) => {
      // Wikiパネルのスタイルを確認
      const wikiPanel = page.locator('.wiki-panel')
      const computedStyle = await wikiPanel.evaluate(el => window.getComputedStyle(el))

      expect(computedStyle.writingMode).toBe('horizontal-tb')
      expect(computedStyle.textOrientation).toBe('mixed')
    })

    test('should handle long text properly', async ({ page }) => {
      // 長いテキストを含むWikiエントリがある場合の表示を確認
      const wikiEntries = page.locator('.wiki-entry-item')
      const longTextEntry = wikiEntries.filter({ hasText: /.{100,}/ }).first()

      if (await longTextEntry.count() > 0) {
        const overflowWrap = await longTextEntry.evaluate(el =>
          window.getComputedStyle(el).overflowWrap
        )
        expect(overflowWrap).toBe('break-word')
      }
    })
  })

  test.describe('Bubble Menu Functionality', () => {
    test('should show bubble menu on text selection', async ({ page }) => {
      // エディタにテキストを入力
      const editor = page.locator('.ProseMirror')
      await editor.fill('テストテキスト')

      // テキストを選択
      await page.keyboard.press('Control+A')

      // BubbleMenuが表示されていることを確認
      const bubbleMenu = page.locator('.bubble-menu')
      await expect(bubbleMenu).toBeVisible()
    })

    test('should close bubble menu on blur', async ({ page }) => {
      // テキストを選択してBubbleMenuを表示
      const editor = page.locator('.ProseMirror')
      await editor.fill('テストテキスト')
      await page.keyboard.press('Control+A')

      // 閉じるボタンをクリック
      await page.click('.bubble-close')

      // BubbleMenuが非表示になっていることを確認
      const bubbleMenu = page.locator('.bubble-menu')
      await expect(bubbleMenu).not.toBeVisible()
    })
  })
})
