# DoxyGen ドキュメント生成ガイド

## 概要

このプロジェクトではDoxyGenを使用してTypeScript/Reactコードベースの包括的なドキュメントを生成します。

## 前提条件

DoxyGenをインストールしてください：

### Windows
```bash
# Chocolateyを使用
choco install doxygen.install

# または公式サイトからダウンロード
# https://www.doxygen.nl/download.html
```

### macOS
```bash
brew install doxygen
```

### Linux
```bash
sudo apt-get install doxygen
# または
sudo yum install doxygen
```

## ドキュメント生成手順

1. **プロジェクトルートディレクトリに移動**
   ```bash
   cd "c:\Users\thank\Storage\Media Contents Projects\NarrativeGenEditorPage"
   ```

2. **DoxyGenドキュメント生成**
   ```bash
   doxygen Doxyfile
   ```

3. **生成されたドキュメントの確認**
   ```bash
   # HTMLドキュメントを開く
   start docs/doxygen/html/index.html
   ```

## 設定の特徴

- **言語**: 日本語出力
- **対象ファイル**: TypeScript (.ts, .tsx), JavaScript (.js, .jsx), Markdown (.md)
- **除外**: node_modules, dist, build ディレクトリ
- **ソースブラウザ**: 有効
- **検索機能**: 有効
- **クラス図**: 有効

## コメント記述規則

TypeScript/JSXファイルでのDoxyGenコメント例：

```typescript
/**
 * @brief エディタの状態を管理するZustandストア
 * @details Tiptapエディタの文書状態、HTML、Zenモードを管理
 */
interface EditorStore {
  /** @brief JSON形式の文書内容 */
  doc: JSONContent
  
  /** @brief HTML形式の文書内容 */
  html: string
  
  /** @brief Zenモードの有効/無効状態 */
  zen: boolean
  
  /**
   * @brief 文書内容を設定
   * @param doc JSON形式の新しい文書内容
   */
  setDoc: (doc: JSONContent) => void
  
  /**
   * @brief Zenモードを切り替え
   * @return なし
   */
  toggleZen: () => void
}
```

## 生成されるドキュメント

- **クラス/インターフェース一覧**
- **関数/メソッド詳細**
- **ファイル構造**
- **依存関係図**
- **検索可能なAPI リファレンス**

## カスタマイズ

`Doxyfile`を編集して以下をカスタマイズ可能：
- 出力形式（HTML, LaTeX, XML等）
- 含める/除外するファイル
- 図表生成オプション
- スタイル設定
