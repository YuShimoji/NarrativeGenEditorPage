# UML ダイアグラム ガイド

## 概要

このプロジェクトのUMLダイアグラムはPlantUML形式で作成されており、システムの構造と動作を視覚的に理解できます。

## ダイアグラム一覧

### 1. クラス図 (`class-diagram.puml`)
- **目的**: システムの静的構造を表現
- **内容**: 
  - Reactコンポーネント
  - Tiptapエクステンション
  - Zustand状態管理
  - インターフェース・型定義
- **関係**: 継承、依存、使用関係

### 2. コンポーネント図 (`component-diagram.puml`)
- **目的**: システムの物理的構成を表現
- **内容**:
  - フロントエンドアプリケーション
  - 外部ライブラリ
  - CSSモジュール
  - 状態管理層
- **関係**: 依存関係、データフロー

### 3. シーケンス図 (`sequence-diagram.puml`)
- **目的**: 主要な操作フローを表現
- **シナリオ**:
  - エディタでの文章入力
  - Wiki自動抽出プロセス
  - 選択肢挿入操作
  - Zenモード切替
  - シーン切替

### 4. アーキテクチャ図 (`architecture-diagram.puml`)
- **目的**: システム全体のレイヤー構造を表現
- **レイヤー**:
  - プレゼンテーション層
  - ビジネスロジック層
  - 状態管理層
  - データ層
  - スタイリング層

## PlantUML の表示方法

### オンライン表示
1. [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/) にアクセス
2. `.puml`ファイルの内容をコピー&ペースト
3. 「Submit」をクリックして図を生成

### VSCode拡張機能
1. **PlantUML** 拡張機能をインストール
2. `.puml`ファイルを開く
3. `Ctrl+Shift+P` → "PlantUML: Preview Current Diagram"

### ローカル生成
```bash
# PlantUMLをインストール
npm install -g node-plantuml

# 図を生成
puml generate docs/uml/class-diagram.puml -o docs/images/
puml generate docs/uml/component-diagram.puml -o docs/images/
puml generate docs/uml/sequence-diagram.puml -o docs/images/
puml generate docs/uml/architecture-diagram.puml -o docs/images/
```

## 図の更新

システムに変更を加えた際は、対応するUMLダイアグラムも更新してください：

1. **新しいコンポーネント追加** → クラス図、コンポーネント図を更新
2. **新しい操作フロー** → シーケンス図を更新
3. **アーキテクチャ変更** → アーキテクチャ図を更新

## 読み方のポイント

### クラス図
- **実線矢印**: 依存関係
- **点線矢印**: 使用関係
- **三角矢印**: 継承関係

### コンポーネント図
- **矢印**: データフローや依存関係
- **パッケージ**: 論理的なグループ化

### シーケンス図
- **縦線**: オブジェクトの生存期間
- **横矢印**: メッセージ/メソッド呼び出し
- **アクティベーション**: 処理実行期間
